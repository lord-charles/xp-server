import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProcessingDto } from './dto/create-processing.dto';
import { UpdateProcessingDto } from './dto/update-processing.dto';

@Injectable()
export class ProcessingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProcessingDto) {
    await this._assertCropExists(dto.cropId);

    const record = await this.prisma.processingRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        processingType: dto.processingType,
        processingMethod: dto.processingMethod,
        equipment: dto.equipment,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        outputQuantity: dto.outputQuantity,
        outputQuality: dto.outputQuality,
        // Pest Control Fields
        dateOfPestControl: dto.dateOfPestControl
          ? new Date(dto.dateOfPestControl)
          : undefined,
        pestIdentified: dto.pestIdentified,
        methodOfControl: dto.methodOfControl,
        pesticideSource: dto.pesticideSource,
        brandName: dto.brandName,
        methodOfApplication: dto.methodOfApplication,
        amountAppliedPest: dto.amountAppliedPest,
        serialNumber: dto.serialNumber,
        dateOfPurchase: dto.dateOfPurchase
          ? new Date(dto.dateOfPurchase)
          : undefined,
        seller: dto.seller,
        quantityPurchased: dto.quantityPurchased,
        purchasePrice: dto.purchasePrice,
        transportCost: dto.transportCost,
        // Storage Fields
        dateOfStorage: dto.dateOfStorage
          ? new Date(dto.dateOfStorage)
          : undefined,
        finalQuantity: dto.finalQuantity,
        finalQuality: dto.finalQuality,
        typeOfStorage: dto.typeOfStorage,
        miscellaneousCostsIncurred: dto.miscellaneousCostsIncurred,
        notes: dto.notes,
      },
    });

    // Set crop currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: {
        currentActivity: 'Processing',
      },
    });

    return record;
  }

  async findAll(cropId: string) {
    await this._assertCropExists(cropId);

    const records = await this.prisma.processingRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    const totalOutputQuantity = records.reduce(
      (s, r) => s + (r.outputQuantity ?? 0),
      0,
    );
    const totalLabourCost = records.reduce(
      (s, r) => s + (r.labourCost ?? 0),
      0,
    );
    const lastRecord = records[0];

    return {
      records,
      stats: {
        count: records.length,
        totalOutputQuantityKg: +totalOutputQuantity.toFixed(2),
        totalLabourCost,
        lastDate: lastRecord ? lastRecord.date : null,
      },
    };
  }

  async findOne(id: string) {
    return this._findOrFail(id);
  }

  async update(id: string, dto: UpdateProcessingDto) {
    await this._findOrFail(id);
    return this.prisma.processingRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        processingType: dto.processingType,
        processingMethod: dto.processingMethod,
        equipment: dto.equipment,
        labourType: dto.labourType,
        numberOfWorkers: dto.numberOfWorkers,
        labourCost: dto.labourCost,
        outputQuantity: dto.outputQuantity,
        outputQuality: dto.outputQuality,
        // Pest Control Fields
        dateOfPestControl: dto.dateOfPestControl
          ? new Date(dto.dateOfPestControl)
          : undefined,
        pestIdentified: dto.pestIdentified,
        methodOfControl: dto.methodOfControl,
        pesticideSource: dto.pesticideSource,
        brandName: dto.brandName,
        methodOfApplication: dto.methodOfApplication,
        amountAppliedPest: dto.amountAppliedPest,
        serialNumber: dto.serialNumber,
        dateOfPurchase: dto.dateOfPurchase
          ? new Date(dto.dateOfPurchase)
          : undefined,
        seller: dto.seller,
        quantityPurchased: dto.quantityPurchased,
        purchasePrice: dto.purchasePrice,
        transportCost: dto.transportCost,
        // Storage Fields
        dateOfStorage: dto.dateOfStorage
          ? new Date(dto.dateOfStorage)
          : undefined,
        finalQuantity: dto.finalQuantity,
        finalQuality: dto.finalQuality,
        typeOfStorage: dto.typeOfStorage,
        miscellaneousCostsIncurred: dto.miscellaneousCostsIncurred,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string) {
    await this._findOrFail(id);
    await this.prisma.processingRecord.delete({ where: { id } });
    return { message: 'Processing record deleted successfully' };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private async _findOrFail(id: string) {
    const record = await this.prisma.processingRecord.findUnique({
      where: { id },
    });
    if (!record)
      throw new NotFoundException(`Processing record ${id} not found`);
    return record;
  }

  private async _assertCropExists(cropId: string) {
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop) throw new NotFoundException(`Crop ${cropId} not found`);
  }
}
