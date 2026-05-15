import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiseaseDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.diseaseRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        diseaseName: dto.diseaseName,
        methodOfControl: dto.methodOfControl,
        dateOfControl: dto.dateOfControl ? new Date(dto.dateOfControl) : null,
        methodDetail: dto.methodDetail,
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
        currentActivity: 'Disease Control',
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

    const records = await this.prisma.diseaseRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateDiseaseDto) {
    await this._findOrFail(id);
    return this.prisma.diseaseRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        diseaseName: dto.diseaseName,
        methodOfControl: dto.methodOfControl,
        dateOfControl: dto.dateOfControl
          ? new Date(dto.dateOfControl)
          : undefined,
        methodDetail: dto.methodDetail,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.diseaseRecord.delete({ where: { id } });
    return { message: 'Disease record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.diseaseRecord.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException(`Disease record ${id} not found`);
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
