import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LOCALE = 'es';

const MANUFACTURER_SELECT = {
  select: { id: true, slug: true, name: true, isGeneric: true },
};

type TranslationRow = {
  locale: string;
  title: string;
  description: string | null;
  symptoms?: string | null;
  causes?: string | null;
  solutions?: string | null;
};

// Divide una lista en texto (formato del seed: numerada "1. ... 2. ..." o
// separada por comas) en items individuales. Réplica de la lógica del seed
// para que el contenido traducido se trocee igual que el base.
function splitListText(text: string): string[] {
  const byNumber = text.split(/\d+\.\s+/).map((s) => s.trim()).filter((s) => s.length > 2);
  const items = byNumber.length > 1 ? byNumber : text.split(',').map((s) => s.trim()).filter((s) => s.length > 2);
  return items.map((s) => s.replace(/\.$/, '').trim()).filter(Boolean);
}

// Convierte una lista de texto traducida al shape { id, <key> } que ya consume
// el frontend. El id es sintético (clave de render); el contenido viene del
// idioma pedido.
function toEntries<K extends string>(text: string | null | undefined, key: K): Array<{ id: number } & Record<K, string>> {
  if (!text) return [];
  return splitListText(text).map((value, i) => ({ id: i + 1, [key]: value }) as { id: number } & Record<K, string>);
}

@Injectable()
export class ObdCodesService {
  constructor(private prisma: PrismaService) {}

  // El id del fabricante centinela (genérico) se resuelve una vez y se cachea.
  private genericIdCache: number | null = null;
  private async genericId(): Promise<number> {
    if (this.genericIdCache != null) return this.genericIdCache;
    const m = await this.prisma.manufacturer.findFirst({ where: { isGeneric: true } });
    this.genericIdCache = m?.id ?? 1;
    return this.genericIdCache;
  }

  // Include para vistas de listado/búsqueda. Solo trae traducciones si el
  // locale pedido no es el base (es), para no penalizar el caso por defecto.
  private listInclude(locale: string) {
    return {
      category: true,
      manufacturer: MANUFACTURER_SELECT,
      ...(locale !== DEFAULT_LOCALE
        ? { translations: { where: { locale }, select: { locale: true, title: true, description: true } } }
        : {}),
    };
  }

  // Include para la vista de detalle (síntomas/causas/soluciones + compat).
  private detailInclude(locale: string) {
    return {
      category: true,
      manufacturer: MANUFACTURER_SELECT,
      symptoms: { select: { id: true, symptom: true } },
      causes: { select: { id: true, cause: true } },
      solutions: { select: { id: true, solution: true } },
      vehicleCompat: { include: { vehicleType: { select: { id: true, type: true, name: true } } } },
      ...(locale !== DEFAULT_LOCALE
        ? {
            translations: {
              where: { locale },
              select: { locale: true, title: true, description: true, symptoms: true, causes: true, solutions: true },
            },
          }
        : {}),
    };
  }

  // Superpone la traducción del locale pedido sobre title/description y retira
  // el array `translations` de la respuesta para conservar el contrato plano.
  private localize<T extends { translations?: TranslationRow[] }>(entity: T | null): T | null {
    if (!entity) return entity;
    const { translations, ...rest } = entity as T & { translations?: TranslationRow[] };
    const tr = translations?.[0];
    if (tr) {
      const r = rest as Record<string, unknown>;
      r.title = tr.title;
      if (tr.description != null) r.description = tr.description;
      // Listas: solo se reemplazan si la traducción las trae; si no, se
      // conservan las del idioma base (fallback parcial por campo).
      if (tr.symptoms) r.symptoms = toEntries(tr.symptoms, 'symptom');
      if (tr.causes) r.causes = toEntries(tr.causes, 'cause');
      if (tr.solutions) r.solutions = toEntries(tr.solutions, 'solution');
    }
    return rest as T;
  }

  private localizeMany<T extends { translations?: TranslationRow[] }>(rows: T[]): T[] {
    return rows.map((r) => this.localize(r) as T);
  }

  async findAll(page: number = 1, limit: number = 50, locale: string = DEFAULT_LOCALE) {
    // El catálogo principal muestra solo los códigos genéricos (universales SAE);
    // las variantes por marca se navegan por fabricante o desde el detalle.
    const where = { manufacturerId: await this.genericId() };
    const skip = (page - 1) * limit;
    const [codes, total] = await Promise.all([
      this.prisma.oBDCode.findMany({ where, skip, take: limit, orderBy: { code: 'asc' }, include: this.listInclude(locale) }),
      this.prisma.oBDCode.count({ where }),
    ]);
    return { data: this.localizeMany(codes), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findByCode(code: string, locale: string = DEFAULT_LOCALE, manufacturerSlug?: string) {
    const upper = code.toUpperCase();
    const genericId = await this.genericId();
    let manufacturerId = genericId;
    let manufacturerName: string | undefined;
    if (manufacturerSlug) {
      const m = await this.prisma.manufacturer.findUnique({ where: { slug: manufacturerSlug } });
      if (m) {
        manufacturerId = m.id;
        manufacturerName = m.name;
      }
    }
    const include = this.detailInclude(locale);
    let found = await this.prisma.oBDCode.findUnique({
      where: { code_manufacturerId: { code: upper, manufacturerId } },
      include,
    });
    // Si se pidió una marca que no tiene ese código específico, se cae al genérico.
    if (!found && manufacturerId !== genericId) {
      found = await this.prisma.oBDCode.findUnique({
        where: { code_manufacturerId: { code: upper, manufacturerId: genericId } },
        include,
      });
    }
    // Enriquecer OEM: si el código es de marca y no tiene contenido propio,
    // heredar síntomas/causas/soluciones del genérico (si existe).
    if (found && manufacturerId !== genericId) {
      const hasOwnContent = (found.symptoms?.length ?? 0) > 0
        || (found.causes?.length ?? 0) > 0
        || (found.solutions?.length ?? 0) > 0;
      if (!hasOwnContent) {
        const generic = await this.prisma.oBDCode.findUnique({
          where: { code_manufacturerId: { code: upper, manufacturerId: genericId } },
          include: { symptoms: { select: { id: true, symptom: true } }, causes: { select: { id: true, cause: true } }, solutions: { select: { id: true, solution: true } } },
        });
        if (generic) {
          if (!found.symptoms?.length) found.symptoms = generic.symptoms;
          if (!found.causes?.length) found.causes = generic.causes;
          if (!found.solutions?.length) found.solutions = generic.solutions;
          if (!found.description) found.description = generic.description;
        }
      }
      // Si sigue sin descripción, generar texto automático
      if (!found.description) {
        found.description = this.generateOemDescription(upper, manufacturerName, locale);
      }
    }
    const localized = this.localize(found);
    if (localized) {
      // Otras marcas (o el genérico) que también definen este código, para que
      // el detalle ofrezca cambiar de variante.
      (localized as Record<string, unknown>).otherManufacturers = await this.variantsOf(
        upper,
        (found as { manufacturerId: number }).manufacturerId,
      );
    }
    return localized;
  }

  private generateOemDescription(code: string, manufacturerName?: string, locale?: string): string {
    const letter = code.charAt(0).toUpperCase();
    const categoryNames: Record<string, { es: string; en: string }> = {
      P: { es: 'Motor y Transmisión', en: 'Powertrain' },
      B: { es: 'Carrocería', en: 'Body' },
      C: { es: 'Chasis', en: 'Chassis' },
      U: { es: 'Red de Comunicación', en: 'Network' },
    };
    const cat = categoryNames[letter] || categoryNames.P;
    const brand = manufacturerName || 'fabricante';
    if (locale === 'en') {
      return `Manufacturer-specific code for ${brand}. Category: ${cat.en}. For detailed diagnosis, consult the vehicle service manual or a certified mechanic.`;
    }
    return `Código específico de ${brand}. Categoría: ${cat.es}. Para diagnóstico detallado, consulta el manual de servicio del fabricante o un mecánico certificado.`;
  }

  // Lista las variantes de un código en otros fabricantes (genérico primero),
  // opcionalmente excluyendo un manufacturerId (el que ya se está viendo).
  private async variantsOf(code: string, excludeManufacturerId?: number) {
    const rows = await this.prisma.oBDCode.findMany({
      where: { code: code.toUpperCase(), ...(excludeManufacturerId ? { NOT: { manufacturerId: excludeManufacturerId } } : {}) },
      select: { manufacturer: { select: { slug: true, name: true, isGeneric: true } } },
      orderBy: { manufacturer: { isGeneric: 'desc' } },
    });
    return rows.map((r) => r.manufacturer);
  }

  // Todas las variantes de un código (genérico + cada marca), con su título.
  async findVariants(code: string) {
    const rows = await this.prisma.oBDCode.findMany({
      where: { code: code.toUpperCase() },
      select: { code: true, title: true, manufacturer: { select: { slug: true, name: true, isGeneric: true } } },
      orderBy: [{ manufacturer: { isGeneric: 'desc' } }, { manufacturer: { name: 'asc' } }],
    });
    return rows;
  }

  async findByManufacturer(slug: string, page: number = 1, limit: number = 50, locale: string = DEFAULT_LOCALE) {
    const m = await this.prisma.manufacturer.findUnique({ where: { slug } });
    if (!m) return null;
    const where = { manufacturerId: m.id };
    const skip = (page - 1) * limit;
    const [codes, total] = await Promise.all([
      this.prisma.oBDCode.findMany({ where, skip, take: limit, orderBy: { code: 'asc' }, include: this.listInclude(locale) }),
      this.prisma.oBDCode.count({ where }),
    ]);
    return {
      manufacturer: { id: m.id, slug: m.slug, name: m.name, isGeneric: m.isGeneric, country: m.country, logoUrl: m.logoUrl },
      data: this.localizeMany(codes),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async search(query: string, limit: number = 5, locale: string = DEFAULT_LOCALE) {
    const searchTerm = query.toUpperCase();
    const rows = await this.prisma.oBDCode.findMany({
      where: {
        OR: [
          { code: { startsWith: searchTerm } },
          { code: { contains: searchTerm } },
          { title: { contains: query } },
        ],
      },
      // Se piden más para poder deduplicar por código sin quedar cortos.
      take: limit * 4,
      orderBy: [{ code: 'asc' }, { manufacturer: { isGeneric: 'desc' } }],
      include: this.listInclude(locale),
    });
    // Un resultado por código: se prefiere la variante genérica; si solo hay
    // variantes de marca, se muestra una y se marca cuántas existen.
    const byCode = new Map<string, (typeof rows)[number]>();
    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.code, (counts.get(r.code) ?? 0) + 1);
      const existing = byCode.get(r.code);
      if (!existing || (!existing.manufacturer?.isGeneric && r.manufacturer?.isGeneric)) {
        byCode.set(r.code, r);
      }
    }
    const deduped = Array.from(byCode.values()).slice(0, limit).map((r) => {
      const out = this.localize(r) as Record<string, unknown>;
      const variantCount = counts.get(r.code) ?? 1;
      if (variantCount > 1 || !r.manufacturer?.isGeneric) out.variantCount = variantCount;
      return out;
    });
    return deduped;
  }

  // Búsqueda por síntoma: encuentra códigos cuyo síntoma coincide con el texto.
  // En es se busca sobre las filas OBDSymptom (idioma base); en otros idiomas,
  // sobre el campo `symptoms` de la traducción. Se acota a códigos genéricos
  // (catálogo principal) y se devuelve deduplicado por código.
  async searchBySymptom(query: string, limit: number = 12, locale: string = DEFAULT_LOCALE) {
    const q = (query || '').trim();
    if (q.length < 3) return [];
    const genericId = await this.genericId();

    let codeIds: number[];
    if (locale !== DEFAULT_LOCALE) {
      const trs = await this.prisma.oBDCodeTranslation.findMany({
        where: { locale, symptoms: { contains: q } },
        select: { codeId: true },
        take: limit * 4,
      });
      codeIds = [...new Set(trs.map((t) => t.codeId))];
    } else {
      const syms = await this.prisma.oBDSymptom.findMany({
        where: { symptom: { contains: q } },
        select: { codeId: true },
        take: limit * 6,
      });
      codeIds = [...new Set(syms.map((s) => s.codeId))];
    }
    if (codeIds.length === 0) return [];

    const rows = await this.prisma.oBDCode.findMany({
      where: { id: { in: codeIds }, manufacturerId: genericId },
      take: limit,
      orderBy: { code: 'asc' },
      include: this.listInclude(locale),
    });
    return this.localizeMany(rows);
  }

  async findByCategory(category: string, page: number = 1, limit: number = 50, locale: string = DEFAULT_LOCALE) {
    const cat = category.toUpperCase();
    if (!['P', 'B', 'C', 'U'].includes(cat)) {
      return { data: [], total: 0, page, limit, pages: 0 };
    }
    // El catálogo por categoría también muestra solo genéricos (sin duplicar
    // por marca); las variantes OEM se ven por fabricante o desde el detalle.
    const where = { code: { startsWith: cat }, manufacturerId: await this.genericId() };
    const skip = (page - 1) * limit;
    const [codes, total] = await Promise.all([
      this.prisma.oBDCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: this.listInclude(locale),
      }),
      this.prisma.oBDCode.count({ where }),
    ]);
    return { data: this.localizeMany(codes), total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findRelated(code: string, limit: number = 6, locale: string = DEFAULT_LOCALE) {
    const category = code.charAt(0).toUpperCase();
    const rows = await this.prisma.oBDCode.findMany({
      where: { code: { startsWith: category, not: code.toUpperCase() }, manufacturerId: await this.genericId() },
      take: limit,
      orderBy: { code: 'asc' },
      include: this.listInclude(locale),
    });
    return this.localizeMany(rows);
  }

  async findAllCategories() {
    return this.prisma.oBDCategory.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { codes: true } } },
    });
  }

  async findAllManufacturers() {
    return this.prisma.manufacturer.findMany({
      orderBy: [{ isGeneric: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { codes: true } } },
    });
  }

  async findStats() {
    const [codes, symptoms, causes, solutions, manufacturers] = await Promise.all([
      this.prisma.oBDCode.count(),
      this.prisma.oBDSymptom.count(),
      this.prisma.oBDCause.count(),
      this.prisma.oBDSolution.count(),
      this.prisma.manufacturer.count(),
    ]);
    return { codes, symptoms, causes, solutions, manufacturers };
  }
}
