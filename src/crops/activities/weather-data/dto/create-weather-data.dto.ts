import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateWeatherDataDto {
  @ApiProperty({ example: 'clx2def', description: 'Crop ID' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3', description: 'Farm ID' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    example: '2026-02-10T00:00:00.000Z',
    description: 'Date of weather data collection',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'current',
    enum: ['current', 'historical', 'forecasted'],
    description: 'Temperature type',
  })
  @IsIn(['current', 'historical', 'forecasted'])
  temperatureType: string;

  @ApiProperty({ example: 25.5, description: 'Temperature value in Celsius' })
  @IsNumber()
  temperatureValue: number;

  @ApiPropertyOptional({ example: 'Warm afternoon' })
  @IsString()
  @IsOptional()
  temperatureNote?: string;

  @ApiProperty({
    example: 'rainfall-amount',
    enum: ['rainfall-amount', 'rainfall-pattern', 'forecasted-precipitation'],
    description: 'Precipitation type',
  })
  @IsIn(['rainfall-amount', 'rainfall-pattern', 'forecasted-precipitation'])
  precipitationType: string;

  @ApiProperty({ example: 15.2, description: 'Precipitation value in mm' })
  @IsNumber()
  precipitationValue: number;

  @ApiPropertyOptional({ example: 'Light rain in the morning' })
  @IsString()
  @IsOptional()
  precipitationNote?: string;

  @ApiProperty({
    example: 'current-wind',
    enum: ['current-wind', 'historical-wind', 'forecasted-wind'],
    description: 'Wind type',
  })
  @IsIn(['current-wind', 'historical-wind', 'forecasted-wind'])
  windType: string;

  @ApiProperty({ example: 12.5, description: 'Wind speed in km/h' })
  @IsNumber()
  windValue: number;

  @ApiPropertyOptional({ example: 'Moderate wind from the east' })
  @IsString()
  @IsOptional()
  windNote?: string;

  @ApiProperty({
    example: 'current-humidity',
    enum: ['current-humidity', 'historical-humidity', 'forecasted-humidity'],
    description: 'Humidity type',
  })
  @IsIn(['current-humidity', 'historical-humidity', 'forecasted-humidity'])
  humidityType: string;

  @ApiProperty({ example: 65, description: 'Humidity percentage' })
  @IsNumber()
  humidityValue: number;

  @ApiPropertyOptional({ example: 'Moderate humidity levels' })
  @IsString()
  @IsOptional()
  humidityNote?: string;

  @ApiPropertyOptional({ example: 'Nairobi, Kenya' })
  @IsString()
  @IsOptional()
  locationName?: string;
}
