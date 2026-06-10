import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { UpdateLabourDto } from './dto/update-labour.dto';

@Injectable()
export class LabourService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLabourDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.labourRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        activityName: dto.activityName,
        selectedLabourCategories: dto.selectedLabourCategories,
        machineSupplier: dto.machineSupplier,
        machineHours: dto.machineHours,
        machineFee: dto.machineFee,
        animalEquipmentName: dto.animalEquipmentName,
        animalCount: dto.animalCount,
        animalHours: dto.animalHours,
        animalFee: dto.animalFee,
        humanCount: dto.humanCount,
        humanHours: dto.humanHours,
        humanFee: dto.humanFee,
        notes: dto.notes,
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.labourRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalMachineCost = records.reduce(
      (s, r) => s + (r.machineFee ?? 0),
      0,
    );
    const totalAnimalCost = records.reduce((s, r) => s + (r.animalFee ?? 0), 0);
    const totalHumanCost = records.reduce((s, r) => s + (r.humanFee ?? 0), 0);
    const totalCost = totalMachineCost + totalAnimalCost + totalHumanCost;

    const totalMachineHours = records.reduce(
      (s, r) => s + (r.machineHours ?? 0),
      0,
    );
    const totalAnimalHours = records.reduce(
      (s, r) => s + (r.animalHours ?? 0),
      0,
    );
    const totalHumanHours = records.reduce(
      (s, r) => s + (r.humanHours ?? 0),
      0,
    );
    const totalHours = totalMachineHours + totalAnimalHours + totalHumanHours;

    const machineEntries = records.filter((r) => r.machineSupplier).length;
    const animalEntries = records.filter((r) => r.animalCount).length;
    const humanEntries = records.filter((r) => r.humanCount).length;

    return {
      records,
      stats: {
        count: records.length,
        totalCost,
        totalHours,
        machineEntries,
        animalEntries,
        humanEntries,
        costBreakdown: {
          machine: totalMachineCost,
          animal: totalAnimalCost,
          human: totalHumanCost,
        },
        hoursBreakdown: {
          machine: totalMachineHours,
          animal: totalAnimalHours,
          human: totalHumanHours,
        },
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateLabourDto) {
    await this._findOrFail(id);
    return this.prisma.labourRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        activityName: dto.activityName,
        selectedLabourCategories: dto.selectedLabourCategories,
        machineSupplier: dto.machineSupplier,
        machineHours: dto.machineHours,
        machineFee: dto.machineFee,
        animalEquipmentName: dto.animalEquipmentName,
        animalCount: dto.animalCount,
        animalHours: dto.animalHours,
        animalFee: dto.animalFee,
        humanCount: dto.humanCount,
        humanHours: dto.humanHours,
        humanFee: dto.humanFee,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.labourRecord.delete({ where: { id } });
    return { message: 'Labour record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.labourRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Labour record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
