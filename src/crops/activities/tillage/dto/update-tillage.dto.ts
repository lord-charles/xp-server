import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  IsArray,
} from 'class-validator';
import { TillageEntryDto } from './create-tillage.dto';

export class UpdateTillageDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    enum: ['contour', 'ridge', 'strip', 'terracing', 'no-till'],
  })
  @IsIn(['contour', 'ridge', 'strip', 'terracing', 'no-till'])
  @IsOptional()
  system?: string;

  @ApiPropertyOptional({ type: [TillageEntryDto] })
  @IsArray()
  @IsOptional()
  primaryEntries?: TillageEntryDto[];

  @ApiPropertyOptional({ type: [TillageEntryDto] })
  @IsArray()
  @IsOptional()
  secondaryEntries?: TillageEntryDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
