import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateSoilPrepDto {
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
    description: 'Date of soil preparation',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'contour',
    enum: ['contour', 'ridge', 'strip', 'flat', 'terracing', 'no-till'],
  })
  @IsIn(['contour', 'ridge', 'strip', 'flat', 'terracing', 'no-till'])
  tillageType: string;

  @ApiProperty({ example: 2.5, description: 'Area prepared' })
  @IsNumber()
  area: number;

  @ApiPropertyOptional({ example: 'acres', default: 'acres' })
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({
    example: 'machine',
    enum: ['machine', 'human', 'animal'],
  })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional({ example: 'Contour ploughing done before rains' })
  @IsString()
  @IsOptional()
  notes?: string;
}
