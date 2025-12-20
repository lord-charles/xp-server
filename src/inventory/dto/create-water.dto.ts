import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateWaterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  waterSource?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  waterCapacity?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  waterLevel?: number;

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  waterConstructionCost?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  waterLocation?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  waterEntryDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  nextInspectionDateWater?: Date;
}
