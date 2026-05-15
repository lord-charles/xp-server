import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateIrrigationDto } from './dto/create-irrigation.dto';
import { UpdateIrrigationDto } from './dto/update-irrigation.dto';

@Injectable()
export class IrrigationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIrrigationDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.irrigationRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        method: dto.method,
        soilMoisture: dto.soilMoisture,
        waterSource: dto.waterSource,
        volume: dto.volume,
        volumeUnit: dto.volumeUnit || 'liters',
        applicationMethod: dto.applicationMethod,
        systemCost: dto.systemCost,
        fuelCost: dto.fuelCost,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        hoursWorked: dto.hoursWorked,
        additionalCharges: dto.additionalCharges,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Irrigation',
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

    const records = await this.prisma.irrigationRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalVolume = records.reduce((s, r) => s + (r.volume ?? 0), 0);
    const totalCost = records.reduce(
      (s, r) =>
        s +
        (r.systemCost ?? 0) +
        (r.fuelCost ?? 0) +
        (r.labourCost ?? 0) +
        (r.additionalCharges ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalVolumeLiters: +totalVolume.toFixed(2),
        totalCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateIrrigationDto) {
    await this._findOrFail(id);
    return this.prisma.irrigationRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        method: dto.method,
        soilMoisture: dto.soilMoisture,
        waterSource: dto.waterSource,
        volume: dto.volume,
        volumeUnit: dto.volumeUnit,
        applicationMethod: dto.applicationMethod,
        systemCost: dto.systemCost,
        fuelCost: dto.fuelCost,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        hoursWorked: dto.hoursWorked,
        additionalCharges: dto.additionalCharges,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.irrigationRecord.delete({ where: { id } });
    return { message: 'Irrigation record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.irrigationRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Irrigation record ${id} not found`);
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
