import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(farmId: string) {
    if (!farmId) {
      throw new BadRequestException('farmId is required');
    }

    try {
      // Parallel queries where possible
      const [
        mammalCount,
        poultrySum,
        employeeLinks,
        feedingProgramsCount,
        totalFeedQuantity,
        activeBreedingCount,
        goodsCount,
        soldListings,
        vaccinationsCount,
        treatmentsCount,
        disordersCount,
        dewormingCount,
        boostersCount,
        allergiesCount,
      ] = await Promise.all([
        // Mammals count (each mammal counts as 1)
        this.prisma.livestock.count({
          where: { farmId, category: 'mammal', status: 'active' },
        }),
        // Poultry current quantity sum
        this.prisma.poultry.aggregate({
          _sum: { currentQuantity: true },
          where: { livestock: { farmId, status: 'active', category: 'poultry' } },
        }),
        // Employee distinct links for farm
        this.prisma.employeeFarm.findMany({
          where: { farmId },
          select: { employeeId: true },
          distinct: ['employeeId'],
        }),
        // Feeding programs count
        this.prisma.feedingProgram.count({ where: { farmId } }),
        // Total feed quantity across feed details for farm
        this.prisma.feedDetails.aggregate({
          _sum: { quantity: true },
          where: { feedingProgram: { farmId } },
        }),
        // Active breeding records (no birth recorded / no birth date)
        this.prisma.breedingRecord.count({
          where: { farmId, birthDate: null },
        }),
        // Inventory goods count for farm
        this.prisma.goodsInStock.count({ where: { inventory: { farmId } } }),
        // Sold sale listings (we'll compute count and value in code)
        this.prisma.saleListing.findMany({
          where: { farmId, status: 'sold' },
          select: { saleAmount: true, salePrice: true },
        }),
        // Health-related counts
        this.prisma.vaccinationRecord.count({ where: { farmId } }),
        this.prisma.treatmentRecord.count({ where: { farmId } }),
        this.prisma.geneticDisorderRecord.count({ where: { farmId } }),
        this.prisma.dewormingRecord.count({ where: { farmId } }),
        this.prisma.boosterRecord.count({ where: { farmId } }),
        this.prisma.allergyRecord.count({ where: { farmId } }),
      ]);

      const poultryQuantity = poultrySum._sum.currentQuantity || 0;
      const livestockCount = mammalCount + poultryQuantity;

      const employeeCount = employeeLinks.length;

      const totalFeed = totalFeedQuantity._sum.quantity || 0;

      const salesCount = soldListings.length;
      const totalSalesValue = soldListings.reduce((sum, s) => {
        const val = s.saleAmount ?? s.salePrice ?? 0;
        return sum + (isNaN(val as any) ? 0 : Number(val));
      }, 0);

      const healthRecordsCount =
        vaccinationsCount +
        treatmentsCount +
        disordersCount +
        dewormingCount +
        boostersCount +
        allergiesCount;

      return {
        farmId,
        livestockCount,
        employeeCount,
        feedingProgramsCount,
        totalFeedAvailableKg: Math.round(totalFeed),
        breedingProgramsCount: activeBreedingCount,
        inventoryCount: goodsCount,
        sales: {
          count: salesCount,
          totalValue: totalSalesValue,
        },
        health: {
          recordsCount: healthRecordsCount,
        },
      };
    } catch (err) {
      // Graceful fallback when DB is temporarily unreachable
      return {
        farmId,
        livestockCount: 0,
        employeeCount: 0,
        feedingProgramsCount: 0,
        totalFeedAvailableKg: 0,
        breedingProgramsCount: 0,
        inventoryCount: 0,
        sales: {
          count: 0,
          totalValue: 0,
        },
        health: {
          recordsCount: 0,
        },
      };
    }
  }
}
