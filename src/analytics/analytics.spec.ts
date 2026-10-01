import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsModule', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      farm: { findUnique: jest.fn() },
      cropCycle: { findFirst: jest.fn() },
      crop: { findFirst: jest.fn() },
      employeeFarm: { findUnique: jest.fn() },
      tillageRecord: { findMany: jest.fn() },
      soilDataRecord: { findMany: jest.fn() },
      fieldConditionRecord: { findMany: jest.fn() },
      soilPrepRecord: { findMany: jest.fn() },
      sale: { findMany: jest.fn() },
      saleListing: { findMany: jest.fn() },
      feedDetails: { findMany: jest.fn() },
      vaccinationRecord: { findMany: jest.fn() },
      dewormingRecord: { findMany: jest.fn() },
      treatmentRecord: { findMany: jest.fn() },
      boosterRecord: { findMany: jest.fn() },
      breedingRecord: { findMany: jest.fn() },
      livestock: { findMany: jest.fn() },
      employee: { findMany: jest.fn() },
      inventory: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('returns normalized land preparation data and summary for the farm owner', async () => {
    const crop = { cropName: 'Maize', cycleId: 'cycle-1' };
    prisma.farm.findUnique.mockResolvedValue({
      id: 'farm-1',
      userId: 'user-1',
    });
    prisma.tillageRecord.findMany.mockResolvedValue([
      {
        id: 'tillage-1',
        cropId: 'crop-1',
        date: new Date('2026-02-10T00:00:00.000Z'),
        system: 'no-till',
        type: 'moldboard,disc | harrow',
        equipment: 'Plough',
        area: 2.5,
        areaUnit: 'acres',
        cost: 3500,
        notes: null,
        crop,
      },
    ]);
    prisma.soilDataRecord.findMany.mockResolvedValue([
      {
        id: 'soil-1',
        cropId: 'crop-1',
        date: new Date('2026-02-10T00:00:00.000Z'),
        soilType: 'loamy',
        soilPH: 'neutral',
        moistureContent: 'moist',
        organicMatter: 'medium',
        nitrogen: true,
        phosphorus: false,
        potassium: true,
        crop,
      },
    ]);
    prisma.fieldConditionRecord.findMany.mockResolvedValue([
      {
        id: 'field-1',
        cropId: 'crop-1',
        date: new Date('2026-02-10T00:00:00.000Z'),
        topography: 'well-drained',
        drainage: 'well-drained',
        previousCropResidue: 'medium',
        crop,
      },
    ]);
    prisma.soilPrepRecord.findMany.mockResolvedValue([]);

    const result = await service.getLandPreparationAnalytics(
      { farmId: 'farm-1', startDate: '2026-02-01', endDate: '2026-02-28' },
      { id: 'user-1', userType: 'user' },
    );

    expect(result.summary).toEqual({
      totalTillageCost: 3500,
      totalTillageArea: 2.5,
      tillageRecords: 1,
      soilTests: 1,
      fieldAssessments: 1,
      soilPreparationRecords: 0,
    });
    expect(result.tillage[0]).toMatchObject({
      system: 'No Till',
      type: 'Moldboard, Disc | Harrow',
      cropName: 'Maize',
    });
    expect(result.soil[0]).toMatchObject({
      soilType: 'Loamy',
      ph: 'Neutral',
      moisture: 'Moist',
    });
    expect(result.field[0]).toMatchObject({ drainage: 'Well Drained' });
  });
});
