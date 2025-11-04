import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { AnalyticsPeriod } from './analytics-query.dto';

export class ProductionAnalyticsQueryDto {
  @ApiProperty({ example: 'clh2x0f380000mk08g8hv1q2z', description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.THIS_MONTH,
    description: 'Analytics period',
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;

  @ApiProperty({
    example: 'milk',
    description: 'Production type filter (milk, eggs, meat)',
    required: false,
  })
  @IsOptional()
  @IsString()
  productionType?: string;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Start date (required if period is Custom Range)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'End date (required if period is Custom Range)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class FinancialTrendsQueryDto {
  @ApiProperty({ example: 'clh2x0f380000mk08g8hv1q2z', description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({
    example: ['revenue', 'expenses', 'profit'],
    description: 'Metrics to include in trends',
    required: false,
  })
  @IsOptional()
  @IsArray()
  metrics?: string[];

  @ApiProperty({
    example: 'monthly',
    description: 'Trend granularity (daily, weekly, monthly, quarterly)',
    required: false,
  })
  @IsOptional()
  @IsString()
  granularity?: string;

  @ApiProperty({
    example: 12,
    description: 'Number of periods to include',
    required: false,
  })
  @IsOptional()
  periods?: number;
}

export class KPIQueryDto {
  @ApiProperty({ example: 'clh2x0f380000mk08g8hv1q2z', description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.THIS_MONTH,
    description: 'Current period for KPIs',
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  currentPeriod?: AnalyticsPeriod;

  @ApiProperty({
    enum: AnalyticsPeriod,
    example: AnalyticsPeriod.LAST_MONTH,
    description: 'Comparison period for KPIs',
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  comparisonPeriod?: AnalyticsPeriod;
}
