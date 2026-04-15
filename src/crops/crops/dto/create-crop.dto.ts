import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateCropDto {
  @ApiProperty({
    example: 'clx1abc',
    description: 'Cycle ID this crop belongs to',
  })
  @IsString()
  @IsNotEmpty()
  cycleId: string;

  @ApiProperty({
    example: 'clh2x0f3',
    description: 'Farm ID (denormalised for fast queries)',
  })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ example: 'Maize' })
  @IsString()
  @IsNotEmpty()
  cropName: string;

  @ApiPropertyOptional({
    example: 'cereal',
    description: 'Crop category from CropSelectionScreen',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Hybrid 614' })
  @IsString()
  @IsOptional()
  variety?: string;

  @ApiProperty({ example: 2.5, description: 'Area planted' })
  @IsNumber()
  areaSize: number;

  @ApiPropertyOptional({ example: 'acres', default: 'acres' })
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiProperty({ example: '15/02/2026', description: 'DD/MM/YYYY' })
  @IsString()
  @IsNotEmpty()
  plantingDate: string;

  @ApiProperty({ example: '15/06/2026', description: 'DD/MM/YYYY' })
  @IsString()
  @IsNotEmpty()
  expectedHarvestDate: string;

  @ApiPropertyOptional({ example: '🌽' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: '#FFA726' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'Land Preparation' })
  @IsString()
  @IsOptional()
  currentActivity?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
