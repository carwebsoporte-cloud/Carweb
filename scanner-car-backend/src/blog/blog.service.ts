import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BlogInput {
  slug?: string;
  tag?: string;
  coverUrl?: string;
  published?: boolean;
  date?: string;
  titleEs?: string;
  excerptEs?: string;
  bodyEs?: string;
  titleEn?: string;
  excerptEn?: string;
  bodyEn?: string;
}

/** Convierte un texto en un slug URL-friendly (sin acentos ni símbolos).
 *  Elimina las marcas diacríticas combinantes (U+0300–U+036F) por código de
 *  carácter para no depender de un rango literal en el regex. */
function slugify(text: string): string {
  const decomposed = (text || '').normalize('NFD');
  let out = '';
  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x300 && code <= 0x36f) continue; // tilde/acento combinante
    out += ch;
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  /** Artículos publicados (público), más recientes primero. */
  findPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
    });
  }

  /** Un artículo publicado por slug (público). */
  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { slug, published: true } });
    if (!post) throw new NotFoundException('Artículo no encontrado');
    return post;
  }

  /** Todos los artículos (panel admin), más recientes primero. */
  findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
  }

  async create(data: BlogInput) {
    const slug = await this.uniqueSlug(data.slug?.trim() || slugify(data.titleEs || 'articulo'));
    return this.prisma.blogPost.create({
      data: {
        slug,
        tag: data.tag?.trim() || 'OBD2',
        coverUrl: data.coverUrl?.trim() || '',
        published: data.published ?? true,
        date: data.date ? new Date(data.date) : new Date(),
        titleEs: data.titleEs?.trim() || 'Sin título',
        excerptEs: data.excerptEs?.trim() || '',
        bodyEs: data.bodyEs ?? '',
        titleEn: data.titleEn?.trim() || '',
        excerptEn: data.excerptEn?.trim() || null,
        bodyEn: data.bodyEn ?? null,
      },
    });
  }

  async update(id: number, data: BlogInput) {
    await this.ensureExists(id);
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: slugify(data.slug) || undefined }),
        ...(data.tag !== undefined && { tag: data.tag.trim() || 'OBD2' }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl.trim() }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.titleEs !== undefined && { titleEs: data.titleEs.trim() }),
        ...(data.excerptEs !== undefined && { excerptEs: data.excerptEs.trim() }),
        ...(data.bodyEs !== undefined && { bodyEs: data.bodyEs }),
        ...(data.titleEn !== undefined && { titleEn: data.titleEn.trim() }),
        ...(data.excerptEn !== undefined && { excerptEn: data.excerptEn.trim() || null }),
        ...(data.bodyEn !== undefined && { bodyEn: data.bodyEn || null }),
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: number) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Artículo no encontrado');
  }

  /** Garantiza un slug único añadiendo un sufijo si ya existe. */
  private async uniqueSlug(base: string): Promise<string> {
    const root = base || 'articulo';
    let slug = root;
    let i = 2;
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${root}-${i++}`;
    }
    return slug;
  }
}
