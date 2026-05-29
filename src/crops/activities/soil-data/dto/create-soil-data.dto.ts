import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateSoilDataDto {
  @ApiProperty({ example: 'clx2def', description: 'Crop ID' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3', description: 'Farm ID' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    example: '2026-02-10T00:00:00.000Z',
    description: 'Date of soil data collection',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'loamy',
    enum: ['sandy', 'loamy', 'clay'],
    description: 'Type of soil',
  })
  @IsIn(['sandy', 'loamy', 'clay'])
  soilType: string;

  @ApiPropertyOptional({ example: 'Well-draining loamy soil' })
  @IsString()
  @IsOptional()
  soilTypeNote?: string;

  @ApiProperty({
    example: 'neutral',
    enum: ['acid', 'neutral', 'alkaline'],
    description: 'Soil pH level',
  })
  @IsIn(['acid', 'neutral', 'alkaline'])
  soilPH: string;

  @ApiPropertyOptional({ example: 'Last tested in March, pH 6.2' })
  @IsString()
  @IsOptional()
  soilPHNote?: string;

  @ApiProperty({
    example: 'moist',
    enum: ['dry', 'moist', 'wet'],
    description: 'Current moisture content',
  })
  @IsIn(['dry', 'moist', 'wet'])
  moistureContent: string;

  @ApiPropertyOptional({ example: 'Adequate moisture after recent rains' })
  @IsString()
  @IsOptional()
  moistureNote?: string;

  @ApiProperty({
    example: 'medium',
    enum: ['low', 'medium', 'high'],
    description: 'Organic matter level',
  })
  @IsIn(['low', 'medium', 'high'])
  organicMatter: string;

  @ApiPropertyOptional({ example: 'Recently added compost' })
  @IsString()
  @IsOptional()
  organicNote?: string;

  @ApiPropertyOptional({ example: true, description: 'Nitrogen present' })
  @IsBoolean()
  @IsOptional()
  nitrogen?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Phosphorus present' })
  @IsBoolean()
  @IsOptional()
  phosphorus?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Potassium present' })
  @IsBoolean()
  @IsOptional()
  potassium?: boolean;

  @ApiPropertyOptional({
    example: 'Soil test results show good nutrient levels',
  })
  @IsString()
  @IsOptional()
  nutrientsNote?: string;
}
