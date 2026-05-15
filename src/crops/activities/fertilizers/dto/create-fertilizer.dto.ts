import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateFertilizerDto {
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
    description: 'Date of fertilizer application',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'organic',
    enum: ['organic', 'inorganic'],
  })
  @IsIn(['organic', 'inorganic'])
  fertilizerType: string;

  @ApiPropertyOptional({ example: 'Compost' })
  @IsString()
  @IsOptional()
  fertilizerSource?: string;

  @ApiProperty({
    example: 'basal',
    enum: ['basal', 'top-dressing', 'foliar', 'fertigation'],
  })
  @IsIn(['basal', 'top-dressing', 'foliar', 'fertigation'])
  mode: string;

  @ApiPropertyOptional({ example: '2026-02-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  applicationDate?: string;

  @ApiPropertyOptional({ example: 'Spraying' })
  @IsString()
  @IsOptional()
  applicationMethod?: string;

  @ApiPropertyOptional({ example: 'Early morning' })
  @IsString()
  @IsOptional()
  applicationTiming?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  dosage?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsNumber()
  @IsOptional()
  coverage?: number;

  @ApiPropertyOptional({ example: 'Sprayer' })
  @IsString()
  @IsOptional()
  equipment?: string;

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
