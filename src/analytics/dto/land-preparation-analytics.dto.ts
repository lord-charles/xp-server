import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Filters for the mobile Land Preparation Analytics screen.
 *
 * `farmId` is always required. The remaining filters can be combined; when
 * both cropId and cycleId are supplied, the crop must belong to that cycle.
 */
export class LandPreparationAnalyticsQueryDto {
  @ApiProperty({
    example: 'cmub9guig000kq9lc9ymtzkia',
    description: 'Farm whose land preparation records should be analysed',
  })
  @IsString()
  farmId: string;

  @ApiPropertyOptional({
    example: 'cmub9guig000lq9lcwxy12345',
    description: 'Limit results to one crop cycle/season',
  })
  @IsOptional()
  @IsString()
  cycleId?: string;

  @ApiPropertyOptional({
    example: 'cmub9guig000mq9lcabc12345',
    description: 'Limit results to one crop',
  })
  @IsOptional()
  @IsString()
  cropId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Inclusive ISO-8601 start date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Inclusive ISO-8601 end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
