import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdateSoilPrepDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    enum: ['contour', 'ridge', 'strip', 'flat', 'terracing', 'no-till'],
  })
  @IsIn(['contour', 'ridge', 'strip', 'flat', 'terracing', 'no-till'])
  @IsOptional()
  tillageType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({ enum: ['machine', 'human', 'animal'] })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
