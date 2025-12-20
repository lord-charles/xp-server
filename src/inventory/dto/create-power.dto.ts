import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreatePowerDto {
  @ApiProperty({ required: false, example: 'Solar Panel System' })
  @IsString()
  @IsOptional()
  powerSource?: string;

  @ApiProperty({ required: false, example: '15kW' })
  @IsString()
  @IsOptional()
  powerCapacity?: string;

  @ApiProperty({ required: false, example: 18000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  powerInstallationCost?: number;

  @ApiProperty({ required: false, example: 'Main Barn Roof' })
  @IsString()
  @IsOptional()
  powerLocation?: string;

  @ApiProperty({ required: false, example: 12.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionRate?: number;

  @ApiProperty({ required: false, example: 850.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionCost?: number;

  @ApiProperty({ required: false, example: '2024-09-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  lastMaintenanceDatePower?: Date;

  @ApiProperty({ required: false, example: '2025-03-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDatePower?: Date;
}
