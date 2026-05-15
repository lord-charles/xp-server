import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSoilPrepDto } from './dto/create-soil-prep.dto';
import { UpdateSoilPrepDto } from './dto/update-soil-prep.dto';

@Injectable()
export class SoilPrepService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSoilPrepDto) {
    await this._assertCropExists(dto.cropId);
    const record = await this.prisma.soilPrepRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        tillageType: dto.tillageType,
        area: dto.area,
        areaUnit: dto.areaUnit ?? 'acres',
        labourType: dto.labourType,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
    // Update crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: { currentActivity: 'Soil Preparation' },
    });
    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.soilPrepRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    // Aggregate stats for the 4-stat cards in activity-dashboard
    const totalArea = records.reduce((s, r) => s + r.area, 0);
    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalArea: +totalArea.toFixed(2),
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateSoilPrepDto) {
    await this._findOrFail(id);
    return this.prisma.soilPrepRecord.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.soilPrepRecord.delete({ where: { id } });
    return { message: 'Soil prep record deleted successfully' };
  }

  private async _findOrFail(id: string) {
    const record = await this.prisma.soilPrepRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Soil prep record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
