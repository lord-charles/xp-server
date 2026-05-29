import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePestDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Date pest was identified',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: '["1", "2", "3"]',
    description: 'JSON array of selected pest IDs',
  })
  @IsString()
  @IsOptional()
  selectedPests?: string;

  @ApiPropertyOptional({
    example: 'low',
    enum: ['low', 'medium', 'high'],
  })
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  infestationLevel?: string;

  @ApiPropertyOptional({
    example: 'physical',
    enum: ['physical', 'mechanical', 'chemical', 'biological'],
  })
  @IsIn(['physical', 'mechanical', 'chemical', 'biological'])
  @IsOptional()
  controlMethod?: string;

  @ApiPropertyOptional({ example: 'Hand Picking' })
  @IsString()
  @IsOptional()
  specificTechnique?: string;

  @ApiPropertyOptional({
    example: '["Sprayer", "Traps"]',
    description: 'JSON array of tools used',
  })
  @IsString()
  @IsOptional()
  toolsUsed?: string;

  @ApiProperty({ example: 'Armyworm' })
  @IsString()
  @IsNotEmpty()
  pestName: string;

  @ApiProperty({ example: 'Chemical spray' })
  @IsString()
  @IsNotEmpty()
  methodOfControl: string;

  @ApiPropertyOptional({ example: '2026-02-16T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dateOfControl?: string;

  @ApiPropertyOptional({ example: 'Apply insecticide' })
  @IsString()
  @IsOptional()
  methodDetail?: string;

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'human', 'animal'],
  })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
