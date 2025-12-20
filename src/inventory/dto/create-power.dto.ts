import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreatePowerDto {
  @ApiProperty({
    required: false,
    description: 'Type and source of power supply',
    example: 'Hybrid: 25kW Solar Panel System + 15kW Grid Connection',
  })
  @IsString()
  @IsOptional()
  powerSource?: string;

  @ApiProperty({
    required: false,
    description: 'Total power capacity and specifications',
    example: '25kW Solar + 15kW Grid + 10kWh Battery Storage',
  })
  @IsString()
  @IsOptional()
  powerCapacity?: string;

  @ApiProperty({
    required: false,
    description: 'Total installation cost in KES',
    example: 1200000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  powerInstallationCost?: number;

  @ApiProperty({
    required: false,
    description: 'Location of power infrastructure',
    example:
      'Main Barn Roof (Solar) + Utility Room (Grid Connection & Inverters)',
  })
  @IsString()
  @IsOptional()
  powerLocation?: string;

  @ApiProperty({
    required: false,
    description: 'Average daily consumption in kWh',
    example: 18.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionRate?: number;

  @ApiProperty({
    required: false,
    description: 'Monthly power cost in KES',
    example: 45000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionCost?: number;

  @ApiProperty({
    required: false,
    description: 'Date of last maintenance/inspection',
    example: '2024-09-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  lastMaintenanceDatePower?: Date;

  @ApiProperty({
    required: false,
    description: 'Next scheduled maintenance date',
    example: '2025-03-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDatePower?: Date;
}
