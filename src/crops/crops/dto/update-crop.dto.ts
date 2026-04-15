import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class UpdateCropDto {
  @ApiPropertyOptional({ example: 'Maize' })
  @IsString()
  @IsOptional()
  cropName?: string;

  @ApiPropertyOptional({ example: 'Hybrid 614' })
  @IsString()
  @IsOptional()
  variety?: string;

  @ApiPropertyOptional({ example: 2.5 })
  @IsNumber()
  @IsOptional()
  areaSize?: number;

  @ApiPropertyOptional({ example: 'acres' })
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({ example: '15/02/2026' })
  @IsString()
  @IsOptional()
  plantingDate?: string;

  @ApiPropertyOptional({ example: '15/06/2026' })
  @IsString()
  @IsOptional()
  expectedHarvestDate?: string;

  @ApiPropertyOptional({ enum: ['Active', 'Complete'] })
  @IsIn(['Active', 'Complete'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 75, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ example: 'Fertilizer Application' })
  @IsString()
  @IsOptional()
  currentActivity?: string;

  @ApiPropertyOptional({ example: '🌽' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: '#FFA726' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
