import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdPlan } from '@prisma/client';

export interface AdInput {
  businessName?: string;
  imageUrl?: string;
  whatsapp?: string;
  phone?: string;
  link?: string;
  plan?: string;
  active?: boolean;
}

/** Prioridad de aparición: Premium primero, luego Pro, luego Básico */
const RANK: Record<AdPlan, number> = { PREMIUM: 0, PRO: 1, BASICO: 2 };

function toPlan(p?: string): AdPlan {
  const up = (p || '').toUpperCase();
  if (up === 'PREMIUM') return AdPlan.PREMIUM;
  if (up === 'PRO') return AdPlan.PRO;
  return AdPlan.BASICO;
}

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  /** Anuncios activos, ordenados por plan (Premium → Pro → Básico) y antigüedad */
  async findActive() {
    const ads = await this.prisma.advertisement.findMany({ where: { active: true } });
    return ads.sort(
      (a, b) => RANK[a.plan] - RANK[b.plan] || a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  /** Todos los anuncios (panel admin) */
  findAll() {
    return this.prisma.advertisement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: AdInput) {
    return this.prisma.advertisement.create({
      data: {
        businessName: data.businessName?.trim() || 'Sin nombre',
        imageUrl: data.imageUrl?.trim() || '',
        whatsapp: clean(data.whatsapp),
        phone: clean(data.phone),
        link: data.link?.trim() || null,
        plan: toPlan(data.plan),
        active: data.active ?? true,
      },
    });
  }

  async update(id: number, data: AdInput) {
    await this.ensureExists(id);
    return this.prisma.advertisement.update({
      where: { id },
      data: {
        ...(data.businessName !== undefined && { businessName: data.businessName.trim() }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
        ...(data.whatsapp !== undefined && { whatsapp: clean(data.whatsapp) }),
        ...(data.phone !== undefined && { phone: clean(data.phone) }),
        ...(data.link !== undefined && { link: data.link?.trim() || null }),
        ...(data.plan !== undefined && { plan: toPlan(data.plan) }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.advertisement.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: number) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado');
  }
}

/** Deja solo dígitos (para WhatsApp/teléfono) o null si queda vacío */
function clean(v?: string): string | null {
  if (!v) return null;
  const digits = v.replace(/[^\d]/g, '');
  return digits.length ? digits : null;
}
