import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

export class CreateUtilityDto {
  // Facility/Structure fields
  @ApiProperty({ required: false, example: 'Dairy Barn' })
  @IsString()
  @IsOptional()
  structureType?: string;

  @ApiProperty({ required: false, example: '100 head capacity' })
  @IsString()
  @IsOptional()
  structureCapacity?: string;

  @ApiProperty({ required: false, example: 75000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  constructionCost?: number;

  @ApiProperty({ required: false, example: 'Good' })
  @IsString()
  @IsOptional()
  facilityCondition?: string;

  @ApiProperty({ required: false, example: 'North Field, Plot A' })
  @IsString()
  @IsOptional()
  utilityLocation?: string;

  @ApiProperty({ required: false, example: '2024-10-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false, example: '2025-04-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: Date;

  @ApiProperty({ required: false, example: 2500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  maintenanceCost?: number;
}
