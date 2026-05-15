import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateHarvestingDto } from './dto/create-harvesting.dto';
import { UpdateHarvestingDto } from './dto/update-harvesting.dto';

@Injectable()
export class HarvestingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHarvestingDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.harvestingRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        methodOfHarvesting: dto.methodOfHarvesting,
        typeOfMachine: dto.typeOfMachine,
        fuelCost: dto.fuelCost,
        sourceMachine: dto.sourceMachine,
        operatorType: dto.operatorType,
        sourceLabor: dto.sourceLabor,
        workerName: dto.workerName,
        timeWorked: dto.timeWorked,
        harvestedQuantity: dto.harvestedQuantity,
        harvestedQuality: dto.harvestedQuality,
        meansOfTransport: dto.meansOfTransport,
        numberOfTrips: dto.numberOfTrips,
        costOfTransport: dto.costOfTransport,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity to "Harvesting" and progress to 100
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Harvesting',
        progress: 100,
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.harvestingRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalQuantity = records.reduce(
      (s, r) => s + (r.harvestedQuantity ?? 0),
      0,
    );
    const totalCost = records.reduce(
      (s, r) => s + (r.fuelCost ?? 0) + (r.costOfTransport ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalQuantityKg: +totalQuantity.toFixed(2),
        totalCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateHarvestingDto) {
    await this._findOrFail(id);
    return this.prisma.harvestingRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        methodOfHarvesting: dto.methodOfHarvesting,
        typeOfMachine: dto.typeOfMachine,
        fuelCost: dto.fuelCost,
        sourceMachine: dto.sourceMachine,
        operatorType: dto.operatorType,
        sourceLabor: dto.sourceLabor,
        workerName: dto.workerName,
        timeWorked: dto.timeWorked,
        harvestedQuantity: dto.harvestedQuantity,
        harvestedQuality: dto.harvestedQuality,
        meansOfTransport: dto.meansOfTransport,
        numberOfTrips: dto.numberOfTrips,
        costOfTransport: dto.costOfTransport,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.harvestingRecord.delete({ where: { id } });
    return { message: 'Harvesting record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.harvestingRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Harvesting record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
