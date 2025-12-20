import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const { farmId, goodsInStock, machinery, utility, water, power } =
      createInventoryDto;

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
      const { purchaseDate, expirationDate, nextInspectionDate, ...rest } =
        goodsInStock as any;

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

    if (water) {
      return this.prisma.water.create({
        data: {
          ...water,
          inventoryId: inventory.id,
        },
      });
    }

    if (power) {
      return this.prisma.power.create({
        data: {
          ...power,
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
        water: true,
        power: true,
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
        water: true,
        power: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async update(
    itemId: string,
    itemType: 'goods' | 'machinery' | 'utility' | 'water' | 'power',
    updateDto: any,
  ) {
    switch (itemType) {
      case 'goods':
        return this.updateGoodsInStock(itemId, updateDto);
      case 'machinery':
        return this.updateMachinery(itemId, updateDto);
      case 'utility':
        return this.updateUtility(itemId, updateDto);
      case 'water':
        return this.updateWater(itemId, updateDto);
      case 'power':
        return this.updatePower(itemId, updateDto);
      default:
        throw new NotFoundException('Invalid inventory item type.');
    }
  }

  private async updateGoodsInStock(
    id: string,
    data: Partial<UpdateInventoryDto['goodsInStock']>,
  ) {
    const item = await this.prisma.goodsInStock.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`GoodsInStock with ID ${id} not found`);
    }
    return this.prisma.goodsInStock.update({
      where: { id },
      data,
    });
  }

  private async updateMachinery(
    id: string,
    data: Partial<UpdateInventoryDto['machinery']>,
  ) {
    const item = await this.prisma.machinery.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Machinery with ID ${id} not found`);
    }
    return this.prisma.machinery.update({
      where: { id },
      data,
    });
  }

  private async updateUtility(
    id: string,
    data: Partial<UpdateInventoryDto['utility']>,
  ) {
    const item = await this.prisma.utility.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Utility with ID ${id} not found`);
    }
    return this.prisma.utility.update({
      where: { id },
      data,
    });
  }

  private async updateWater(id: string, data: any) {
    const item = await this.prisma.water.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Water with ID ${id} not found`);
    }
    return this.prisma.water.update({
      where: { id },
      data,
    });
  }

  private async updatePower(id: string, data: any) {
    const item = await this.prisma.power.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Power with ID ${id} not found`);
    }
    return this.prisma.power.update({
      where: { id },
      data,
    });
  }

  async remove(
    itemId: string,
    itemType: 'goods' | 'machinery' | 'utility' | 'water' | 'power',
  ) {
    switch (itemType) {
      case 'goods':
        const goods = await this.prisma.goodsInStock.findUnique({
          where: { id: itemId },
        });
        if (!goods)
          throw new NotFoundException(
            `GoodsInStock with ID ${itemId} not found`,
          );
        return this.prisma.goodsInStock.delete({ where: { id: itemId } });
      case 'machinery':
        const machinery = await this.prisma.machinery.findUnique({
          where: { id: itemId },
        });
        if (!machinery)
          throw new NotFoundException(`Machinery with ID ${itemId} not found`);
        return this.prisma.machinery.delete({ where: { id: itemId } });
      case 'utility':
        const utility = await this.prisma.utility.findUnique({
          where: { id: itemId },
        });
        if (!utility)
          throw new NotFoundException(`Utility with ID ${itemId} not found`);
        return this.prisma.utility.delete({ where: { id: itemId } });
      case 'water':
        const water = await this.prisma.water.findUnique({
          where: { id: itemId },
        });
        if (!water)
          throw new NotFoundException(`Water with ID ${itemId} not found`);
        return this.prisma.water.delete({ where: { id: itemId } });
      case 'power':
        const power = await this.prisma.power.findUnique({
          where: { id: itemId },
        });
        if (!power)
          throw new NotFoundException(`Power with ID ${itemId} not found`);
        return this.prisma.power.delete({ where: { id: itemId } });
      default:
        throw new NotFoundException('Invalid inventory item type.');
    }
  }
}
