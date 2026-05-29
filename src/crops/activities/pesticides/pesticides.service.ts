import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePesticideDto } from './dto/create-pesticide.dto';
import { UpdatePesticideDto } from './dto/update-pesticide.dto';

@Injectable()
export class PesticidesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePesticideDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.pesticideRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        selectedPests: dto.selectedPests,
        pesticideType: dto.pesticideType,
        source: dto.source,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        seller: dto.seller,
        quantityPurchased: dto.quantityPurchased,
        purchasePrice: dto.purchasePrice,
        transportCost: dto.transportCost,
        pesticideName: dto.pesticideName,
        date: new Date(dto.date),
        applicationMethod: dto.applicationMethod,
        equipment: dto.equipment,
        dilutionRatio: dto.dilutionRatio,
        amountApplied: dto.amountApplied,
        amountUnit: dto.amountUnit,
        labour: dto.labour,
        workerName: dto.workerName,
        timeWorked: dto.timeWorked,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Pesticide Application',
        progress: Math.min(
          100,
          (await this._calculateProgress(dto.cropId)) + 5,
        ),
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.pesticideRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const totalCost = records.reduce(
      (s, r) => s + (r.purchasePrice ?? 0) + (r.transportCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalLabourCost,
        totalCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdatePesticideDto) {
    await this._findOrFail(id);
    return this.prisma.pesticideRecord.update({
      where: { id },
      data: {
        selectedPests: dto.selectedPests,
        pesticideType: dto.pesticideType,
        source: dto.source,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        seller: dto.seller,
        quantityPurchased: dto.quantityPurchased,
        purchasePrice: dto.purchasePrice,
        transportCost: dto.transportCost,
        pesticideName: dto.pesticideName,
        date: dto.date ? new Date(dto.date) : undefined,
        applicationMethod: dto.applicationMethod,
        equipment: dto.equipment,
        dilutionRatio: dto.dilutionRatio,
        amountApplied: dto.amountApplied,
        amountUnit: dto.amountUnit,
        labour: dto.labour,
        workerName: dto.workerName,
        timeWorked: dto.timeWorked,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.pesticideRecord.delete({ where: { id } });
    return { message: 'Pesticide record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.pesticideRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Pesticide record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }

  private async _calculateProgress(cropId: string): Promise<number> {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    return crop?.progress ?? 0;
  }
}
