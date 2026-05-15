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
