import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedingDto } from './dto/create-feeding.dto';
import { UpdateFeedingDto } from './dto/update-feeding.dto';

@Injectable()
export class FeedingService {
  constructor(private prisma: PrismaService) {}

  async create(createFeedingDto: CreateFeedingDto) {
    const {
      farmId,
      userId,
      feedDetails,
      // app simple payload fields
      feedingMode,
      date,
      animalIds,
      groupName,
      feedName,
      quantity,
      purchasePrice,
      supplier,
      transportCost,
      grazingDuration,
      customHours,
      grazingCost,
      ...rest
    } = createFeedingDto as any;

    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Build program shape compatible with schema
    const programType = feedingMode
      ? feedingMode === 'Single'
        ? 'Single Animal'
        : 'Group'
      : rest.programType; // fallback to provided programType

    // If feedDetails array provided, use as-is
    let detailsToCreate = feedDetails as any[] | undefined;
    if (!detailsToCreate) {
      // Construct a single FeedDetails entry from simplified payload when present
      if (date || feedName || quantity) {
        const asDate = date ? new Date(date as any) : new Date();
        detailsToCreate = [
          {
            feedType: rest.feedType || 'Feed',
            feedName: feedName || undefined,
            source: feedName || 'Unspecified',
            schedule: 'Once',
            quantity:
              typeof quantity === 'number' ? quantity : Number(quantity) || 0,
            date: asDate,
            cost:
              typeof purchasePrice === 'number'
                ? purchasePrice
                : Number(purchasePrice) || undefined,
            supplier: supplier || undefined,
            transportCost:
              typeof transportCost === 'number'
                ? transportCost
                : Number(transportCost) || undefined,
          },
        ];
      }
    }

    const payload: any = {
      ...rest,
      programType,
      groupName: groupName ?? rest.groupName,
      grazingDuration: grazingDuration ?? rest.grazingDuration,
      customHours:
        typeof customHours === 'number'
          ? customHours
          : Number(customHours) || undefined,
      grazingCost:
        typeof grazingCost === 'number'
          ? grazingCost
          : Number(grazingCost) || undefined,
      timeOfDay: Array.isArray(rest.timeOfDay) ? rest.timeOfDay : [],
      farm: { connect: { id: farmId } },
      user: { connect: { id: userId } },
      feedDetails: detailsToCreate ? { create: detailsToCreate } : undefined,
    };

    return this.prisma.feedingProgram.create({
      data: payload,
      include: { feedDetails: true },
    });
  }

  async findAll(farmId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [feedingPrograms, total] = await this.prisma.$transaction([
      this.prisma.feedingProgram.findMany({
        where: { farmId },
        skip,
        take,
        include: {
          feedDetails: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feedingProgram.count({ where: { farmId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: feedingPrograms,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const feedingProgram = await this.prisma.feedingProgram.findUnique({
      where: { id },
      include: {
        feedDetails: true,
      },
    });

    if (!feedingProgram) {
      throw new NotFoundException(`Feeding program with ID ${id} not found`);
    }

    return feedingProgram;
  }

  async update(id: string, updateFeedingDto: UpdateFeedingDto) {
    const { feedDetails, ...programData } = updateFeedingDto;

    return this.prisma.$transaction(async (prisma) => {
      const existingProgram = await prisma.feedingProgram.findUnique({
        where: { id },
      });

      if (!existingProgram) {
        throw new NotFoundException(`Feeding program with ID ${id} not found`);
      }

      // Update the feeding program itself
      const updatedProgram = await prisma.feedingProgram.update({
        where: { id },
        data: {
          ...programData,
        },
      });

      if (feedDetails) {
        // Delete existing feed details
        await prisma.feedDetails.deleteMany({
          where: { feedingProgramId: id },
        });

        // Create new feed details
        await prisma.feedDetails.createMany({
          data: feedDetails.map((detail) => ({
            ...detail,
            feedingProgramId: id,
          })),
        });
      }

      return prisma.feedingProgram.findUnique({
        where: { id },
        include: { feedDetails: true },
      });
    });
  }

  async remove(id: string) {
    const feedingProgram = await this.prisma.feedingProgram.findUnique({
      where: { id },
    });

    if (!feedingProgram) {
      throw new NotFoundException(`Feeding program with ID ${id} not found`);
    }

    // With `onDelete: Cascade` in the schema, Prisma will automatically delete related FeedDetails.
    await this.prisma.feedingProgram.delete({ where: { id } });

    return {
      message: `Feeding program with ID ${id} and its details have been removed.`,
    };
  }

  async findAllGrazing(
    farmId: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.feedDetails = {
        some: {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };
    }

    const whereClause = {
      farmId,
      grazingDuration: { not: null },
      ...dateFilter,
    };

    const [grazingRecords, total] = await this.prisma.$transaction([
      this.prisma.feedingProgram.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          feedDetails: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feedingProgram.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: grazingRecords,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getGrazingSummary(
    farmId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.feedDetails = {
        some: {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };
    }

    const whereClause = {
      farmId,
      grazingDuration: { not: null },
      ...dateFilter,
    };

    const grazingRecords = await this.prisma.feedingProgram.findMany({
      where: whereClause,
      include: {
        feedDetails: true,
      },
    });

    // Calculate statistics
    const totalRecords = grazingRecords.length;
    const totalCost = grazingRecords.reduce(
      (sum, record) => sum + (record.grazingCost || 0),
      0,
    );

    // Count by duration type
    const durationBreakdown = grazingRecords.reduce(
      (acc, record) => {
        const duration = record.grazingDuration || 'Unknown';
        acc[duration] = (acc[duration] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate average custom hours for "Other" duration
    const customHoursRecords = grazingRecords.filter(
      (r) => r.grazingDuration === 'Other' && r.customHours,
    );
    const avgCustomHours =
      customHoursRecords.length > 0
        ? customHoursRecords.reduce((sum, r) => sum + (r.customHours || 0), 0) /
          customHoursRecords.length
        : 0;

    // Get unique animal count (approximate - based on animalId or groupName)
    const uniqueAnimals = new Set(
      grazingRecords.filter((r) => r.animalId).map((r) => r.animalId),
    ).size;

    const uniqueGroups = new Set(
      grazingRecords.filter((r) => r.groupName).map((r) => r.groupName),
    ).size;

    return {
      totalRecords,
      totalCost,
      averageCostPerRecord: totalRecords > 0 ? totalCost / totalRecords : 0,
      durationBreakdown,
      averageCustomHours: avgCustomHours,
      uniqueAnimals,
      uniqueGroups,
      dateRange: {
        start: startDate || null,
        end: endDate || null,
      },
    };
  }

  async createGrazing(createGrazingDto: any) {
    const {
      farmId,
      userId,
      date,
      grazingDuration,
      customHours,
      grazingCost,
      animalIds,
      animalId,
      groupName,
      notes,
    } = createGrazingDto;

    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Determine program type based on what's provided
    let programType = 'Group';
    if (animalId) {
      programType = 'Single Animal';
    }

    // Create a feed detail entry for the grazing record
    const grazingDate = date ? new Date(date) : new Date();
    const feedDetail = {
      feedType: 'Grazing',
      feedName: 'Field Grazing',
      source: 'Pasture',
      schedule: grazingDuration || 'Whole Day',
      quantity: 0, // Not applicable for grazing
      date: grazingDate,
      cost: grazingCost || 0,
    };

    const payload: any = {
      programType,
      feedType: 'Basal Feeds',
      grazingDuration,
      customHours: customHours || undefined,
      grazingCost: grazingCost || undefined,
      groupName: groupName || undefined,
      animalId: animalId || undefined,
      notes: notes || undefined,
      timeOfDay: [],
      farm: { connect: { id: farmId } },
      user: { connect: { id: userId } },
      feedDetails: {
        create: [feedDetail],
      },
    };

    return this.prisma.feedingProgram.create({
      data: payload,
      include: { feedDetails: true },
    });
  }
}
