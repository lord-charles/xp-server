import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsModule', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            farm: { findUnique: jest.fn() },
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
          },
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
});
