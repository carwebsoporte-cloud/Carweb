import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  calculateSeoQuality,
  editorialTokenSet,
  hasMeaningfulText,
  isSeoSimilarityAtLeast,
  isSeoIndexableLevel,
  normalizedEditorialSignature,
  roundedJaccardSimilarity,
  SEO_DUPLICATE_SIMILARITY_THRESHOLD,
  SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
  type SeoQualityInput,
} from './seo-quality';
import { PrismaService } from '../prisma/prisma.service';

const PUBLISHED_STATUS = 'PUBLISHED';
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHED_CODES = 25_000;

const POLICY_CODE_SELECT = {
  id: true,
  code: true,
  title: true,
  description: true,
  severity: true,
  category: { select: { code: true } },
  manufacturer: { select: { id: true, isGeneric: true } },
  symptoms: { select: { symptom: true }, orderBy: { id: 'asc' } },
  causes: { select: { cause: true }, orderBy: { id: 'asc' } },
  solutions: { select: { solution: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.OBDCodeSelect;

export type PolicyCode = Prisma.OBDCodeGetPayload<{ select: typeof POLICY_CODE_SELECT }>;

export interface PublicSeoPolicy {
  seoIndexable: boolean;
}

type CacheEntry = {
  expiresAt: number;
  policies: Map<number, PublicSeoPolicy>;
};

function editorialBodyHasContent(code: PolicyCode): boolean {
  return [
    code.description,
    ...code.symptoms.map((item) => item.symptom),
    ...code.causes.map((item) => item.cause),
    ...code.solutions.map((item) => item.solution),
  ].some(hasMeaningfulText);
}

export function policyQualityInput(
  code: PolicyCode,
  relatedCodeEvidence: boolean,
  duplicateRisk: boolean,
  oemGeneric: boolean,
  manufacturerEvidencePoints: number,
): SeoQualityInput {
  return {
    title: code.title,
    description: code.description,
    descriptionSource: 'stored',
    severity: code.severity,
    symptoms: code.symptoms.map((item) => item.symptom),
    causes: code.causes.map((item) => item.cause),
    solutions: code.solutions.map((item) => item.solution),
    isGeneric: code.manufacturer.isGeneric,
    relatedCodeEvidence,
    duplicateRisk,
    oemGeneric,
    manufacturerEvidencePoints,
  };
}

function normalizedSignature(code: PolicyCode): string {
  return normalizedEditorialSignature(code);
}

@Injectable()
export class SeoPolicyService {
  private readonly logger = new Logger(SeoPolicyService.name);
  private cache: CacheEntry | null = null;
  private loading: Promise<Map<number, PublicSeoPolicy>> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getPublicPolicy(codeId: number): Promise<PublicSeoPolicy> {
    try {
      const policies = await this.getPolicyIndex();
      return policies.get(codeId) ?? { seoIndexable: false };
    } catch (error) {
      this.logger.error('Unable to build the SEO policy index; defaulting to noindex', error);
      return { seoIndexable: false };
    }
  }

  private async getPolicyIndex(): Promise<Map<number, PublicSeoPolicy>> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.policies;
    if (this.loading) return this.loading;

    this.loading = this.buildPolicyIndex();
    try {
      const policies = await this.loading;
      this.cache = { expiresAt: Date.now() + CACHE_TTL_MS, policies };
      return policies;
    } finally {
      this.loading = null;
    }
  }

  private async buildPolicyIndex(): Promise<Map<number, PublicSeoPolicy>> {
    // This bounded published snapshot is built once per TTL, not once per page request.
    const codes = await this.prisma.oBDCode.findMany({
      where: { status: PUBLISHED_STATUS },
      select: POLICY_CODE_SELECT,
      orderBy: [{ code: 'asc' }, { manufacturerId: 'asc' }, { id: 'asc' }],
      take: MAX_CACHED_CODES + 1,
    });
    if (codes.length > MAX_CACHED_CODES) {
      // The caller converts this failure to noindex, keeping the catalog accessible without caching a partial policy index.
      throw new Error(`Published code index exceeds the safe cache limit of ${MAX_CACHED_CODES} records`);
    }

    const duplicateRiskIds = new Set<number>();
    const oemGenericIds = new Set<number>();
    const codesBySignature = new Map<string, PolicyCode[]>();
    const codesByCode = new Map<string, PolicyCode[]>();
    const genericByCode = new Map<string, PolicyCode>();
    const genericByCategory = new Map<string, PolicyCode[]>();

    for (const code of codes) {
      const signature = normalizedSignature(code);
      if (signature.replace(/\|/g, '')) {
        const group = codesBySignature.get(signature) ?? [];
        group.push(code);
        codesBySignature.set(signature, group);
      }

      const variants = codesByCode.get(code.code) ?? [];
      variants.push(code);
      codesByCode.set(code.code, variants);

      if (code.manufacturer.isGeneric) {
        genericByCode.set(code.code, code);
        const category = code.category.code.toUpperCase();
        const categoryCodes = genericByCategory.get(category) ?? [];
        categoryCodes.push(code);
        genericByCategory.set(category, categoryCodes);
      }
    }

    for (const group of codesBySignature.values()) {
      if (group.length > 1) {
        for (const code of group) duplicateRiskIds.add(code.id);
      }
    }

    for (const oem of codes.filter((code) => !code.manufacturer.isGeneric)) {
      const generic = genericByCode.get(oem.code);
      if (!generic) continue;

      const similarity = roundedJaccardSimilarity(editorialTokenSet(policyQualityInput(oem, false, false, false, 5)), editorialTokenSet(policyQualityInput(generic, false, false, false, 5)));
      if (!editorialBodyHasContent(oem) || isSeoSimilarityAtLeast(similarity, SEO_OEM_GENERIC_SIMILARITY_THRESHOLD)) {
        oemGenericIds.add(oem.id);
      }
      if (isSeoSimilarityAtLeast(similarity, SEO_DUPLICATE_SIMILARITY_THRESHOLD)) {
        duplicateRiskIds.add(oem.id);
        duplicateRiskIds.add(generic.id);
      }
    }

    const policies = new Map<number, PublicSeoPolicy>();
    for (const code of codes) {
      const sameCodeVariants = codesByCode.get(code.code) ?? [];
      const categoryCodes = genericByCategory.get(code.category.code.toUpperCase()) ?? [];
      const relatedCodeEvidence = categoryCodes.some((candidate) => candidate.id !== code.id) || sameCodeVariants.length > 1;
      const oemGeneric = oemGenericIds.has(code.id);
      const quality = calculateSeoQuality(policyQualityInput(
        code,
        relatedCodeEvidence,
        duplicateRiskIds.has(code.id),
        oemGeneric,
        code.manufacturer.isGeneric
          ? 5
          : oemGeneric || !editorialBodyHasContent(code)
            ? 5
            : 10,
      ));
      policies.set(code.id, { seoIndexable: isSeoIndexableLevel(quality.level) });
    }
    return policies;
  }
}
