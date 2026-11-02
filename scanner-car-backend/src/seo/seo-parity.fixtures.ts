import type { SeoQualityInput, SeoQualityResult } from './seo-quality';
import {
  editorialTokenSet,
  isSeoSimilarityAtLeast,
  roundedJaccardSimilarity,
  SEO_DUPLICATE_SIMILARITY_THRESHOLD,
  SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
} from './seo-quality';
import type { PolicyCode } from './seo-policy.service';

type BoundaryFixture = {
  name: string;
  generic: PolicyCode;
  oem: PolicyCode;
  qualityInput: {
    generic: SeoQualityInput;
    oem: SeoQualityInput;
  };
  expected: {
    similarity: number;
    generic: Pick<SeoQualityResult, 'level' | 'flags'>;
    oem: Pick<SeoQualityResult, 'level' | 'flags'>;
  };
};

function content(tokens: number[]): string {
  return tokens.map((token) => `token${String(token).padStart(2, '0')}`).join(' ');
}

function code(id: number, isGeneric: boolean, description: string): PolicyCode {
  return {
    id,
    code: 'P0420',
    title: 'token01',
    description,
    severity: 'Moderada',
    category: { code: 'P' },
    manufacturer: { id, isGeneric },
    symptoms: [],
    causes: [],
    solutions: [],
  } as PolicyCode;
}

function input(record: PolicyCode, relatedCodeEvidence: boolean, duplicateRisk: boolean, oemGeneric: boolean, manufacturerEvidencePoints: number): SeoQualityInput {
  return {
    title: record.title,
    description: record.description,
    descriptionSource: 'stored',
    severity: record.severity,
    symptoms: [],
    causes: [],
    solutions: [],
    isGeneric: record.manufacturer.isGeneric,
    relatedCodeEvidence,
    duplicateRisk,
    oemGeneric,
    manufacturerEvidencePoints,
  };
}

function fixture(name: string, genericTokens: number[], oemTokens: number[]): BoundaryFixture {
  const generic = code(100, true, content(genericTokens));
  const oem = code(101, false, content(oemTokens));
  const similarity = roundedJaccardSimilarity(
    editorialTokenSet(input(generic, false, false, false, 5)),
    editorialTokenSet(input(oem, false, false, false, 5)),
  );
  const duplicateRisk = isSeoSimilarityAtLeast(similarity, SEO_DUPLICATE_SIMILARITY_THRESHOLD);
  const oemGeneric = isSeoSimilarityAtLeast(similarity, SEO_OEM_GENERIC_SIMILARITY_THRESHOLD);
  return {
    name,
    generic,
    oem,
    qualityInput: {
      generic: input(generic, true, duplicateRisk, false, 5),
      oem: input(oem, true, duplicateRisk, oemGeneric, oemGeneric ? 5 : 10),
    },
    expected: {
      similarity,
      generic: {
        level: duplicateRisk ? 'DUPLICATE_RISK' : 'THIN',
        flags: { thin: true, duplicateRisk, oemGeneric: false },
      },
      oem: {
        level: duplicateRisk ? 'DUPLICATE_RISK' : oemGeneric ? 'OEM_GENERIC' : 'THIN',
        flags: { thin: true, duplicateRisk, oemGeneric },
      },
    },
  };
}

export const SEO_PARITY_BOUNDARY_FIXTURES: readonly BoundaryFixture[] = [
  fixture('duplicate threshold exact', Array.from({ length: 20 }, (_, index) => index + 1), Array.from({ length: 19 }, (_, index) => index + 1)),
  fixture('OEM threshold exact', Array.from({ length: 10 }, (_, index) => index + 1), Array.from({ length: 9 }, (_, index) => index + 1)),
  fixture('OEM threshold below', Array.from({ length: 10 }, (_, index) => index + 1), Array.from({ length: 8 }, (_, index) => index + 1)),
];
