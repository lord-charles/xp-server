import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum AnalyticsPeriod {
  THIS_WEEK = 'This week',
  THIS_MONTH = 'This month',
  THIS_QUARTER = 'This quarter',
  THIS_YEAR = 'This year',
  LAST_WEEK = 'Last week',
  LAST_MONTH = 'Last month',
  LAST_QUARTER = 'Last quarter',
  LAST_YEAR = 'Last year',
  CUSTOM_RANGE = 'Custom Range',
}

export class AnalyticsQueryDto {
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

export class LivestockAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiProperty({
    example: 'cattle',
    description: 'Livestock category filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: 'dairy',
    description: 'Livestock type filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class EmployeeAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiProperty({
    example: 'permanent',
    description: 'Employment type filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiProperty({
    example: 'management',
    description: 'Department filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;
}
