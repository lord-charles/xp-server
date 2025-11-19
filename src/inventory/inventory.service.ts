import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const { farmId, goodsInStock, machinery, utility } = createInventoryDto;

    // Check if farm exists
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    // Find or create the main inventory record for the farm
    let inventory = await this.prisma.inventory.findFirst({
      where: { farmId },
    });

    if (!inventory) {
      inventory = await this.prisma.inventory.create({
        data: { farmId },
      });
    }

    // Create the specific inventory item
    if (goodsInStock) {
      const {
        purchaseDate,
        expirationDate,
        nextInspectionDate,
        ...rest
      } = goodsInStock as any;

      const normalizeDate = (d?: any) =>
        typeof d === 'string' ? new Date(d) : d;

      return this.prisma.goodsInStock.create({
        data: {
          ...rest,
          purchaseDate: normalizeDate(purchaseDate),
          expirationDate: normalizeDate(expirationDate),
          nextInspectionDate: normalizeDate(nextInspectionDate),
          inventoryId: inventory.id,
        },
      });
    }

    if (machinery) {
      return this.prisma.machinery.create({
        data: {
          ...machinery,
          inventoryId: inventory.id,
        },
      });
    }

    if (utility) {
      return this.prisma.utility.create({
        data: {
          ...utility,
          inventoryId: inventory.id,
        },
      });
    }
  }

  async findAll(farmId: string) {
    return this.prisma.inventory.findMany({
      where: { farmId },
      include: {
        goodsInStock: true,
        machinery: true,
        utilities: true,
      },
    });
  }

  async findOne(id: string) {
    const inventory = await this.prisma.inventory.findUnique({
        where: { id },
        include: {
            goodsInStock: true,
            machinery: true,
            utilities: true,
        },
    });

    if (!inventory) {
        throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async update(itemId: string, itemType: 'goods' | 'machinery' | 'utility', updateDto: any) {
    switch (itemType) {
      case 'goods':
        return this.updateGoodsInStock(itemId, updateDto);
      case 'machinery':
        return this.updateMachinery(itemId, updateDto);
      case 'utility':
        return this.updateUtility(itemId, updateDto);
      default:
        throw new NotFoundException('Invalid inventory item type.');
    }
  }

  private async updateGoodsInStock(id: string, data: Partial<UpdateInventoryDto['goodsInStock']>) {
    const item = await this.prisma.goodsInStock.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`GoodsInStock with ID ${id} not found`);
    }
    return this.prisma.goodsInStock.update({
      where: { id },
      data,
    });
  }

  private async updateMachinery(id: string, data: Partial<UpdateInventoryDto['machinery']>) {
    const item = await this.prisma.machinery.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Machinery with ID ${id} not found`);
    }
    return this.prisma.machinery.update({
      where: { id },
      data,
    });
  }

  private async updateUtility(id: string, data: Partial<UpdateInventoryDto['utility']>) {
    const item = await this.prisma.utility.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }
    return this.prisma.utility.update({
      where: { id },
      data,
    });
  }

  async remove(itemId: string, itemType: 'goods' | 'machinery' | 'utility') {
    switch (itemType) {
      case 'goods':
        const goods = await this.prisma.goodsInStock.findUnique({ where: { id: itemId } });
        if (!goods) throw new NotFoundException(`GoodsInStock with ID ${itemId} not found`);
        return this.prisma.goodsInStock.delete({ where: { id: itemId } });
      case 'machinery':
        const machinery = await this.prisma.machinery.findUnique({ where: { id: itemId } });
        if (!machinery) throw new NotFoundException(`Machinery with ID ${itemId} not found`);
        return this.prisma.machinery.delete({ where: { id: itemId } });
      case 'utility':
        const utility = await this.prisma.utility.findUnique({ where: { id: itemId } });
        if (!utility) throw new NotFoundException(`Utility with ID ${itemId} not found`);
        return this.prisma.utility.delete({ where: { id: itemId } });
      default:
        throw new NotFoundException('Invalid inventory item type.');
    }
  }
}
