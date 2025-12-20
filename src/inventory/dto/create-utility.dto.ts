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
  @ApiProperty({
    required: false,
    description: 'Type of structure or facility',
    example: 'Modern Milking Parlor with Automated System',
  })
  @IsString()
  @IsOptional()
  structureType?: string;

  @ApiProperty({
    required: false,
    description: 'Capacity or specifications of the structure',
    example: '24-point herringbone parlor, 200 cows/hour capacity',
  })
  @IsString()
  @IsOptional()
  structureCapacity?: string;

  @ApiProperty({
    required: false,
    description: 'Total construction cost in KES',
    example: 4500000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  constructionCost?: number;

  @ApiProperty({
    required: false,
    description: 'Current condition of the facility',
    example: 'Excellent',
    enum: [
      'Excellent',
      'Good',
      'Fair',
      'Poor',
      'Under Renovation',
      'Needs Repair',
    ],
  })
  @IsString()
  @IsOptional()
  facilityCondition?: string;

  @ApiProperty({
    required: false,
    description: 'Location of the utility/structure',
    example: 'North Paddock, Plot A1, GPS: -1.2345, 36.7890',
  })
  @IsString()
  @IsOptional()
  utilityLocation?: string;

  @ApiProperty({
    required: false,
    description: 'Date of last maintenance',
    example: '2024-10-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  lastMaintenanceDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Next scheduled maintenance date',
    example: '2025-04-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Cost of last maintenance in KES',
    example: 150000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  maintenanceCost?: number;
}
