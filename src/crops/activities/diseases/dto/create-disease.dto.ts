import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateDiseaseDto {
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
    description: 'Date disease was identified',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Leaf Blight' })
  @IsString()
  @IsNotEmpty()
  diseaseName: string;

  @ApiProperty({
    example: 'chemical',
    enum: ['physical', 'mechanical', 'chemical'],
  })
  @IsIn(['physical', 'mechanical', 'chemical'])
  methodOfControl: string;

  @ApiPropertyOptional({ example: '2026-02-16T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dateOfControl?: string;

  @ApiPropertyOptional({ example: 'Spray fungicide' })
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

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
