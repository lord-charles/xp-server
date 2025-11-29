import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class CreateGrazingDto {
  @ApiProperty({ description: 'ID of the farm' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ description: 'ID of the user creating this record' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Grazing date (YYYY-MM-DD or ISO format)' })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    enum: [
      'Whole Day',
      'Morning',
      'Afternoon',
      'Evening',
      'Night-time',
      'Other',
    ],
    description: 'Duration of grazing',
  })
  @IsEnum([
    'Whole Day',
    'Morning',
    'Afternoon',
    'Evening',
    'Night-time',
    'Other',
  ])
  @IsNotEmpty()
  grazingDuration: string;

  @ApiPropertyOptional({
    description: 'Custom hours when grazingDuration is "Other"',
  })
  @IsNumber()
  @IsOptional()
  customHours?: number;

  @ApiPropertyOptional({ description: 'Cost of grazing in Ksh' })
  @IsNumber()
  @IsOptional()
  grazingCost?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of animal IDs for group grazing',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  animalIds?: string[];

  @ApiPropertyOptional({
    description: 'Single animal ID for individual grazing',
  })
  @IsString()
  @IsOptional()
  animalId?: string;

  @ApiPropertyOptional({
    description: 'Group name when creating a grazing group',
  })
  @IsString()
  @IsOptional()
  groupName?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the grazing session',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
