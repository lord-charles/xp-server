import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFertilizerDto } from './dto/create-fertilizer.dto';
import { UpdateFertilizerDto } from './dto/update-fertilizer.dto';

@Injectable()
export class FertilizersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFertilizerDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.fertilizerRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        fertilizerType: dto.fertilizerType,
        fertilizerSource: dto.fertilizerSource,
        mode: dto.mode,
        applicationDate: dto.applicationDate
          ? new Date(dto.applicationDate)
          : undefined,
        applicationMethod: dto.applicationMethod,
        applicationTiming: dto.applicationTiming,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit,
        areaApplied: dto.areaApplied,
        areaUnit: dto.areaUnit,
        equipment: dto.equipment || [],
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity and advance progress
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Fertilizer Application',
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

    const records = await this.prisma.fertilizerRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalQuantity = records.reduce((s, r) => s + (r.quantity ?? 0), 0);
    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalQuantity: +totalQuantity.toFixed(2),
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateFertilizerDto) {
    await this._findOrFail(id);
    return this.prisma.fertilizerRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        fertilizerType: dto.fertilizerType,
        fertilizerSource: dto.fertilizerSource,
        mode: dto.mode,
        applicationDate: dto.applicationDate
          ? new Date(dto.applicationDate)
          : undefined,
        applicationMethod: dto.applicationMethod,
        applicationTiming: dto.applicationTiming,
        quantity: dto.quantity,
        quantityUnit: dto.quantityUnit,
        areaApplied: dto.areaApplied,
        areaUnit: dto.areaUnit,
        equipment: dto.equipment,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.fertilizerRecord.delete({ where: { id } });
    return { message: 'Fertilizer record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.fertilizerRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Fertilizer record ${id} not found`);
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
