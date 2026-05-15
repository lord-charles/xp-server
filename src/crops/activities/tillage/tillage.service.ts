import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTillageDto } from './dto/create-tillage.dto';
import { UpdateTillageDto } from './dto/update-tillage.dto';

@Injectable()
export class TillageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTillageDto) {
    await this._assertCropExists(dto.cropId);

    // Flatten entries into stored fields for the TillageRecord model
    const primaryTypes = (dto.primaryEntries ?? [])
      .map((e) => e.type)
      .join(',');
    const primaryTools = (dto.primaryEntries ?? [])
      .map((e) => e.tool)
      .join(',');
    const secondaryTypes = (dto.secondaryEntries ?? [])
      .map((e) => e.type)
      .join(',');
    const secondaryTools = (dto.secondaryEntries ?? [])
      .map((e) => e.tool)
      .join(',');

    const record = await this.prisma.tillageRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        system: dto.system,
        // Store phase details as combined type/equipment strings
        type:
          [primaryTypes, secondaryTypes].filter(Boolean).join(' | ') ||
          dto.system,
        equipment:
          [primaryTools, secondaryTools].filter(Boolean).join(', ') || null,
        area: dto.area,
        areaUnit: dto.areaUnit ?? 'acres',
        cost: dto.cost,
        notes: dto.notes,
      },
    });

    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: { currentActivity: 'Tillage Operations' },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.tillageRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalArea = records.reduce((s, r) => s + r.area, 0);
    const totalCost = records.reduce((s, r) => s + (r.cost ?? 0), 0);
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalArea: +totalArea.toFixed(2),
        totalCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateTillageDto) {
    await this._findOrFail(id);
    const { primaryEntries, secondaryEntries, date, ...rest } = dto;

    const primaryTypes = (primaryEntries ?? []).map((e) => e.type).join(',');
    const primaryTools = (primaryEntries ?? []).map((e) => e.tool).join(',');
    const secondaryTypes = (secondaryEntries ?? [])
      .map((e) => e.type)
      .join(',');
    const secondaryTools = (secondaryEntries ?? [])
      .map((e) => e.tool)
      .join(',');

    return this.prisma.tillageRecord.update({
      where: { id },
      data: {
        ...rest,
        date: date ? new Date(date) : undefined,
        type:
          [primaryTypes, secondaryTypes].filter(Boolean).join(' | ') ||
          undefined,
        equipment:
          [primaryTools, secondaryTools].filter(Boolean).join(', ') ||
          undefined,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.tillageRecord.delete({ where: { id } });
    return { message: 'Tillage record deleted successfully' };
  }

  private async _findOrFail(id: string) {
    const record = await this.prisma.tillageRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Tillage record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
