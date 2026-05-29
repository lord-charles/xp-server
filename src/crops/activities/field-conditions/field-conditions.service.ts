import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFieldConditionDto } from './dto/create-field-condition.dto';
import { UpdateFieldConditionDto } from './dto/update-field-condition.dto';

@Injectable()
export class FieldConditionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFieldConditionDto) {
    // Verify crop exists
    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${dto.cropId} not found`);
    }

    // Create field condition record
    const fieldCondition = await this.prisma.fieldConditionRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        topography: dto.topography,
        topographyNote: dto.topographyNote,
        drainage: dto.drainage,
        drainageNote: dto.drainageNote,
        previousCropResidue: dto.previousCropResidue,
        residueNote: dto.residueNote,
      },
    });

    // Update crop's currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: { currentActivity: 'Field Conditions Assessment' },
    });

    return fieldCondition;
  }

  async findAll(cropId: string) {
    const records = await this.prisma.fieldConditionRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const stats = {
      count: records.length,
      lastDate: records.length > 0 ? records[0].date : null,
      topographies: [...new Set(records.map((r) => r.topography))],
      drainageTypes: [...new Set(records.map((r) => r.drainage))],
    };

    return { records, stats };
  }

  async findOne(id: string) {
    const record = await this.prisma.fieldConditionRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Field condition record with ID ${id} not found`,
      );
    }

    return record;
  }

  async update(id: string, dto: UpdateFieldConditionDto) {
    const record = await this.prisma.fieldConditionRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Field condition record with ID ${id} not found`,
      );
    }

    return this.prisma.fieldConditionRecord.update({
      where: { id },
      data: {
        topography: dto.topography || record.topography,
        topographyNote: dto.topographyNote || record.topographyNote,
        drainage: dto.drainage || record.drainage,
        drainageNote: dto.drainageNote || record.drainageNote,
        previousCropResidue:
          dto.previousCropResidue || record.previousCropResidue,
        residueNote: dto.residueNote || record.residueNote,
      },
    });
  }

  async remove(id: string) {
    const record = await this.prisma.fieldConditionRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Field condition record with ID ${id} not found`,
      );
    }

    await this.prisma.fieldConditionRecord.delete({
      where: { id },
    });

    return { message: 'Field condition record deleted successfully' };
  }
}
