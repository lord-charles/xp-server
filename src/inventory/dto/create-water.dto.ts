import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateWaterDto {
  @ApiProperty({ required: false, example: 'Borehole' })
  @IsString()
  @IsOptional()
  waterSource?: string;

  @ApiProperty({ required: false, example: '50,000 liters' })
  @IsString()
  @IsOptional()
  waterCapacity?: string;

  @ApiProperty({ required: false, example: 35000 })
  @IsNumber()
  @IsOptional()
  waterLevel?: number;

  @ApiProperty({ required: false, example: 25000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  waterConstructionCost?: number;

  @ApiProperty({ required: false, example: 'East Paddock, Tank Site 1' })
  @IsString()
  @IsOptional()
  waterLocation?: string;

  @ApiProperty({ required: false, example: '2024-01-10T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  waterEntryDate?: Date;

  @ApiProperty({ required: false, example: '2025-01-10T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  nextInspectionDateWater?: Date;
}
