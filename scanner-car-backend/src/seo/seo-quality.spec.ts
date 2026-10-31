import {
  calculateSeoQuality,
  indexationRecommendationForLevel,
  isSeoSimilarityAtLeast,
  missingEnglishFields,
  roundedSeoSimilarity,
} from './seo-quality';

describe('SEO level indexation mappings', () => {
  it.each([
    ['STRONG', 'index,follow'],
    ['IMPROVABLE', 'index,follow'],
    ['THIN', 'noindex,follow'],
    ['DUPLICATE_RISK', 'noindex,follow'],
    ['OEM_GENERIC', 'noindex,follow'],
  ] as const)('%s maps to %s', (level, recommendation) => {
    expect(indexationRecommendationForLevel(level)).toBe(recommendation);
  });
});

describe('SEO similarity parity', () => {
  it('uses the shared rounded boundary rule for runtime and report classifications', () => {
    expect(roundedSeoSimilarity(0.8999996)).toBe(0.9);
    expect(isSeoSimilarityAtLeast(0.8999996, 0.9)).toBe(true);
    expect(isSeoSimilarityAtLeast(0.8999994, 0.9)).toBe(false);
  });
});

describe('calculateSeoQuality', () => {
  const base = {
    title: '  Sensor example  ',
    description: '  Stored editorial description. ',
    severity: 'Moderada',
    symptoms: ['One meaningful symptom'],
    causes: ['One meaningful cause', 'Another cause'],
    solutions: [],
    isGeneric: true,
    relatedCodeEvidence: true,
  } as const;

  it('normalizes whitespace, awards partial list credit, and keeps the result bounded', () => {
    const result = calculateSeoQuality(base);

    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoreComponents.symptoms).toBe(8);
    expect(result.missingFields).toContain('diagnosis_ready_structure');
    expect(result.level).toBe('IMPROVABLE');
  });

  it('does not count a runtime OEM fallback description as editorial content', () => {
    const result = calculateSeoQuality({
      ...base,
      description: 'Manufacturer fallback text',
      descriptionSource: 'runtime-fallback',
      symptoms: [],
      causes: [],
      solutions: [],
      isGeneric: false,
      relatedCodeEvidence: false,
    });

    expect(result.hasDescription).toBe(false);
    expect(result.missingFields).toEqual(expect.arrayContaining(['description', 'symptoms', 'causes', 'solutions']));
    expect(result.level).toBe('THIN');
  });

  it('applies duplicate-risk precedence over OEM-generic', () => {
    const result = calculateSeoQuality({
      ...base,
      duplicateRisk: true,
      oemGeneric: true,
    });

    expect(result.flags.duplicateRisk).toBe(true);
    expect(result.flags.oemGeneric).toBe(true);
    expect(result.level).toBe('DUPLICATE_RISK');
    expect(result.indexationRecommendation).toBe('noindex,follow');
  });
});

describe('missingEnglishFields', () => {
  it('reports whitespace-only translation fields', () => {
    expect(missingEnglishFields({ title: 'Title', description: ' ', symptoms: 'Symptoms' })).toEqual([
      'description',
      'causes',
      'solutions',
    ]);
  });
});
