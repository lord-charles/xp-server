import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ReportPeriod {
  THIS_WEEK = 'This week',
  THIS_MONTH = 'This month',
  THIS_QUARTER = 'This quarter',
  THIS_YEAR = 'This year',
  LAST_WEEK = 'Last week',
  LAST_MONTH = 'Last month',
  LAST_QUARTER = 'Last quarter',
  LAST_YEAR = 'Last year',
  DATE_RANGE = 'Date range',
}

export class FinancialReportQueryDto {
  @ApiProperty({ example: 'clh2x0f380000mk08g8hv1q2z', description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({
    enum: ReportPeriod,
    example: ReportPeriod.THIS_MONTH,
    description: 'Report period',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiProperty({
    example: '2025-01-01',
    description: 'Start date (required if period is Date range)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'End date (required if period is Date range)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
