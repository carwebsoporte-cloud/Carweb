import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateSeoQuality,
  editorialTokenSet,
  hasMeaningfulText,
  isSeoSimilarityAtLeast,
  missingEnglishFields,
  normalizedEditorialSignature,
  roundedJaccardSimilarity,
  SEO_DUPLICATE_SIMILARITY_THRESHOLD,
  SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
  type EditorialListItem,
  type SeoQualityInput,
  type SeoQualityResult,
} from '../src/seo/seo-quality';

const ENGLISH_LOCALE = 'en';
const PUBLISHED_STATUS = 'PUBLISHED';
const REPORT_DIRECTORY = path.resolve(process.cwd(), 'reports');
const JSON_REPORT_PATH = path.join(REPORT_DIRECTORY, 'seo-inventory.json');
const CSV_REPORT_PATH = path.join(REPORT_DIRECTORY, 'seo-inventory.csv');
const PRIORITY_REPORT_PATH = path.join(REPORT_DIRECTORY, 'content-priority.csv');
const ORPHAN_REPORT_PATH = path.join(REPORT_DIRECTORY, 'orphan-pages.csv');
const GENERATED_REPORT_PATHS = [JSON_REPORT_PATH, CSV_REPORT_PATH, PRIORITY_REPORT_PATH, ORPHAN_REPORT_PATH] as const;

const CATEGORY_PAGE_SIZE = 24;
const MANUFACTURER_PAGE_SIZE = 24;
const RELATED_CODE_LIMIT = 6;
const THIN_OEM_CONTENT_MIN_CHARACTERS = 300;
const HIGH_INTENT_CODES = new Set(['P0128', 'P0171', 'P0300', 'P0420', 'P0442']);

const CODE_SELECT = {
  id: true,
  code: true,
  title: true,
  description: true,
  severity: true,
  status: true,
  category: { select: { code: true } },
  manufacturer: { select: { id: true, slug: true, name: true, isGeneric: true } },
  symptoms: { select: { symptom: true }, orderBy: { id: 'asc' } },
  causes: { select: { cause: true }, orderBy: { id: 'asc' } },
  solutions: { select: { solution: true }, orderBy: { id: 'asc' } },
  translations: {
    where: { locale: ENGLISH_LOCALE },
    select: { locale: true, title: true, description: true, symptoms: true, causes: true, solutions: true },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.OBDCodeSelect;

type CodeRow = Prisma.OBDCodeGetPayload<{ select: typeof CODE_SELECT }>;
type TranslationRow = CodeRow['translations'][number];
type CsvValue = string | number | boolean;

type CodeReference = {
  id: number;
  code: string;
  manufacturerId: number;
  manufacturerSlug: string;
  manufacturerName: string;
  isGeneric: boolean;
};

type SimilarityEvidence = {
  method: 'exact-normalized-signature' | 'same-code-generic-oem';
  threshold: number;
  similarity: number;
  comparedCode: string;
  comparedManufacturer: string;
  candidateEvidence: string;
};

type OemComparison = {
  comparedCode: string;
  comparedManufacturer: string;
  threshold: number;
  similarity: number | null;
  oemStoredEditorial: boolean;
  oemGeneric: boolean;
  candidateEvidence: string;
};

type RelatedEvidence = {
  sameCategoryGenericCodes: number;
  sameCodePublishedVariants: number;
  sources: string[];
};

type AuditedCode = {
  code: CodeRow;
  quality: SeoQualityResult;
  missingEnglishFields: string[];
  duplicateEvidence: SimilarityEvidence[];
  oemComparison: OemComparison | null;
  relatedEvidence: RelatedEvidence;
  priority: number;
  priorityReason: string;
};

type IssueRecord = CodeReference & { status: string; missingFields: string[] };

type AuditFailureKind =
  | 'missing-database-url'
  | 'database-query'
  | 'filesystem-invalidation'
  | 'filesystem-write';

class AuditFailure extends Error {
  constructor(readonly kind: AuditFailureKind) {
    super(kind);
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function reference(code: CodeRow): CodeReference {
  return {
    id: code.id,
    code: code.code,
    manufacturerId: code.manufacturer.id,
    manufacturerSlug: code.manufacturer.slug,
    manufacturerName: code.manufacturer.name,
    isGeneric: code.manufacturer.isGeneric,
  };
}

function sortCodes(codes: CodeRow[]): CodeRow[] {
  return [...codes].sort((left, right) =>
    compareText(left.code, right.code) || left.manufacturer.id - right.manufacturer.id || left.id - right.id,
  );
}

function sortReferences(references: CodeReference[]): CodeReference[] {
  return [...references].sort((left, right) =>
    compareText(left.code, right.code) || left.manufacturerId - right.manufacturerId || left.id - right.id,
  );
}

function itemValues(code: CodeRow): Pick<SeoQualityInput, 'symptoms' | 'causes' | 'solutions'> {
  return {
    symptoms: code.symptoms.map((item) => item.symptom),
    causes: code.causes.map((item) => item.cause),
    solutions: code.solutions.map((item) => item.solution),
  };
}

function qualityInput(
  code: CodeRow,
  context: Pick<SeoQualityInput, 'relatedCodeEvidence' | 'duplicateRisk' | 'oemGeneric' | 'manufacturerEvidencePoints'>,
): SeoQualityInput {
  return {
    title: code.title,
    description: code.description,
    descriptionSource: 'stored',
    severity: code.severity,
    ...itemValues(code),
    isGeneric: code.manufacturer.isGeneric,
    ...context,
  };
}

function editorialBodyHasContent(code: CodeRow): boolean {
  return [
    code.description,
    ...code.symptoms.map((item) => item.symptom),
    ...code.causes.map((item) => item.cause),
    ...code.solutions.map((item) => item.solution),
  ].some(hasMeaningfulText);
}

function normalizedSignature(code: CodeRow): string {
  return normalizedEditorialSignature(code);
}

function tokenInput(code: CodeRow): SeoQualityInput {
  return qualityInput(code, {
    relatedCodeEvidence: false,
    duplicateRisk: false,
    oemGeneric: false,
    manufacturerEvidencePoints: 5,
  });
}

function addSimilarityEvidence(
  evidenceByCodeId: Map<number, SimilarityEvidence[]>,
  codeId: number,
  evidence: SimilarityEvidence,
): void {
  const existing = evidenceByCodeId.get(codeId) ?? [];
  existing.push(evidence);
  evidenceByCodeId.set(codeId, existing);
}

function buildExactDuplicateGroups(publishedCodes: CodeRow[], evidenceByCodeId: Map<number, SimilarityEvidence[]>) {
  const groupsBySignature = new Map<string, CodeRow[]>();
  for (const code of publishedCodes) {
    const signature = normalizedSignature(code);
    if (!signature.replace(/\|/g, '')) continue;
    const group = groupsBySignature.get(signature) ?? [];
    group.push(code);
    groupsBySignature.set(signature, group);
  }

  const groups = [...groupsBySignature.values()]
    .filter((group) => group.length > 1)
    .map(sortCodes)
    .sort((left, right) => compareText(left[0].code, right[0].code) || left[0].manufacturer.id - right[0].manufacturer.id)
    .map((group, index) => ({
      classification: 'POSSIBLE_DUPLICATE_CANDIDATE',
      confirmedDuplicate: false,
      candidateGroupId: `candidate-${String(index + 1).padStart(3, '0')}`,
      reason: 'Identical normalized title, description, symptoms, causes, and solutions.',
      threshold: 1,
      similarity: 1,
      codes: group.map(reference),
    }));

  for (const group of groups) {
    for (const code of group.codes) {
      const compared = group.codes.find((candidate) => candidate.id !== code.id) ?? code;
      addSimilarityEvidence(evidenceByCodeId, code.id, {
        method: 'exact-normalized-signature',
        threshold: 1,
        similarity: 1,
        comparedCode: compared.code,
        comparedManufacturer: compared.manufacturerName,
        candidateEvidence: `${group.candidateGroupId}; ${group.codes.length} published records share one normalized signature; candidate only, not confirmed.`,
      });
    }
  }

  return groups;
}

function buildOemComparisons(
  publishedCodes: CodeRow[],
  evidenceByCodeId: Map<number, SimilarityEvidence[]>,
): Map<number, OemComparison> {
  const genericByCode = new Map(publishedCodes.filter((code) => code.manufacturer.isGeneric).map((code) => [code.code, code]));
  const comparisons = new Map<number, OemComparison>();

  for (const oem of publishedCodes.filter((code) => !code.manufacturer.isGeneric)) {
    const generic = genericByCode.get(oem.code);
    const oemStoredEditorial = editorialBodyHasContent(oem);
    if (!generic) {
      comparisons.set(oem.id, {
        comparedCode: oem.code,
        comparedManufacturer: 'no-published-generic-counterpart',
        threshold: SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
        similarity: null,
        oemStoredEditorial,
        oemGeneric: false,
        candidateEvidence: oemStoredEditorial
          ? 'No same-code published generic counterpart; stored OEM body content receives manufacturer-specific evidence.'
          : 'No same-code published generic counterpart; OEM body content is missing or whitespace-only.',
      });
      continue;
    }

    const similarity = roundedJaccardSimilarity(editorialTokenSet(tokenInput(oem)), editorialTokenSet(tokenInput(generic)));
    const oemGeneric = !oemStoredEditorial || isSeoSimilarityAtLeast(similarity, SEO_OEM_GENERIC_SIMILARITY_THRESHOLD);
    const comparison: OemComparison = {
      comparedCode: generic.code,
      comparedManufacturer: generic.manufacturer.name,
      threshold: SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
      similarity,
      oemStoredEditorial,
      oemGeneric,
      candidateEvidence: !oemStoredEditorial
        ? 'OEM title may exist, but stored description/symptoms/causes/solutions are missing; runtime fallback text is excluded.'
        : `Jaccard token similarity against the same-code generic record is ${similarity}; OEM_GENERIC requires similarity >= ${SEO_OEM_GENERIC_SIMILARITY_THRESHOLD}.`,
    };
    comparisons.set(oem.id, comparison);

    if (isSeoSimilarityAtLeast(similarity, SEO_DUPLICATE_SIMILARITY_THRESHOLD)) {
      const candidateEvidence = `Same-code generic/OEM token similarity ${similarity} meets duplicate-risk threshold ${SEO_DUPLICATE_SIMILARITY_THRESHOLD}; candidate only, not confirmed.`;
      addSimilarityEvidence(evidenceByCodeId, oem.id, {
        method: 'same-code-generic-oem',
        threshold: SEO_DUPLICATE_SIMILARITY_THRESHOLD,
        similarity,
        comparedCode: generic.code,
        comparedManufacturer: generic.manufacturer.name,
        candidateEvidence,
      });
      addSimilarityEvidence(evidenceByCodeId, generic.id, {
        method: 'same-code-generic-oem',
        threshold: SEO_DUPLICATE_SIMILARITY_THRESHOLD,
        similarity,
        comparedCode: oem.code,
        comparedManufacturer: oem.manufacturer.name,
        candidateEvidence,
      });
    }
  }

  return comparisons;
}

function missingBaseFields(code: CodeRow): string[] {
  const quality = calculateSeoQuality(qualityInput(code, {
    relatedCodeEvidence: false,
    duplicateRisk: false,
    oemGeneric: false,
    manufacturerEvidencePoints: 5,
  }));
  return quality.missingFields.filter((field) => ['description', 'symptoms', 'causes', 'solutions'].includes(field));
}

function contentCharacterCount(code: CodeRow): number {
  return [
    code.title,
    code.description,
    ...code.symptoms.map((item) => item.symptom),
    ...code.causes.map((item) => item.cause),
    ...code.solutions.map((item) => item.solution),
  ].reduce((total, value) => total + (value?.trim().length ?? 0), 0);
}

function issueRecord(code: CodeRow, missingFields: string[]): IssueRecord {
  return { ...reference(code), status: code.status, missingFields };
}

function priorityFor(code: CodeRow, quality: SeoQualityResult): { priority: number; reason: string } {
  const hasDescription = quality.hasDescription;
  const hasSolutions = quality.hasSolutions;
  const hasSymptomsOrCauses = quality.hasSymptoms || quality.hasCauses;

  if (HIGH_INTENT_CODES.has(code.code.toUpperCase())) {
    return { priority: 1, reason: 'high-intent-code-heuristic; not traffic truth' };
  }
  if (code.manufacturer.isGeneric && hasDescription && !hasSolutions) {
    return { priority: 2, reason: 'generic-with-description-and-no-solutions' };
  }
  if (code.manufacturer.isGeneric && hasSymptomsOrCauses && quality.missingFields.length > 0) {
    return { priority: 3, reason: 'generic-with-symptoms-or-causes-but-incomplete' };
  }
  if (!code.manufacturer.isGeneric && !quality.flags.oemGeneric && editorialBodyHasContent(code)) {
    return { priority: 4, reason: 'differentiated-oem' };
  }
  return { priority: 5, reason: quality.score < 55 ? 'nearly-empty-or-low-value' : 'low-urgency-or-not-in-targeted-queue' };
}

function relatedEvidence(code: CodeRow, publishedGenericCodes: CodeRow[], publishedCodesByCode: Map<string, CodeRow[]>): RelatedEvidence {
  const category = code.code.charAt(0).toUpperCase();
  const sameCategoryGenericCodes = publishedGenericCodes.filter((candidate) =>
    candidate.code.charAt(0).toUpperCase() === category && candidate.id !== code.id,
  ).length;
  const sameCodePublishedVariants = publishedCodesByCode.get(code.code)?.length ?? 0;
  const sources: string[] = [];
  if (sameCategoryGenericCodes > 0) sources.push('published-generic-category-listing-and-related-links');
  if (sameCodePublishedVariants > 1) sources.push('published-generic-oem-variants');
  return { sameCategoryGenericCodes, sameCodePublishedVariants, sources };
}

function auditPublishedCodes(codes: CodeRow[]): AuditedCode[] {
  const publishedCodes = sortCodes(codes.filter((code) => code.status === PUBLISHED_STATUS));
  const publishedGenericCodes = publishedCodes.filter((code) => code.manufacturer.isGeneric);
  const publishedCodesByCode = new Map<string, CodeRow[]>();
  for (const code of publishedCodes) {
    const variants = publishedCodesByCode.get(code.code) ?? [];
    variants.push(code);
    publishedCodesByCode.set(code.code, variants);
  }

  const duplicateEvidenceByCodeId = new Map<number, SimilarityEvidence[]>();
  buildExactDuplicateGroups(publishedCodes, duplicateEvidenceByCodeId);
  const oemComparisons = buildOemComparisons(publishedCodes, duplicateEvidenceByCodeId);

  return publishedCodes.map((code) => {
    const comparison = oemComparisons.get(code.id) ?? null;
    const related = relatedEvidence(code, publishedGenericCodes, publishedCodesByCode);
    const duplicateEvidence = (duplicateEvidenceByCodeId.get(code.id) ?? []).sort((left, right) =>
      compareText(left.method, right.method)
      || compareText(left.comparedCode, right.comparedCode)
      || compareText(left.comparedManufacturer, right.comparedManufacturer),
    );
    const quality = calculateSeoQuality(qualityInput(code, {
      relatedCodeEvidence: related.sources.length > 0,
      duplicateRisk: duplicateEvidence.length > 0,
      oemGeneric: comparison?.oemGeneric ?? false,
      manufacturerEvidencePoints: code.manufacturer.isGeneric
        ? 5
        : comparison && !comparison.oemGeneric && editorialBodyHasContent(code)
          ? 10
          : 5,
    }));
    const priority = priorityFor(code, quality);
    return {
      code,
      quality,
      missingEnglishFields: missingEnglishFields(code.translations[0]),
      duplicateEvidence,
      oemComparison: comparison,
      relatedEvidence: related,
      priority: priority.priority,
      priorityReason: priority.reason,
    };
  });
}

function csvEscape(value: CsvValue): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function listValue(values: string[]): string {
  return values.join('|');
}

function evidenceValue(value: SimilarityEvidence[]): string {
  return JSON.stringify(value);
}

function codeUrl(code: CodeRow): string {
  return code.manufacturer.isGeneric
    ? `/code/${code.code.toUpperCase()}`
    : `/code/${code.code.toUpperCase()}/${code.manufacturer.slug}`;
}

function pagePath(base: string, page: number): string {
  return page > 1 ? `${base}?page=${page}` : base;
}

type LinkEdge = { kind: string; url: string };

function buildSourceDerivedLinkGraph(publishedCodes: CodeRow[]): Map<number, LinkEdge[]> {
  const edgesByTarget = new Map<number, Map<string, LinkEdge>>();
  const addEdge = (targetId: number, url: string, kind: string): void => {
    const edges = edgesByTarget.get(targetId) ?? new Map<string, LinkEdge>();
    edges.set(`${url}|${kind}`, { kind, url });
    edgesByTarget.set(targetId, edges);
  };
  const addBilingualEdge = (targetId: number, esPath: string, enPath: string, kind: string): void => {
    addEdge(targetId, esPath, kind);
    addEdge(targetId, enPath, kind);
  };

  const genericCodes = sortCodes(publishedCodes.filter((code) => code.manufacturer.isGeneric));
  const genericByCategory = new Map<string, CodeRow[]>();
  for (const code of genericCodes) {
    const category = code.code.charAt(0).toUpperCase();
    const list = genericByCategory.get(category) ?? [];
    list.push(code);
    genericByCategory.set(category, list);
  }

  for (const [category, categoryCodes] of genericByCategory) {
    categoryCodes.forEach((code, index) => {
      const page = Math.floor(index / CATEGORY_PAGE_SIZE) + 1;
      addBilingualEdge(
        code.id,
        pagePath(`/category/${category}`, page),
        pagePath(`/en/category/${category}`, page),
        'category-listing',
      );
    });
  }

  const oemByManufacturer = new Map<number, CodeRow[]>();
  for (const code of publishedCodes.filter((candidate) => !candidate.manufacturer.isGeneric)) {
    const list = oemByManufacturer.get(code.manufacturer.id) ?? [];
    list.push(code);
    oemByManufacturer.set(code.manufacturer.id, list);
  }
  for (const codes of oemByManufacturer.values()) {
    const sorted = sortCodes(codes);
    sorted.forEach((code, index) => {
      const page = Math.floor(index / MANUFACTURER_PAGE_SIZE) + 1;
      addBilingualEdge(
        code.id,
        pagePath(`/marcas/${code.manufacturer.slug}`, page),
        pagePath(`/en/brands/${code.manufacturer.slug}`, page),
        'manufacturer-listing',
      );
    });
  }

  const variantsByCode = new Map<string, CodeRow[]>();
  for (const code of publishedCodes) {
    const variants = variantsByCode.get(code.code) ?? [];
    variants.push(code);
    variantsByCode.set(code.code, variants);
  }
  for (const variants of variantsByCode.values()) {
    for (const source of variants) {
      for (const target of variants) {
        if (source.id === target.id) continue;
        addBilingualEdge(target.id, codeUrl(source), `/en${codeUrl(source)}`, 'generic-oem-variant');
      }
    }
  }

  for (const [category, categoryCodes] of genericByCategory) {
    void category;
    for (const source of categoryCodes) {
      const related = categoryCodes.filter((target) => target.id !== source.id).slice(0, RELATED_CODE_LIMIT);
      for (const target of related) {
        addBilingualEdge(target.id, codeUrl(source), `/en${codeUrl(source)}`, 'related-generic-code');
      }
    }
  }

  const homePopular = genericCodes.slice(0, 6);
  const homeRecent = genericCodes.slice(0, 10);
  for (const code of homePopular) {
    addBilingualEdge(code.id, '/', '/en', 'home-popular');
  }
  for (const code of homeRecent) {
    addBilingualEdge(code.id, '/', '/en', 'home-recent');
  }

  const guideCodes = ['P0128', 'P0171', 'P0300', 'P0420', 'P0442'];
  for (const code of guideCodes) {
    const generic = genericCodes.find((candidate) => candidate.code === code);
    if (generic) addBilingualEdge(generic.id, '/guias', '/en/guides', 'guide-code-example');
  }

  return new Map([...edgesByTarget.entries()].map(([id, edges]) => [
    id,
    [...edges.values()].sort((left, right) => compareText(left.kind, right.kind) || compareText(left.url, right.url)),
  ]));
}

const INVENTORY_COLUMNS = [
  'id', 'code', 'status', 'manufacturer_id', 'manufacturer_slug', 'manufacturer_name', 'is_generic', 'category',
  'classification', 'seo_score', 'raw_seo_score', 'indexation_policy', 'missing_fields', 'english_missing_fields',
  'english_complete', 'has_description', 'has_symptoms', 'has_causes', 'has_solutions', 'has_diagnosis',
  'thin_flag', 'duplicate_risk', 'oem_generic', 'duplicate_evidence', 'oem_comparison', 'related_evidence',
] as const;

const PRIORITY_COLUMNS = [
  'code', 'manufacturer', 'type', 'seo_score', 'seo_level', 'has_description', 'has_symptoms', 'has_causes',
  'has_solutions', 'has_diagnosis', 'english_complete', 'duplicate_risk', 'priority', 'priority_reason',
  'manufacturer_slug', 'missing_fields', 'english_missing_fields', 'oem_generic', 'indexation_policy',
  'duplicate_evidence', 'oem_comparison', 'related_evidence',
] as const;

const ORPHAN_COLUMNS = [
  'url', 'code', 'manufacturer', 'incoming_links', 'seo_score', 'seo_level', 'indexation_policy',
  'source_derived_evidence', 'source_derived_estimate',
] as const;

function toCsv(columns: readonly string[], rows: Record<string, CsvValue>[]): string {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
    '',
  ].join('\n');
}

function inventoryCsvRow(code: CodeRow, audited: AuditedCode | undefined): Record<string, CsvValue> {
  if (!audited) {
    return {
      id: code.id, code: code.code, status: code.status, manufacturer_id: code.manufacturer.id,
      manufacturer_slug: code.manufacturer.slug, manufacturer_name: code.manufacturer.name,
      is_generic: code.manufacturer.isGeneric, category: code.category.code, classification: 'UNPUBLISHED',
      seo_score: '', raw_seo_score: '', indexation_policy: 'not-published', missing_fields: listValue(missingBaseFields(code)),
      english_missing_fields: '', english_complete: false, has_description: hasMeaningfulText(code.description),
      has_symptoms: code.symptoms.some((item) => hasMeaningfulText(item.symptom)),
      has_causes: code.causes.some((item) => hasMeaningfulText(item.cause)),
      has_solutions: code.solutions.some((item) => hasMeaningfulText(item.solution)), has_diagnosis: false,
      thin_flag: false, duplicate_risk: false, oem_generic: false, duplicate_evidence: '', oem_comparison: '', related_evidence: '',
    };
  }
  return {
    id: code.id, code: code.code, status: code.status, manufacturer_id: code.manufacturer.id,
    manufacturer_slug: code.manufacturer.slug, manufacturer_name: code.manufacturer.name,
    is_generic: code.manufacturer.isGeneric, category: code.category.code, classification: audited.quality.level,
    seo_score: audited.quality.score, raw_seo_score: audited.quality.rawScore,
    indexation_policy: audited.quality.indexationRecommendation, missing_fields: listValue(audited.quality.missingFields),
    english_missing_fields: listValue(audited.missingEnglishFields), english_complete: audited.missingEnglishFields.length === 0,
    has_description: audited.quality.hasDescription, has_symptoms: audited.quality.hasSymptoms,
    has_causes: audited.quality.hasCauses, has_solutions: audited.quality.hasSolutions,
    has_diagnosis: audited.quality.hasDiagnosis, thin_flag: audited.quality.flags.thin,
    duplicate_risk: audited.quality.flags.duplicateRisk, oem_generic: audited.quality.flags.oemGeneric,
    duplicate_evidence: evidenceValue(audited.duplicateEvidence),
    oem_comparison: JSON.stringify(audited.oemComparison), related_evidence: JSON.stringify(audited.relatedEvidence),
  };
}

function priorityCsvRow(audited: AuditedCode): Record<string, CsvValue> {
  const { code, quality } = audited;
  return {
    code: code.code, manufacturer: code.manufacturer.name, type: code.manufacturer.isGeneric ? 'generic' : 'oem',
    seo_score: quality.score, seo_level: quality.level, has_description: quality.hasDescription,
    has_symptoms: quality.hasSymptoms, has_causes: quality.hasCauses, has_solutions: quality.hasSolutions,
    has_diagnosis: quality.hasDiagnosis, english_complete: audited.missingEnglishFields.length === 0,
    duplicate_risk: quality.flags.duplicateRisk, priority: audited.priority, priority_reason: audited.priorityReason,
    manufacturer_slug: code.manufacturer.slug, missing_fields: listValue(quality.missingFields),
    english_missing_fields: listValue(audited.missingEnglishFields), oem_generic: quality.flags.oemGeneric,
    indexation_policy: quality.indexationRecommendation, duplicate_evidence: evidenceValue(audited.duplicateEvidence),
    oem_comparison: JSON.stringify(audited.oemComparison), related_evidence: JSON.stringify(audited.relatedEvidence),
  };
}

function orphanCsvRows(auditedCodes: AuditedCode[], graph: Map<number, LinkEdge[]>): Record<string, CsvValue>[] {
  return auditedCodes
    .map((audited) => {
      const edges = graph.get(audited.code.id) ?? [];
      const evidenceCounts = new Map<string, number>();
      for (const edge of edges) evidenceCounts.set(edge.kind, (evidenceCounts.get(edge.kind) ?? 0) + 1);
      const sourceEvidence = [...evidenceCounts.entries()]
        .sort(([left], [right]) => compareText(left, right))
        .map(([kind, count]) => `${kind}:${count}`)
        .join('|');
      return {
        url: codeUrl(audited.code), code: audited.code.code, manufacturer: audited.code.manufacturer.name,
        incoming_links: edges.length, seo_score: audited.quality.score, seo_level: audited.quality.level,
        indexation_policy: audited.quality.indexationRecommendation, source_derived_evidence: sourceEvidence,
        source_derived_estimate: 'true; source-derived route estimate, not a runtime crawler measurement',
      };
    })
    .sort((left, right) => Number(left.incoming_links) - Number(right.incoming_links)
      || Number(right.seo_score) - Number(left.seo_score)
      || compareText(String(left.code), String(right.code))
      || compareText(String(left.manufacturer), String(right.manufacturer)));
}

function percentage(value: number, denominator: number): number {
  return denominator === 0 ? 0 : Number(((value / denominator) * 100).toFixed(2));
}

function loadDotenvIfNeeded(): void {
  if (process.env.DATABASE_URL) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      let value = (match[2] ?? '').trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch {
    // The required-variable check below handles a missing or unreadable .env.
  }
}

function invalidateGeneratedReports(): void {
  try {
    for (const reportPath of GENERATED_REPORT_PATHS) fs.rmSync(reportPath, { force: true });
  } catch {
    throw new AuditFailure('filesystem-invalidation');
  }
}

function writeReports(files: { path: string; content: string }[]): void {
  try {
    fs.mkdirSync(REPORT_DIRECTORY, { recursive: true });
    for (const file of files) fs.writeFileSync(file.path, file.content, 'utf8');
  } catch {
    try {
      invalidateGeneratedReports();
    } catch {
      // Keep the original failure opaque and preserve the no-stale-report guarantee.
    }
    throw new AuditFailure('filesystem-write');
  }
}

async function loadDatabaseSnapshot(): Promise<{ codes: CodeRow[]; manufacturers: Array<{ id: number; slug: string; name: string; isGeneric: boolean }>; statusGroups: Array<{ status: string; _count: { _all: number } }> }> {
  if (!process.env.DATABASE_URL) throw new AuditFailure('missing-database-url');
  const prisma = new PrismaClient();
  try {
    return await Promise.all([
      prisma.oBDCode.findMany({ select: CODE_SELECT, orderBy: [{ code: 'asc' }, { manufacturerId: 'asc' }, { id: 'asc' }] }),
      prisma.manufacturer.findMany({ select: { id: true, slug: true, name: true, isGeneric: true }, orderBy: [{ isGeneric: 'desc' }, { name: 'asc' }, { id: 'asc' }] }),
      prisma.oBDCode.groupBy({ by: ['status'], _count: { _all: true } }),
    ]).then(([codes, manufacturers, statusGroups]) => ({ codes, manufacturers, statusGroups }));
  } catch {
    throw new AuditFailure('database-query');
  } finally {
    await prisma.$disconnect();
  }
}

async function audit(): Promise<void> {
  loadDotenvIfNeeded();
  invalidateGeneratedReports();
  const snapshot = await loadDatabaseSnapshot();
  const codes = sortCodes(snapshot.codes);
  const publishedCodes = codes.filter((code) => code.status === PUBLISHED_STATUS);
  const publishedGenericCodes = publishedCodes.filter((code) => code.manufacturer.isGeneric);
  const publishedOemCodes = publishedCodes.filter((code) => !code.manufacturer.isGeneric);
  const auditedCodes = auditPublishedCodes(codes);
  const auditedById = new Map(auditedCodes.map((audited) => [audited.code.id, audited]));
  const countsByStatus = Object.fromEntries(snapshot.statusGroups
    .map(({ status, _count }) => [status, _count._all] as const)
    .sort(([left], [right]) => compareText(left, right)));
  const levels = ['STRONG', 'IMPROVABLE', 'THIN', 'DUPLICATE_RISK', 'OEM_GENERIC'] as const;
  const levelCounts = Object.fromEntries(levels.map((level) => [level, auditedCodes.filter((item) => item.quality.level === level).length]));
  const missingEnglishFieldCounts = Object.fromEntries(['title', 'description', 'symptoms', 'causes', 'solutions'].map((field) => [
    field,
    auditedCodes.filter((item) => item.missingEnglishFields.includes(field)).length,
  ]));
  const qualityCounts = {
    strongPages: levelCounts.STRONG,
    improvablePages: levelCounts.IMPROVABLE,
    thinPages: levelCounts.THIN,
    duplicateRiskPages: levelCounts.DUPLICATE_RISK,
    oemGenericPages: levelCounts.OEM_GENERIC,
    indexablePages: auditedCodes.filter((item) => item.quality.indexationRecommendation === 'index,follow').length,
    noindexPages: auditedCodes.filter((item) => item.quality.indexationRecommendation === 'noindex,follow').length,
  };
  const flagCounts = {
    thinFlagPages: auditedCodes.filter((item) => item.quality.flags.thin).length,
    duplicateRiskFlagPages: auditedCodes.filter((item) => item.quality.flags.duplicateRisk).length,
    oemGenericFlagPages: auditedCodes.filter((item) => item.quality.flags.oemGeneric).length,
  };
  const missingCounts = {
    missingDescriptions: auditedCodes.filter((item) => !item.quality.hasDescription).length,
    missingSymptoms: auditedCodes.filter((item) => !item.quality.hasSymptoms).length,
    missingCauses: auditedCodes.filter((item) => !item.quality.hasCauses).length,
    missingSolutions: auditedCodes.filter((item) => !item.quality.hasSolutions).length,
    missingEnglish: auditedCodes.filter((item) => item.missingEnglishFields.length > 0).length,
  };

  const manufacturersWithPublishedCodes = snapshot.manufacturers.filter((manufacturer) =>
    publishedCodes.some((code) => code.manufacturer.id === manufacturer.id),
  );
  const manufacturerRecord = (manufacturer: (typeof snapshot.manufacturers)[number]) => ({
    id: manufacturer.id,
    slug: manufacturer.slug,
    name: manufacturer.name,
    isGeneric: manufacturer.isGeneric,
    publishedCodeCount: publishedCodes.filter((code) => code.manufacturer.id === manufacturer.id).length,
  });
  const graph = buildSourceDerivedLinkGraph(publishedCodes);
  const priorityRows = [...auditedCodes].sort((left, right) =>
    left.priority - right.priority
    || right.quality.score - left.quality.score
    || compareText(left.code.code, right.code.code)
    || left.code.manufacturer.id - right.code.manufacturer.id
    || left.code.id - right.code.id,
  );
  const inventoryRows = codes.map((code) => inventoryCsvRow(code, auditedById.get(code.id)));
  const orphanRows = orphanCsvRows(auditedCodes, graph);

  const report = {
    status: 'available',
    totalCodes: codes.length,
    publishedCodes: publishedCodes.length,
    genericCodes: publishedGenericCodes.length,
    oemCodes: publishedOemCodes.length,
    ...qualityCounts,
    ...missingCounts,
    countsByStatus,
    publishedCodeCounts: { generic: publishedGenericCodes.length, oem: publishedOemCodes.length },
    manufacturerCounts: { total: snapshot.manufacturers.length, withPublishedCodes: manufacturersWithPublishedCodes.length },
    levelCounts,
    flagCounts,
    englishMissingFieldCounts: missingEnglishFieldCounts,
    percentages: {
      denominator: { totalCodes: codes.length, publishedCodes: publishedCodes.length },
      byTotalCodes: Object.fromEntries([
        'totalCodes', 'publishedCodes', 'genericCodes', 'oemCodes', ...Object.keys(qualityCounts), ...Object.keys(missingCounts),
      ].map((key) => [key, percentage(Number((({ totalCodes: codes.length, publishedCodes: publishedCodes.length, genericCodes: publishedGenericCodes.length, oemCodes: publishedOemCodes.length, ...qualityCounts, ...missingCounts } as Record<string, number>)[key]) ?? 0), codes.length)])),
      byPublishedCodes: Object.fromEntries([
        'genericCodes', 'oemCodes', ...Object.keys(qualityCounts), ...Object.keys(missingCounts),
      ].map((key) => [key, percentage(Number((({ genericCodes: publishedGenericCodes.length, oemCodes: publishedOemCodes.length, ...qualityCounts, ...missingCounts } as Record<string, number>)[key]) ?? 0), publishedCodes.length)])),
    },
    publishedGenericCodes: publishedGenericCodes.map(reference),
    publishedOemCodes: publishedOemCodes.map(reference),
    manufacturers: snapshot.manufacturers.map(manufacturerRecord),
    manufacturersWithPublishedCodes: manufacturersWithPublishedCodes.map(manufacturerRecord),
    publishedCodesWithoutDescription: auditedCodes.filter((item) => !item.quality.hasDescription).map((item) => issueRecord(item.code, ['description'])),
    publishedCodesWithoutSymptoms: auditedCodes.filter((item) => !item.quality.hasSymptoms).map((item) => issueRecord(item.code, ['symptoms'])),
    publishedCodesWithoutCauses: auditedCodes.filter((item) => !item.quality.hasCauses).map((item) => issueRecord(item.code, ['causes'])),
    publishedCodesWithoutSolutions: auditedCodes.filter((item) => !item.quality.hasSolutions).map((item) => issueRecord(item.code, ['solutions'])),
    publishedCodesWithoutCompleteEnglishTranslation: auditedCodes.filter((item) => item.missingEnglishFields.length > 0).map((item) => ({ ...reference(item.code), missingFields: item.missingEnglishFields })),
    publishedOemPagesWithThinOrIncompleteContent: auditedCodes
      .filter((item) => !item.code.manufacturer.isGeneric && (item.quality.flags.thin || item.quality.missingFields.length > 0 || contentCharacterCount(item.code) < THIN_OEM_CONTENT_MIN_CHARACTERS))
      .map((item) => ({ ...reference(item.code), contentCharacterCount: contentCharacterCount(item.code), reasons: [...item.quality.missingFields, ...(contentCharacterCount(item.code) < THIN_OEM_CONTENT_MIN_CHARACTERS ? [`contentCharacterCountBelow${THIN_OEM_CONTENT_MIN_CHARACTERS}`] : [])] })),
    possibleDuplicateContentGroups: buildExactDuplicateGroups(publishedCodes, new Map()),
    sameCodeDuplicateCandidates: auditedCodes.flatMap((item) => item.duplicateEvidence.filter((evidence) => evidence.method === 'same-code-generic-oem').map((evidence) => ({ ...reference(item.code), evidence }))),
    priorityQueue: priorityRows.slice(0, 100).map((item) => ({
      code: item.code.code,
      manufacturer: item.code.manufacturer.name,
      type: item.code.manufacturer.isGeneric ? 'generic' : 'oem',
      seoScore: item.quality.score,
      seoLevel: item.quality.level,
      priority: item.priority,
      priorityReason: item.priorityReason,
      missingFields: item.quality.missingFields,
      flags: item.quality.flags,
    })),
    classificationMethod: {
      primaryPrecedence: ['DUPLICATE_RISK', 'OEM_GENERIC', 'THIN', 'STRONG', 'IMPROVABLE'],
      dashboardCounts: 'strongPages/improvablePages/thinPages/duplicateRiskPages/oemGenericPages are primary levels; flagCounts retains independent overlapping flags.',
      strong: 'score >= 80 and title, description, symptoms, causes, and solutions are present.',
      improvable: 'score >= 55, description is present, and at least two of symptoms, causes, and solutions are present.',
      thin: 'Does not meet the strong or improvable rule; thin remains an independent flag even when another level wins precedence.',
      scoreBound: 'score is min(rawScore, 100); rawScore is retained in CSV for auditability.',
      diagnosisReady: 'There is no persisted diagnosis field; this component is description + symptoms + causes + solutions present.',
      genericManufacturerEvidence: 'Generic pages receive neutral 5-point manufacturer/base editorial credit; this is not manufacturer-specific evidence.',
      oemManufacturerEvidence: 'Differentiated stored OEM editorial content receives 10 points; missing/similar/no-comparator OEM content receives 5 points.',
      runtimeFallback: 'The database audit reads persisted Prisma fields only; runtime-generated OEM fallback descriptions are not counted.',
      duplicateMethod: `Lowercase NFKC text with punctuation collapsed to whitespace; exact normalized signatures are grouped, and same-code generic/OEM token sets use Jaccard. Duplicate-risk threshold is ${SEO_DUPLICATE_SIMILARITY_THRESHOLD}. Candidates are not confirmed duplicates.`,
      oemMethod: `Stored OEM editorial fields are compared only with the same-code published generic record. Missing/whitespace body content is non-specific; OEM_GENERIC threshold is ${SEO_OEM_GENERIC_SIMILARITY_THRESHOLD}.`,
      indexation: 'STRONG and IMPROVABLE use index,follow; THIN, DUPLICATE_RISK, and OEM_GENERIC use noindex,follow. Pages remain accessible.',
    },
    priorityMethod: {
      highIntentCodes: [...HIGH_INTENT_CODES].sort(compareText),
      highIntentLabel: 'Deterministic content-priority heuristic, not traffic truth.',
      order: ['1 high-intent heuristic', '2 generic with description and no solutions', '3 generic with symptoms/causes but incomplete', '4 differentiated OEM', '5 nearly empty/low-value or outside the targeted queue'],
      sort: 'priority ascending, seo score descending, code ascending, manufacturer id ascending, id ascending',
    },
    sourceDerivedLinkGraph: {
      estimate: true,
      note: 'Incoming links are estimated from source-visible category listings, manufacturer listings, generic/OEM variant links, the six generic related-code links, known guide links, and home popular/recent links. This is not a runtime crawler measurement; search interactions are excluded.',
      categoryPageSize: CATEGORY_PAGE_SIZE,
      manufacturerPageSize: MANUFACTURER_PAGE_SIZE,
      relatedCodeLimit: RELATED_CODE_LIMIT,
    },
    criteria: {
      completeEnglishTranslation: 'Trimmed non-empty title, description, symptoms, causes, and solutions in the persisted English translation row.',
      thinOemContent: `Published OEM pages are retained as candidates when a required field is empty, the quality result is thin, or total stored content is below ${THIN_OEM_CONTENT_MIN_CHARACTERS} characters.`,
      duplicateCandidates: 'Exact normalized signatures and conservative same-code generic/OEM Jaccard candidates; never confirmed duplicates.',
    },
  };

  writeReports([
    { path: JSON_REPORT_PATH, content: `${JSON.stringify(report, null, 2)}\n` },
    { path: CSV_REPORT_PATH, content: toCsv(INVENTORY_COLUMNS, inventoryRows) },
    { path: PRIORITY_REPORT_PATH, content: toCsv(PRIORITY_COLUMNS, priorityRows.map(priorityCsvRow)) },
    { path: ORPHAN_REPORT_PATH, content: toCsv(ORPHAN_COLUMNS, orphanRows) },
  ]);
  console.log(`SEO inventory written to ${JSON_REPORT_PATH}, ${CSV_REPORT_PATH}, ${PRIORITY_REPORT_PATH}, and ${ORPHAN_REPORT_PATH}`);
}

audit().catch((error: unknown) => {
  const kind = error instanceof AuditFailure ? error.kind : 'database-query';
  const messages: Record<AuditFailureKind, string> = {
    'missing-database-url': 'SEO inventory failed: DATABASE_URL is not configured; previous generated reports were invalidated and no current totals were generated.',
    'database-query': 'SEO inventory failed: database/query failure; previous generated reports were invalidated and no current totals were generated.',
    'filesystem-invalidation': 'SEO inventory failed: filesystem failure while invalidating previous generated reports; no current totals were generated.',
    'filesystem-write': 'SEO inventory failed: filesystem failure while writing reports; no current totals were generated.',
  };
  console.error(messages[kind]);
  process.exitCode = 1;
});
