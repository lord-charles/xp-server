import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSoilDataDto } from './dto/create-soil-data.dto';
import { UpdateSoilDataDto } from './dto/update-soil-data.dto';

@Injectable()
export class SoilDataService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSoilDataDto) {
    // Verify crop exists
    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${dto.cropId} not found`);
    }

    // Create soil data record
    const soilData = await this.prisma.soilDataRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        soilType: dto.soilType,
        soilTypeNote: dto.soilTypeNote,
        soilPH: dto.soilPH,
        soilPHNote: dto.soilPHNote,
        moistureContent: dto.moistureContent,
        moistureNote: dto.moistureNote,
        organicMatter: dto.organicMatter,
        organicNote: dto.organicNote,
        nitrogen: dto.nitrogen || false,
        phosphorus: dto.phosphorus || false,
        potassium: dto.potassium || false,
        nutrientsNote: dto.nutrientsNote,
      },
    });

    // Update crop's currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: { currentActivity: 'Soil Data Collection' },
    });

    return soilData;
  }

  async findAll(cropId: string) {
    const records = await this.prisma.soilDataRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const stats = {
      count: records.length,
      lastDate: records.length > 0 ? records[0].date : null,
      soilTypes: [...new Set(records.map((r) => r.soilType))],
      phLevels: [...new Set(records.map((r) => r.soilPH))],
    };

    return { records, stats };
  }

  async findOne(id: string) {
    const record = await this.prisma.soilDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Soil data record with ID ${id} not found`);
    }

    return record;
  }

  async update(id: string, dto: UpdateSoilDataDto) {
    const record = await this.prisma.soilDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Soil data record with ID ${id} not found`);
    }

    return this.prisma.soilDataRecord.update({
      where: { id },
      data: {
        soilType: dto.soilType || record.soilType,
        soilTypeNote: dto.soilTypeNote || record.soilTypeNote,
        soilPH: dto.soilPH || record.soilPH,
        soilPHNote: dto.soilPHNote || record.soilPHNote,
        moistureContent: dto.moistureContent || record.moistureContent,
        moistureNote: dto.moistureNote || record.moistureNote,
        organicMatter: dto.organicMatter || record.organicMatter,
        organicNote: dto.organicNote || record.organicNote,
        nitrogen: dto.nitrogen !== undefined ? dto.nitrogen : record.nitrogen,
        phosphorus:
          dto.phosphorus !== undefined ? dto.phosphorus : record.phosphorus,
        potassium:
          dto.potassium !== undefined ? dto.potassium : record.potassium,
        nutrientsNote: dto.nutrientsNote || record.nutrientsNote,
      },
    });
  }

  async remove(id: string) {
    const record = await this.prisma.soilDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Soil data record with ID ${id} not found`);
    }

    await this.prisma.soilDataRecord.delete({
      where: { id },
    });

    return { message: 'Soil data record deleted successfully' };
  }
}
