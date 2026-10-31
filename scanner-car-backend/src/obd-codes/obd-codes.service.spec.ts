import { PrismaService } from '../prisma/prisma.service';
import { SeoPolicyService } from '../seo/seo-policy.service';
import { ObdCodesService } from './obd-codes.service';

describe('ObdCodesService SEO policy propagation', () => {
  it('adds only the public boolean policy signal to a code detail response', async () => {
    const found = {
      id: 42,
      code: 'P0420',
      title: 'Catalyst efficiency',
      description: 'Stored description',
      severity: 'Moderada',
      manufacturerId: 1,
      category: { code: 'P' },
      manufacturer: { id: 1, slug: 'generic', name: 'Generic', isGeneric: true },
      symptoms: [],
      causes: [],
      solutions: [],
      vehicleCompat: [],
      translations: [],
    };
    const prisma = {
      manufacturer: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
      oBDCode: {
        findFirst: jest.fn().mockResolvedValue(found),
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const seoPolicy = {
      getPublicPolicy: jest.fn().mockResolvedValue({ seoIndexable: false }),
    } as unknown as SeoPolicyService;
    const service = new ObdCodesService(prisma, seoPolicy);

    const result = await service.findByCode('p0420');

    expect(result).toMatchObject({ code: 'P0420', seoIndexable: false });
    expect(result).not.toHaveProperty('score');
    expect(result).not.toHaveProperty('level');
    expect(seoPolicy.getPublicPolicy).toHaveBeenCalledWith(42);
  });

  it('does not generate content for an OEM row with a missing description', async () => {
    const oem = {
      id: 43,
      code: 'P0420',
      title: 'Catalyst efficiency',
      description: null,
      severity: 'Moderada',
      manufacturerId: 2,
      category: { code: 'P' },
      manufacturer: { id: 2, slug: 'toyota', name: 'Toyota', isGeneric: false },
      symptoms: [],
      causes: [],
      solutions: [],
      vehicleCompat: [],
      translations: [],
    };
    const prisma = {
      manufacturer: {
        findFirst: jest.fn().mockResolvedValue({ id: 1 }),
        findUnique: jest.fn().mockResolvedValue(oem.manufacturer),
      },
      oBDCode: {
        findFirst: jest.fn().mockResolvedValue(oem),
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const seoPolicy = {
      getPublicPolicy: jest.fn().mockResolvedValue({ seoIndexable: false }),
    } as unknown as SeoPolicyService;
    const service = new ObdCodesService(prisma, seoPolicy);

    const result = await service.findByCode('p0420', 'es', 'toyota');

    expect(result?.description).toBeNull();
  });
});
