import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateProcessingDto {
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
    description: 'Date of processing',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Milling' })
  @IsString()
  @IsNotEmpty()
  processingType: string;

  @ApiPropertyOptional({ example: 'Wet milling' })
  @IsString()
  @IsOptional()
  processingMethod?: string;

  @ApiPropertyOptional({ example: 'Hammer mill' })
  @IsString()
  @IsOptional()
  equipment?: string;

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'human', 'animal'],
  })
  @IsString()
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({ example: 4000 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsNumber()
  @IsOptional()
  outputQuantity?: number;

  @ApiPropertyOptional({ example: 'Grade A' })
  @IsString()
  @IsOptional()
  outputQuality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
