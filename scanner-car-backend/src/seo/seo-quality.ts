export const SEO_SCORE_WEIGHTS = {
  title: 10,
  description: 20,
  symptoms: 15,
  causes: 15,
  solutions: 15,
  severity: 5,
  diagnosisReady: 10,
  relatedCodeEvidence: 5,
  manufacturerEvidence: 5,
} as const;

export const SEO_DUPLICATE_SIMILARITY_THRESHOLD = 0.95;
export const SEO_OEM_GENERIC_SIMILARITY_THRESHOLD = 0.9;
export const SEO_SIMILARITY_DECIMAL_PLACES = 6;

export const SEO_LEVELS = ['STRONG', 'IMPROVABLE', 'THIN', 'DUPLICATE_RISK', 'OEM_GENERIC'] as const;
export type SeoLevel = (typeof SEO_LEVELS)[number];
export type IndexationRecommendation = 'index,follow' | 'noindex,follow';

export function isSeoIndexableLevel(level: SeoLevel): boolean {
  return level === 'STRONG' || level === 'IMPROVABLE';
}

export function indexationRecommendationForLevel(level: SeoLevel): IndexationRecommendation {
  return isSeoIndexableLevel(level) ? 'index,follow' : 'noindex,follow';
}

export type EditorialListItem = string | { symptom?: string | null; cause?: string | null; solution?: string | null };

export interface SeoQualityInput {
  title: string | null | undefined;
  description: string | null | undefined;
  descriptionSource?: 'stored' | 'runtime-fallback';
  severity: string | null | undefined;
  symptoms: readonly EditorialListItem[];
  causes: readonly EditorialListItem[];
  solutions: readonly EditorialListItem[];
  isGeneric: boolean;
  relatedCodeEvidence?: boolean;
  duplicateRisk?: boolean;
  oemGeneric?: boolean;
  manufacturerEvidencePoints?: number;
}

export interface SeoQualityResult {
  score: number;
  rawScore: number;
  level: SeoLevel;
  missingFields: string[];
  flags: {
    thin: boolean;
    duplicateRisk: boolean;
    oemGeneric: boolean;
  };
  indexationRecommendation: IndexationRecommendation;
  scoreComponents: Record<string, number>;
  hasDescription: boolean;
  hasSymptoms: boolean;
  hasCauses: boolean;
  hasSolutions: boolean;
  hasDiagnosis: boolean;
}

export interface EnglishTranslationFields {
  title?: string | null;
  description?: string | null;
  symptoms?: string | null;
  causes?: string | null;
  solutions?: string | null;
}

const LIST_KEYS = ['symptom', 'cause', 'solution'] as const;

export function normalizeSeoText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasMeaningfulText(value: string | null | undefined): boolean {
  return normalizeSeoText(value).length > 0;
}

function itemText(item: EditorialListItem, key: (typeof LIST_KEYS)[number]): string {
  if (typeof item === 'string') return item;
  return item[key] ?? '';
}

export function countMeaningfulItems(items: readonly EditorialListItem[], key: (typeof LIST_KEYS)[number]): number {
  return items.filter((item) => hasMeaningfulText(itemText(item, key))).length;
}

export function editorialValues(input: Pick<SeoQualityInput, 'title' | 'description' | 'symptoms' | 'causes' | 'solutions'>): string[] {
  return [
    input.title ?? '',
    input.description ?? '',
    ...input.symptoms.map((item) => itemText(item, 'symptom')),
    ...input.causes.map((item) => itemText(item, 'cause')),
    ...input.solutions.map((item) => itemText(item, 'solution')),
  ];
}

export function normalizedEditorialSignature(input: Pick<SeoQualityInput, 'title' | 'description' | 'symptoms' | 'causes' | 'solutions'>): string {
  return editorialValues(input).map((value) => normalizeSeoText(value)).join('|');
}

export function editorialTokenSet(input: Pick<SeoQualityInput, 'title' | 'description' | 'symptoms' | 'causes' | 'solutions'>): Set<string> {
  return new Set(
    normalizeSeoText(editorialValues(input).join(' '))
      .split(' ')
      .filter(Boolean),
  );
}

export function jaccardSimilarity(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1;
  if (left.size === 0 || right.size === 0) return 0;

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

export function roundedSeoSimilarity(value: number): number {
  return Number(value.toFixed(SEO_SIMILARITY_DECIMAL_PLACES));
}

export function roundedJaccardSimilarity(left: Set<string>, right: Set<string>): number {
  return roundedSeoSimilarity(jaccardSimilarity(left, right));
}

export function isSeoSimilarityAtLeast(value: number, threshold: number): boolean {
  return roundedSeoSimilarity(value) >= roundedSeoSimilarity(threshold);
}

export function missingEnglishFields(translation: EnglishTranslationFields | undefined): string[] {
  return ['title', 'description', 'symptoms', 'causes', 'solutions'].filter((field) =>
    !hasMeaningfulText(translation?.[field as keyof EnglishTranslationFields]),
  );
}

function editorialDescription(input: SeoQualityInput): string | null | undefined {
  return input.descriptionSource === 'runtime-fallback' ? undefined : input.description;
}

function listPoints(count: number, weight: number): number {
  if (count <= 0) return 0;
  if (count === 1) return Math.ceil(weight / 2);
  return weight;
}

/**
 * Calculate the bounded, deterministic internal SEO quality assessment.
 * A persisted diagnosis field does not exist; diagnosis readiness is therefore
 * the presence of description, symptoms, causes, and solutions.
 */
export function calculateSeoQuality(input: SeoQualityInput): SeoQualityResult {
  const description = editorialDescription(input);
  const hasTitle = hasMeaningfulText(input.title);
  const hasDescription = hasMeaningfulText(description);
  const symptomCount = countMeaningfulItems(input.symptoms, 'symptom');
  const causeCount = countMeaningfulItems(input.causes, 'cause');
  const solutionCount = countMeaningfulItems(input.solutions, 'solution');
  const hasSymptoms = symptomCount > 0;
  const hasCauses = causeCount > 0;
  const hasSolutions = solutionCount > 0;
  const hasSeverity = hasMeaningfulText(input.severity);
  const hasDiagnosis = hasDescription && hasSymptoms && hasCauses && hasSolutions;

  const missingFields: string[] = [];
  if (!hasTitle) missingFields.push('title');
  if (!hasDescription) missingFields.push('description');
  if (!hasSymptoms) missingFields.push('symptoms');
  if (!hasCauses) missingFields.push('causes');
  if (!hasSolutions) missingFields.push('solutions');
  if (!hasSeverity) missingFields.push('severity');
  if (!hasDiagnosis) missingFields.push('diagnosis_ready_structure');

  const scoreComponents = {
    title: hasTitle ? SEO_SCORE_WEIGHTS.title : 0,
    description: hasDescription ? SEO_SCORE_WEIGHTS.description : 0,
    symptoms: listPoints(symptomCount, SEO_SCORE_WEIGHTS.symptoms),
    causes: listPoints(causeCount, SEO_SCORE_WEIGHTS.causes),
    solutions: listPoints(solutionCount, SEO_SCORE_WEIGHTS.solutions),
    severity: hasSeverity ? SEO_SCORE_WEIGHTS.severity : 0,
    diagnosisReady: hasDiagnosis ? SEO_SCORE_WEIGHTS.diagnosisReady : 0,
    relatedCodeEvidence: input.relatedCodeEvidence ? SEO_SCORE_WEIGHTS.relatedCodeEvidence : 0,
    manufacturerEvidence: Math.max(0, Math.min(10, input.manufacturerEvidencePoints ?? (input.isGeneric ? 5 : 5))),
  };

  const rawScore = Object.values(scoreComponents).reduce((total, value) => total + value, 0);
  const score = Math.min(100, rawScore);
  const isStrong = score >= 80 && hasTitle && hasDescription && hasSymptoms && hasCauses && hasSolutions;
  const isImprovable = score >= 55 && hasDescription && [hasSymptoms, hasCauses, hasSolutions].filter(Boolean).length >= 2;
  const thin = !isStrong && !isImprovable;
  const duplicateRisk = input.duplicateRisk === true;
  const oemGeneric = input.oemGeneric === true;

  let level: SeoLevel;
  if (duplicateRisk) level = 'DUPLICATE_RISK';
  else if (oemGeneric) level = 'OEM_GENERIC';
  else if (thin) level = 'THIN';
  else if (isStrong) level = 'STRONG';
  else level = 'IMPROVABLE';

  return {
    score,
    rawScore,
    level,
    missingFields,
    flags: { thin, duplicateRisk, oemGeneric },
    indexationRecommendation: indexationRecommendationForLevel(level),
    scoreComponents,
    hasDescription,
    hasSymptoms,
    hasCauses,
    hasSolutions,
    hasDiagnosis,
  };
}
