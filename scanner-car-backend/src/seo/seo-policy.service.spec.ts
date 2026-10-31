import { PrismaService } from '../prisma/prisma.service';
import { policyQualityInput, SeoPolicyService } from './seo-policy.service';
import {
  calculateSeoQuality,
  editorialTokenSet,
  isSeoSimilarityAtLeast,
  isSeoIndexableLevel,
  roundedJaccardSimilarity,
  SEO_DUPLICATE_SIMILARITY_THRESHOLD,
  SEO_OEM_GENERIC_SIMILARITY_THRESHOLD,
} from './seo-quality';
import { SEO_PARITY_BOUNDARY_FIXTURES } from './seo-parity.fixtures';

describe('SeoPolicyService', () => {
  const generic = {
    id: 1,
    code: 'P0420',
    title: 'Catalyst system efficiency below threshold',
    description: 'Stored generic description.',
    severity: 'Moderada',
    category: { code: 'P' },
    manufacturer: { id: 1, isGeneric: true },
    symptoms: [{ symptom: 'Stored symptom' }],
    causes: [{ cause: 'Stored cause' }],
    solutions: [{ solution: 'Stored solution' }],
  };

  it('propagates the central quality decision and caches the published index', async () => {
    const prisma = {
      oBDCode: { findMany: jest.fn().mockResolvedValue([generic]) },
    } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);

    await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: true });
    await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: true });
    expect(prisma.oBDCode.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.oBDCode.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 25_001,
      orderBy: [{ code: 'asc' }, { manufacturerId: 'asc' }, { id: 'asc' }],
    }));
  });

  it('fails closed when the bounded published query reports an overflow row', async () => {
    const findMany = jest.fn().mockImplementation(({ take }: { take: number }) =>
      Promise.resolve(Array.from({ length: take }, (_, index) => ({ ...generic, id: index + 1 }))));
    const prisma = { oBDCode: { findMany } } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);

    await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: false });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 25_001 }));
  });

  it('coalesces concurrent policy index requests', async () => {
    let resolveQuery!: (rows: typeof generic[]) => void;
    const query = new Promise<typeof generic[]>((resolve) => { resolveQuery = resolve; });
    const findMany = jest.fn().mockReturnValue(query);
    const prisma = { oBDCode: { findMany } } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);

    const first = service.getPublicPolicy(generic.id);
    const second = service.getPublicPolicy(generic.id);
    expect(findMany).toHaveBeenCalledTimes(1);

    resolveQuery([generic]);
    await expect(Promise.all([first, second])).resolves.toEqual([
      { seoIndexable: true },
      { seoIndexable: true },
    ]);
  });

  it('rebuilds the bounded index after TTL expiry without relying on real timers', async () => {
    jest.useFakeTimers();
    try {
      const findMany = jest.fn().mockResolvedValue([generic]);
      const prisma = { oBDCode: { findMany } } as unknown as PrismaService;
      const service = new SeoPolicyService(prisma);

      await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: true });
      jest.advanceTimersByTime(15 * 60 * 1000 + 1);
      await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: true });

      expect(findMany).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps parity fixtures at the declared rounded threshold boundaries', () => {
    expect(SEO_PARITY_BOUNDARY_FIXTURES.map(({ name, expected }) => ({
      name,
      similarity: expected.similarity,
      duplicateRisk: expected.generic.flags.duplicateRisk,
      oemGeneric: expected.oem.flags.oemGeneric,
    }))).toEqual([
      { name: 'duplicate threshold exact', similarity: 0.95, duplicateRisk: true, oemGeneric: true },
      { name: 'OEM threshold exact', similarity: 0.9, duplicateRisk: false, oemGeneric: true },
      { name: 'OEM threshold below', similarity: 0.8, duplicateRisk: false, oemGeneric: false },
    ]);
  });

  it.each(SEO_PARITY_BOUNDARY_FIXTURES)('keeps runtime and audit/shared classification aligned at $name', async (fixture) => {
    const prisma = {
      oBDCode: { findMany: jest.fn().mockResolvedValue([fixture.generic, fixture.oem]) },
    } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);
    const similarity = roundedJaccardSimilarity(
      editorialTokenSet(policyQualityInput(fixture.oem, false, false, false, 5)),
      editorialTokenSet(policyQualityInput(fixture.generic, false, false, false, 5)),
    );
    const duplicateRisk = isSeoSimilarityAtLeast(similarity, SEO_DUPLICATE_SIMILARITY_THRESHOLD);
    const oemGeneric = isSeoSimilarityAtLeast(similarity, SEO_OEM_GENERIC_SIMILARITY_THRESHOLD);
    const genericInput = policyQualityInput(fixture.generic, true, duplicateRisk, false, 5);
    const oemInput = policyQualityInput(
      fixture.oem,
      true,
      duplicateRisk,
      oemGeneric,
      oemGeneric ? 5 : 10,
    );
    const auditClassification = {
      generic: calculateSeoQuality(genericInput),
      oem: calculateSeoQuality(oemInput),
    };

    expect(similarity).toBe(fixture.expected.similarity);
    expect(duplicateRisk).toBe(fixture.expected.generic.flags.duplicateRisk);
    expect(oemGeneric).toBe(fixture.expected.oem.flags.oemGeneric);
    expect(genericInput).toEqual(fixture.qualityInput.generic);
    expect(oemInput).toEqual(fixture.qualityInput.oem);
    expect(auditClassification.generic).toMatchObject(fixture.expected.generic);
    expect(auditClassification.oem).toMatchObject(fixture.expected.oem);

    const runtimePolicy = {
      generic: await service.getPublicPolicy(fixture.generic.id),
      oem: await service.getPublicPolicy(fixture.oem.id),
    };
    expect(runtimePolicy).toEqual({
      generic: { seoIndexable: isSeoIndexableLevel(auditClassification.generic.level) },
      oem: { seoIndexable: isSeoIndexableLevel(auditClassification.oem.level) },
    });
  });

  it('marks same-code OEM content as noindex when it only has runtime-fallback content', async () => {
    const oem = {
      ...generic,
      id: 2,
      description: null,
      symptoms: [],
      causes: [],
      solutions: [],
      manufacturer: { id: 2, isGeneric: false },
    };
    const prisma = {
      oBDCode: { findMany: jest.fn().mockResolvedValue([generic, oem]) },
    } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);

    await expect(service.getPublicPolicy(oem.id)).resolves.toEqual({ seoIndexable: false });
  });

  it('marks identical same-code generic and OEM content as duplicate-risk noindex', async () => {
    const oem = { ...generic, id: 2, manufacturer: { id: 2, isGeneric: false } };
    const prisma = {
      oBDCode: { findMany: jest.fn().mockResolvedValue([generic, oem]) },
    } as unknown as PrismaService;
    const service = new SeoPolicyService(prisma);

    await expect(service.getPublicPolicy(generic.id)).resolves.toEqual({ seoIndexable: false });
    await expect(service.getPublicPolicy(oem.id)).resolves.toEqual({ seoIndexable: false });
  });

});
