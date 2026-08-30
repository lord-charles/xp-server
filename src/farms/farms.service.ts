import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService, private billing: BillingService) { }

  async findAll(page = 1, limit = 10, search?: string) {
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { county: { contains: search, mode: 'insensitive' as const } },
        { administrativeLocation: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [farms, total] = await Promise.all([
      this.prisma.farm.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.farm.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: farms,
      meta: {
        total,
        page,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    return farm;
  }

  async update(id: string, updateFarmDto: UpdateFarmDto) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    return this.prisma.farm.update({
      where: { id },
      data: updateFarmDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    await this.prisma.farm.delete({
      where: { id },
    });

    return { message: 'Farm deleted successfully' };
  }

  async create(createFarmDto: CreateFarmDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createFarmDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createFarmDto.userId} not found`);
    }
    const farm = await this.prisma.farm.create({
      data: createFarmDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
    });
    // The pricing terms treat every additional farm as a separately billed
    // entity, while retaining one payer account for the farmer.
    const account = await this.prisma.billingAccount.findUnique({ where: { userId: user.id } });
    if (account) await this.billing.ensureSubscription(account.id, farm.id);
    return farm;
  }
}
