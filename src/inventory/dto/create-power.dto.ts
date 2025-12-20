import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreatePowerDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  powerSource?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  powerCapacity?: string;

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  powerInstallationCost?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  powerLocation?: string;

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionRate?: number;

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  consumptionCost?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  lastMaintenanceDatePower?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDatePower?: Date;
}
