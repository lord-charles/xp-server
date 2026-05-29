import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  IsArray,
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
    description: 'Type of fertilizer',
  })
  @IsIn(['organic', 'inorganic'])
  fertilizerType: string;

  @ApiPropertyOptional({
    example: 'Compost',
    description: 'Source of fertilizer',
  })
  @IsString()
  @IsOptional()
  fertilizerSource?: string;

  @ApiProperty({
    example: 'basal',
    enum: ['basal', 'top-dressing', 'foliar', 'fertigation'],
    description: 'Mode of application',
  })
  @IsIn(['basal', 'top-dressing', 'foliar', 'fertigation'])
  mode: string;

  @ApiPropertyOptional({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Date of application',
  })
  @IsDateString()
  @IsOptional()
  applicationDate?: string;

  @ApiPropertyOptional({
    example: 'broadcast',
    enum: ['broadcast', 'placement', 'spray', 'injection', 'drip'],
    description: 'Method of application',
  })
  @IsIn(['broadcast', 'placement', 'spray', 'injection', 'drip'])
  @IsOptional()
  applicationMethod?: string;

  @ApiPropertyOptional({
    example: 'pre-sowing',
    enum: [
      'pre-sowing',
      'at-sowing',
      'post-sowing',
      'vegetative',
      'flowering',
      'fruiting',
    ],
    description: 'Timing of application',
  })
  @IsIn([
    'pre-sowing',
    'at-sowing',
    'post-sowing',
    'vegetative',
    'flowering',
    'fruiting',
  ])
  @IsOptional()
  applicationTiming?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Quantity of fertilizer applied',
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    example: 'kg',
    enum: ['kg', 'bags', 'liters', 'tons'],
    description: 'Unit of quantity',
  })
  @IsIn(['kg', 'bags', 'liters', 'tons'])
  @IsOptional()
  quantityUnit?: string;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Area covered by fertilizer application',
  })
  @IsNumber()
  @IsOptional()
  areaApplied?: number;

  @ApiPropertyOptional({
    example: 'acres',
    enum: ['acres', 'hectares'],
    description: 'Unit of area',
  })
  @IsIn(['acres', 'hectares'])
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({
    description: 'Equipment used for application',
    type: [String],
    example: ['spreader', 'sprayer', 'tractor'],
  })
  @IsArray()
  @IsOptional()
  equipment?: string[];

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'human', 'animal'],
    description: 'Type of labour used',
  })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Number of workers',
  })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Labour cost',
  })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
