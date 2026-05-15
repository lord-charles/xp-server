import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateChemicalDto } from './dto/create-chemical.dto';
import { UpdateChemicalDto } from './dto/update-chemical.dto';

@Injectable()
export class ChemicalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChemicalDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.chemicalRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        chemicalName: dto.chemicalName,
        chemicalType: dto.chemicalType,
        dosage: dto.dosage,
        dosageUnit: dto.dosageUnit || 'liters',
        applicationMethod: dto.applicationMethod,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Chemical Application',
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

    const records = await this.prisma.chemicalRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalDosage = records.reduce((s, r) => s + (r.dosage ?? 0), 0);
    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalDosageLiters: +totalDosage.toFixed(2),
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateChemicalDto) {
    await this._findOrFail(id);
    return this.prisma.chemicalRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        chemicalName: dto.chemicalName,
        chemicalType: dto.chemicalType,
        dosage: dto.dosage,
        dosageUnit: dto.dosageUnit,
        applicationMethod: dto.applicationMethod,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.chemicalRecord.delete({ where: { id } });
    return { message: 'Chemical record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.chemicalRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Chemical record ${id} not found`);
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
