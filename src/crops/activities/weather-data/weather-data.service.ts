import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWeatherDataDto } from './dto/create-weather-data.dto';
import { UpdateWeatherDataDto } from './dto/update-weather-data.dto';

@Injectable()
export class WeatherDataService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWeatherDataDto) {
    // Verify crop exists
    const crop = await this.prisma.crop.findUnique({
      where: { id: dto.cropId },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${dto.cropId} not found`);
    }

    // Create weather data record
    const weatherData = await this.prisma.weatherDataRecord.create({
      data: {
        cropId: dto.cropId,
        farmId: dto.farmId,
        date: new Date(dto.date),
        temperatureType: dto.temperatureType,
        temperatureValue: dto.temperatureValue,
        temperatureNote: dto.temperatureNote,
        precipitationType: dto.precipitationType,
        precipitationValue: dto.precipitationValue,
        precipitationNote: dto.precipitationNote,
        windType: dto.windType,
        windValue: dto.windValue,
        windNote: dto.windNote,
        humidityType: dto.humidityType,
        humidityValue: dto.humidityValue,
        humidityNote: dto.humidityNote,
        locationName: dto.locationName,
      },
    });

    // Update crop's currentActivity
    await this.prisma.crop.update({
      where: { id: dto.cropId },
      data: { currentActivity: 'Weather Data Collection' },
    });

    return weatherData;
  }

  async findAll(cropId: string) {
    const records = await this.prisma.weatherDataRecord.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const stats = {
      count: records.length,
      lastDate: records.length > 0 ? records[0].date : null,
      avgTemperature:
        records.length > 0
          ? (
              records.reduce((sum, r) => sum + r.temperatureValue, 0) /
              records.length
            ).toFixed(2)
          : null,
      totalPrecipitation: records.reduce(
        (sum, r) => sum + r.precipitationValue,
        0,
      ),
      avgHumidity:
        records.length > 0
          ? (
              records.reduce((sum, r) => sum + r.humidityValue, 0) /
              records.length
            ).toFixed(2)
          : null,
    };

    return { records, stats };
  }

  async findOne(id: string) {
    const record = await this.prisma.weatherDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Weather data record with ID ${id} not found`,
      );
    }

    return record;
  }

  async update(id: string, dto: UpdateWeatherDataDto) {
    const record = await this.prisma.weatherDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Weather data record with ID ${id} not found`,
      );
    }

    return this.prisma.weatherDataRecord.update({
      where: { id },
      data: {
        temperatureType: dto.temperatureType || record.temperatureType,
        temperatureValue: dto.temperatureValue || record.temperatureValue,
        temperatureNote: dto.temperatureNote || record.temperatureNote,
        precipitationType: dto.precipitationType || record.precipitationType,
        precipitationValue: dto.precipitationValue || record.precipitationValue,
        precipitationNote: dto.precipitationNote || record.precipitationNote,
        windType: dto.windType || record.windType,
        windValue: dto.windValue || record.windValue,
        windNote: dto.windNote || record.windNote,
        humidityType: dto.humidityType || record.humidityType,
        humidityValue: dto.humidityValue || record.humidityValue,
        humidityNote: dto.humidityNote || record.humidityNote,
        locationName: dto.locationName || record.locationName,
      },
    });
  }

  async remove(id: string) {
    const record = await this.prisma.weatherDataRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Weather data record with ID ${id} not found`,
      );
    }

    await this.prisma.weatherDataRecord.delete({
      where: { id },
    });

    return { message: 'Weather data record deleted successfully' };
  }
}
