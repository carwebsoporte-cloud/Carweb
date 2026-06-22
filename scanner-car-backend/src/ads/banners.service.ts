import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdSlot } from '@prisma/client';

export interface BannerInput {
  title?: string;
  slot?: string;
  imageUrl?: string;
  link?: string;
  active?: boolean;
}

function toSlot(s?: string): AdSlot {
  const up = (s || '').toUpperCase();
  if (up === 'LEFT') return AdSlot.LEFT;
  if (up === 'RIGHT') return AdSlot.RIGHT;
  return AdSlot.BOTTOM;
}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  /** Banners activos (público). El frontend decide qué posición pintar. */
  findActive() {
    return this.prisma.adBanner.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Todos los banners (panel admin) */
  findAll() {
    return this.prisma.adBanner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: BannerInput) {
    return this.prisma.adBanner.create({
      data: {
        title: data.title?.trim() || '',
        slot: toSlot(data.slot),
        imageUrl: data.imageUrl?.trim() || '',
        link: data.link?.trim() || '',
        active: data.active ?? true,
      },
    });
  }

  async update(id: number, data: BannerInput) {
    await this.ensureExists(id);
    return this.prisma.adBanner.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.slot !== undefined && { slot: toSlot(data.slot) }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
        ...(data.link !== undefined && { link: data.link.trim() }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.adBanner.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: number) {
    const banner = await this.prisma.adBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner no encontrado');
  }
}
