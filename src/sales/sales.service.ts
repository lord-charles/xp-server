import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSaleListingDto,
  SaleStatus,
} from './dto/create-sale-listing.dto';
import { UpdateSaleListingDto } from './dto/update-sale-listing.dto';
import { CompleteSaleDto } from './dto/complete-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleListingDto: CreateSaleListingDto) {
    // Verify farm exists
    const farm = await this.prisma.farm.findUnique({
      where: { id: createSaleListingDto.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    // Calculate price per bird for poultry if not provided
    let pricePerBird = createSaleListingDto.pricePerBird;
    if (createSaleListingDto.quantity && !pricePerBird) {
      pricePerBird = createSaleListingDto.price / createSaleListingDto.quantity;
    }

    const saleListing = await this.prisma.saleListing.create({
      data: {
        ...createSaleListingDto,
        // Normalize date fields if provided as strings
        lastCheckup: createSaleListingDto.lastCheckup,
        milkingDate: createSaleListingDto.milkingDate
          ? new Date(createSaleListingDto.milkingDate)
          : undefined,
        saleDate: createSaleListingDto.saleDate
          ? new Date(createSaleListingDto.saleDate)
          : undefined,
        // Persist calculated/derived values
        pricePerBird,
        // Ensure arrays are set to empty when missing
        images: createSaleListingDto.images || [],
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
          },
        },
      },
    });

    return saleListing;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    farmId?: string,
    category?: string,
    status?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { purpose: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (farmId) {
      where.farmId = farmId;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Build orderBy object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [saleListings, total] = await Promise.all([
      this.prisma.saleListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              county: true,
              administrativeLocation: true,
            },
          },
        },
      }),
      this.prisma.saleListing.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: saleListings,
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
    const saleListing = await this.prisma.saleListing.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
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
        },
      },
    });

    if (!saleListing) {
      throw new NotFoundException('Sale listing not found');
    }

    return saleListing;
  }

  async update(id: string, updateSaleListingDto: UpdateSaleListingDto) {
    const existingSaleListing = await this.prisma.saleListing.findUnique({
      where: { id },
    });

    if (!existingSaleListing) {
      throw new NotFoundException('Sale listing not found');
    }

    // Calculate price per bird for poultry if quantity or price is updated
    let pricePerBird = updateSaleListingDto.pricePerBird;
    if (updateSaleListingDto.quantity || updateSaleListingDto.price) {
      const quantity =
        updateSaleListingDto.quantity || existingSaleListing.quantity;
      const price = updateSaleListingDto.price || existingSaleListing.price;

      if (quantity && !pricePerBird) {
        pricePerBird = price / quantity;
      }
    }

    const updatedSaleListing = await this.prisma.saleListing.update({
      where: { id },
      data: {
        ...updateSaleListingDto,
        // Normalize date fields if present on update
        lastCheckup: updateSaleListingDto.lastCheckup,
        milkingDate: updateSaleListingDto.milkingDate
          ? new Date(updateSaleListingDto.milkingDate as any)
          : undefined,
        saleDate: updateSaleListingDto.saleDate
          ? new Date(updateSaleListingDto.saleDate as any)
          : undefined,
        pricePerBird,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
          },
        },
      },
    });

    return updatedSaleListing;
  }

  async remove(id: string) {
    const saleListing = await this.prisma.saleListing.findUnique({
      where: { id },
    });

    if (!saleListing) {
      throw new NotFoundException('Sale listing not found');
    }

    if (saleListing.status === SaleStatus.SOLD) {
      throw new BadRequestException('Cannot delete a completed sale');
    }

    await this.prisma.saleListing.delete({
      where: { id },
    });

    return { message: 'Sale listing deleted successfully' };
  }

  async updateStatus(id: string, status: SaleStatus) {
    const saleListing = await this.prisma.saleListing.findUnique({
      where: { id },
    });

    if (!saleListing) {
      throw new NotFoundException('Sale listing not found');
    }

    const updatedSaleListing = await this.prisma.saleListing.update({
      where: { id },
      data: { status },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
          },
        },
      },
    });

    return updatedSaleListing;
  }

  async completeSale(id: string, completeSaleDto: CompleteSaleDto) {
    const saleListing = await this.prisma.saleListing.findUnique({
      where: { id },
    });

    if (!saleListing) {
      throw new NotFoundException('Sale listing not found');
    }

    if (saleListing.status === SaleStatus.SOLD) {
      throw new BadRequestException('Sale is already completed');
    }

    const updatedSaleListing = await this.prisma.saleListing.update({
      where: { id },
      data: {
        status: SaleStatus.SOLD,
        saleDate: new Date(completeSaleDto.saleDate),
        buyerName: completeSaleDto.buyerName,
        buyerContact: completeSaleDto.buyerContact,
        buyerType: completeSaleDto.buyerType,
        // Persist both saleAmount (existing) and salePrice (new) for compatibility
        saleAmount:
          completeSaleDto.salePrice !== undefined
            ? completeSaleDto.salePrice
            : completeSaleDto.saleAmount,
        salePrice: completeSaleDto.salePrice ?? completeSaleDto.saleAmount,
        marketPrice: completeSaleDto.marketPrice,
        paymentMethod: completeSaleDto.paymentMethod,
        receiptNumber: completeSaleDto.receiptNumber,
        saleNotes: completeSaleDto.notes,
        attachments: completeSaleDto.attachments || [],
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
          },
        },
      },
    });

    return updatedSaleListing;
  }

  async getSalesStatistics(farmId?: string) {
    const where: any = {};
    if (farmId) {
      where.farmId = farmId;
    }

    const [
      totalListings,
      availableListings,
      soldListings,
      reservedListings,
      totalValue,
      soldValue,
      categoryStats,
    ] = await Promise.all([
      this.prisma.saleListing.count({ where }),
      this.prisma.saleListing.count({
        where: { ...where, status: SaleStatus.AVAILABLE },
      }),
      this.prisma.saleListing.count({
        where: { ...where, status: SaleStatus.SOLD },
      }),
      this.prisma.saleListing.count({
        where: { ...where, status: SaleStatus.RESERVED },
      }),
      this.prisma.saleListing.aggregate({
        where: { ...where, status: SaleStatus.AVAILABLE },
        _sum: { price: true },
      }),
      this.prisma.saleListing.aggregate({
        where: { ...where, status: SaleStatus.SOLD },
        _sum: { saleAmount: true },
      }),
      this.prisma.saleListing.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
        _sum: { price: true },
      }),
    ]);

    return {
      overview: {
        totalListings,
        availableListings,
        soldListings,
        reservedListings,
        totalValue: totalValue._sum.price || 0,
        soldValue: soldValue._sum.saleAmount || 0,
      },
      byCategory: categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
        totalValue: stat._sum.price || 0,
      })),
    };
  }

  async getRecentSales(farmId?: string, limit: number = 10) {
    const where: any = { status: SaleStatus.SOLD };
    if (farmId) {
      where.farmId = farmId;
    }

    const recentSales = await this.prisma.saleListing.findMany({
      where,
      orderBy: { saleDate: 'desc' },
      take: limit,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            county: true,
            administrativeLocation: true,
          },
        },
      },
    });

    return recentSales;
  }
}
