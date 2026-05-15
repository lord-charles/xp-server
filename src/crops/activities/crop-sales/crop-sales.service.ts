import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCropSaleDto } from './dto/create-crop-sale.dto';
import { UpdateCropSaleDto } from './dto/update-crop-sale.dto';

@Injectable()
export class CropSalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCropSaleDto) {
    await this._assertCropExists(dto.cropId);

    // Compute totalAmount
    const totalAmount = dto.quantity * dto.pricePerUnit;

    const record = await this.prisma.cropSaleRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit || 'kg',
        pricePerUnit: dto.pricePerUnit,
        totalAmount,
        buyerName: dto.buyerName,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Sales',
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.cropSaleRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalQuantity = records.reduce((s, r) => s + r.quantity, 0);
    const totalRevenue = records.reduce((s, r) => s + r.totalAmount, 0);
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalQuantityKg: +totalQuantity.toFixed(2),
        totalRevenue: +totalRevenue.toFixed(2),
        averagePricePerUnit:
          records.length > 0 ? +(totalRevenue / totalQuantity).toFixed(2) : 0,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateCropSaleDto) {
    await this._findOrFail(id);

    // Recompute totalAmount if quantity or pricePerUnit changed
    let totalAmount: number | undefined;
    if (dto.quantity !== undefined && dto.pricePerUnit !== undefined) {
      totalAmount = dto.quantity * dto.pricePerUnit;
    } else if (dto.quantity !== undefined) {
      const existing = await this.prisma.cropSaleRecord.findUnique({
        where: { id },
      });
      totalAmount = dto.quantity * existing!.pricePerUnit;
    } else if (dto.pricePerUnit !== undefined) {
      const existing = await this.prisma.cropSaleRecord.findUnique({
        where: { id },
      });
      totalAmount = existing!.quantity * dto.pricePerUnit;
    }

    return this.prisma.cropSaleRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit,
        pricePerUnit: dto.pricePerUnit,
        totalAmount,
        buyerName: dto.buyerName,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.cropSaleRecord.delete({ where: { id } });
    return { message: 'Crop sale record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.cropSaleRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Crop sale record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
