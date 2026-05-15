import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLossDto } from './dto/create-loss.dto';
import { UpdateLossDto } from './dto/update-loss.dto';

@Injectable()
export class LossesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLossDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.lossRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        lossType: dto.lossType,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit || 'kg',
        cause: dto.cause,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Losses',
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.lossRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalQuantity = records.reduce((s, r) => s + (r.quantity ?? 0), 0);
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalQuantityKg: +totalQuantity.toFixed(2),
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateLossDto) {
    await this._findOrFail(id);
    return this.prisma.lossRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        lossType: dto.lossType,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit,
        cause: dto.cause,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.lossRecord.delete({ where: { id } });
    return { message: 'Loss record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.lossRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Loss record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
