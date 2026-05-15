import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateLossDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Date of loss',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Weather damage' })
  @IsString()
  @IsNotEmpty()
  lossType: string;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  quantityUnit?: string;

  @ApiPropertyOptional({ example: 'Heavy rain' })
  @IsString()
  @IsOptional()
  cause?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
