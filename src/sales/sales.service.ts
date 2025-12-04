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

  // Specialized sale recording methods for mobile app

  async createBeefSale(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        livestockId: data.livestockId,
        animalId: data.animalId,
        name: `Beef Cattle ${data.animalId}`,
        category: 'beefCattle',
        breed: 'Beef Cattle',
        age: 'N/A',
        weight: data.weight,
        beefQuality: data.beefQuality || 'Medium',
        saleDate: new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        health: 'good',
        purpose: 'Meat Production',
        images: [],
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

    return { success: true, data: saleListing };
  }

  async createMilkSale(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const category = data.category === 'goat' ? 'dairyGoats' : 'dairyCattle';

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        livestockId: data.livestockId,
        animalId: data.animalId,
        name: `${category === 'dairyGoats' ? 'Dairy Goat' : 'Dairy Cattle'} ${data.animalId}`,
        category,
        breed: category === 'dairyGoats' ? 'Dairy Goat' : 'Dairy Cattle',
        age: 'N/A',
        weight: 0,
        milkYield: data.milkYield,
        milkQuality: data.milkQuality || 'Medium',
        milkingDate: new Date(data.milkingDate),
        homeUseQuantity: data.homeUseQuantity || 0,
        saleQuantity: data.saleQuantity || 0,
        saleDate: data.saleDate ? new Date(data.saleDate) : undefined,
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice ? data.salePrice * (data.saleQuantity || 0) : 0,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: data.saleQuantity > 0 ? SaleStatus.SOLD : SaleStatus.AVAILABLE,
        health: 'good',
        purpose: 'Milk Production',
        images: [],
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

    return { success: true, data: saleListing };
  }

  async createSwineSale(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        livestockId: data.livestockId,
        animalId: data.animalId,
        name: `Swine ${data.animalId}`,
        category: 'swine',
        breed: 'Swine',
        age: 'N/A',
        weight: data.saleWeight,
        saleDate: new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice * data.saleWeight,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        health: 'good',
        purpose: 'Meat Production',
        images: [],
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

    return { success: true, data: saleListing };
  }

  async createSheepSale(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const isWoolSale = data.saleType === 'wool';

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        livestockId: data.livestockId,
        animalId: data.animalId,
        name: `Sheep ${data.animalId}`,
        category: 'sheep',
        breed: 'Sheep',
        age: 'N/A',
        weight: isWoolSale ? data.woolWeight : data.saleWeight,
        woolYield: isWoolSale ? `${data.woolWeight} kg` : undefined,
        saleDate: isWoolSale
          ? new Date(data.shearingDate)
          : new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: isWoolSale ? data.salePrice : data.salePrice * data.saleWeight,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        health: 'good',
        purpose: isWoolSale ? 'Wool Production' : 'Meat Production',
        images: [],
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

    return { success: true, data: saleListing };
  }

  async createRabbitSale(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        livestockId: data.livestockId,
        animalId: data.animalId,
        name: `Rabbit ${data.animalId}`,
        category: 'rabbits',
        breed: 'Rabbit',
        age: 'N/A',
        weight: data.saleWeight,
        saleDate: new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice * data.saleWeight,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        health: 'good',
        purpose: 'Meat Production',
        notes: data.groupId ? `Group: ${data.groupId}` : undefined,
        images: [],
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

    return { success: true, data: saleListing };
  }

  async createPoultryTransaction(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const { saleType } = data;
    let saleData: any = {
      farmId: data.farmId,
      livestockId: data.livestockId,
      animalId: data.flockId,
      name: `Poultry Flock ${data.flockId}`,
      category: 'poultry',
      breed: 'Poultry',
      age: 'N/A',
      health: 'good',
      images: [],
    };

    if (saleType === 'broiler') {
      saleData = {
        ...saleData,
        quantity: data.numberSold,
        weight: data.saleWeight,
        saleDate: new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice * data.saleWeight,
        pricePerBird: data.salePrice * (data.saleWeight / data.numberSold),
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        purpose: 'Meat Production',
      };
    } else if (saleType === 'egg_production') {
      saleData = {
        ...saleData,
        quantity: data.numberOfLayers,
        weight: (data.eggCount * data.averageEggWeight) / 1000,
        saleDate: new Date(data.productionDate),
        eggProductionRate: `${((data.eggCount / data.numberOfLayers) * 100).toFixed(1)}%`,
        price: 0,
        status: SaleStatus.AVAILABLE,
        purpose: 'Egg Production',
        notes: `Eggs: ${data.eggCount}, Avg Weight: ${data.averageEggWeight}g`,
      };
    } else if (saleType === 'egg_sales') {
      saleData = {
        ...saleData,
        quantity: data.numberOfEggs,
        weight: data.numberOfEggs * 0.055, // Approximate weight
        saleDate: new Date(data.saleDate),
        marketPrice: data.marketPrice,
        salePrice: data.salePrice,
        price: data.salePrice * data.numberOfEggs,
        buyerName: data.buyerName,
        buyerType: data.buyerType,
        status: SaleStatus.SOLD,
        purpose: 'Egg Sales',
        notes: `Trays: ${data.trays}, Eggs: ${data.numberOfEggs}`,
      };
    }

    const saleListing = await this.prisma.saleListing.create({
      data: saleData,
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

    return { success: true, data: saleListing };
  }

  async createEggProduction(data: any) {
    const farm = await this.prisma.farm.findUnique({
      where: { id: data.farmId },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const productionRate = (
      (data.eggCount / data.numberOfLayers) *
      100
    ).toFixed(1);
    const totalWeight = (data.eggCount * data.avgEggWeight) / 1000;

    const saleListing = await this.prisma.saleListing.create({
      data: {
        farmId: data.farmId,
        animalId: data.flockId,
        name: `Egg Production - Flock ${data.flockId}`,
        category: 'poultry',
        breed: 'Layer',
        age: 'N/A',
        quantity: data.numberOfLayers,
        weight: totalWeight,
        saleDate: new Date(data.date),
        eggProductionRate: `${productionRate}%`,
        price: 0,
        status: SaleStatus.AVAILABLE,
        health: 'good',
        purpose: 'Egg Production',
        notes: `Grade A: ${data.gradeA || 0}, Grade B: ${data.gradeB || 0}, Grade C: ${data.gradeC || 0}. Total: ${data.eggCount} eggs`,
        images: [],
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

    return { success: true, data: saleListing };
  }
}
