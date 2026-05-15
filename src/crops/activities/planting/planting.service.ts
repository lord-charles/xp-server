import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePlantingDto } from './dto/create-planting.dto';
import { UpdatePlantingDto } from './dto/update-planting.dto';

@Injectable()
export class PlantingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlantingDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.plantingRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.dateOfPlanting),
        method: dto.methodOfPlanting,
        // Seed info — store as seedName (variety) and seedQuantity
        seedName: dto.seedVarietyName,
        seedQuantity: dto.quantityPlanted
          ? parseFloat(dto.quantityPlanted)
          : null,
        seedUnit: 'kg',
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: this._buildNotes(dto),
      },
    });

    // Advance crop progress to 10% and set currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Planting',
        progress: 10,
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.plantingRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalSeeds = records.reduce((s, r) => s + (r.seedQuantity ?? 0), 0);
    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalSeedsKg: +totalSeeds.toFixed(2),
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdatePlantingDto) {
    await this._findOrFail(id);
    return this.prisma.plantingRecord.update({
      where: { id },
      data: {
        date: dto.dateOfPlanting ? new Date(dto.dateOfPlanting) : undefined,
        method: dto.methodOfPlanting,
        seedName: dto.seedVarietyName,
        seedQuantity: dto.quantityPlanted
          ? parseFloat(dto.quantityPlanted)
          : undefined,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.plantingRecord.delete({ where: { id } });
    return { message: 'Planting record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private _buildNotes(dto: CreatePlantingDto): string {
    const parts: string[] = [];
    if (dto.seedSource) parts.push(`Seed source: ${dto.seedSource}`);
    if (dto.sourceOfSeeds) parts.push(`Procured from: ${dto.sourceOfSeeds}`);
    if (dto.seedRatePerHole) parts.push(`Rate/hole: ${dto.seedRatePerHole}`);
    if (dto.spacing) parts.push(`Spacing: ${dto.spacing} cm`);
    if (dto.plantingDepth) parts.push(`Depth: ${dto.plantingDepth} cm`);
    if (dto.methodOfTransplanting)
      parts.push(`Transplant method: ${dto.methodOfTransplanting}`);
    if (dto.seedlingRate) parts.push(`Seedling rate: ${dto.seedlingRate}`);
    if (dto.percentageEstablished)
      parts.push(`Established: ${dto.percentageEstablished}%`);
    if (dto.harvestDelivered)
      parts.push(`Harvest delivered: ${dto.harvestDelivered}`);
    if (dto.remedy) parts.push(`Remedy: ${dto.remedy}`);
    if (dto.notes) parts.push(dto.notes);
    return parts.join(' | ');
  }

  private async _findOrFail(id: string) {
    const record = await this.prisma.plantingRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Planting record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
