import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateWaterDto {
  @ApiProperty({
    required: false,
    description: 'Source of water supply',
    example: 'Borehole with Submersible Pump + Backup Tank',
  })
  @IsString()
  @IsOptional()
  waterSource?: string;

  @ApiProperty({
    required: false,
    description: 'Total water storage capacity',
    example: '100,000 liters (2 x 50,000L tanks)',
  })
  @IsString()
  @IsOptional()
  waterCapacity?: string;

  @ApiProperty({
    required: false,
    description: 'Current water level in liters',
    example: 85000,
  })
  @IsNumber()
  @IsOptional()
  waterLevel?: number;

  @ApiProperty({
    required: false,
    description: 'Total construction/installation cost in KES',
    example: 850000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  waterConstructionCost?: number;

  @ApiProperty({
    required: false,
    description: 'Location of water system',
    example: 'East Paddock, Water Point 1, Near Cattle Troughs',
  })
  @IsString()
  @IsOptional()
  waterLocation?: string;

  @ApiProperty({
    required: false,
    description: 'Date when water system was installed',
    example: '2024-03-10T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  waterEntryDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Next scheduled inspection date',
    example: '2025-03-10T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextInspectionDateWater?: Date;
}
