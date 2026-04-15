import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class UpdateCycleDto {
  @ApiPropertyOptional({ example: 'Long Rains 2026' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '01/03/2026' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '31/08/2026' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['Active', 'Complete', 'Planned'] })
  @IsIn(['Active', 'Complete', 'Planned'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: ['entire', 'input'] })
  @IsIn(['entire', 'input'])
  @IsOptional()
  landSelection?: string;

  @ApiPropertyOptional({ example: 3.0 })
  @IsNumber()
  @IsOptional()
  landSize?: number;

  @ApiPropertyOptional({ example: 'acres' })
  @IsString()
  @IsOptional()
  landUnit?: string;
}
