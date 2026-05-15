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

export class TillageEntryDto {
  @ApiProperty({ example: 'moldboard', description: 'Tillage type ID' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'Moldboard plough',
    description: 'Tool or machine used',
  })
  @IsString()
  @IsNotEmpty()
  tool: string;
}

export class CreateTillageDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ example: '2026-01-08T00:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'contour',
    enum: ['contour', 'ridge', 'strip', 'terracing', 'no-till'],
  })
  @IsIn(['contour', 'ridge', 'strip', 'terracing', 'no-till'])
  system: string;

  @ApiPropertyOptional({
    description: 'Primary tillage entries',
    type: [TillageEntryDto],
  })
  @IsArray()
  @IsOptional()
  primaryEntries?: TillageEntryDto[];

  @ApiPropertyOptional({
    description: 'Secondary tillage entries',
    type: [TillageEntryDto],
  })
  @IsArray()
  @IsOptional()
  secondaryEntries?: TillageEntryDto[];

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  area: number;

  @ApiPropertyOptional({ example: 'acres' })
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({ example: 3500 })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
