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

export class CreateLabourDto {
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
    description: 'Date of labour activity',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'Soil Preparation',
    description: 'Activity name this labour is linked to',
  })
  @IsString()
  @IsNotEmpty()
  activityName: string;

  @ApiPropertyOptional({
    example: '["machine", "human"]',
    description: 'JSON array of labour categories used',
  })
  @IsString()
  @IsOptional()
  selectedLabourCategories?: string;

  // ── MACHINE LABOUR ─────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'Supplier / Operator Name',
    description: 'For machine labour category',
  })
  @IsString()
  @IsOptional()
  machineSupplier?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Hours of machine operation',
  })
  @IsNumber()
  @IsOptional()
  machineHours?: number;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Fee / cost for machine labour in KES',
  })
  @IsNumber()
  @IsOptional()
  machineFee?: number;

  // ── ANIMAL LABOUR ──────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 'Ox plough',
    description: 'Name / type of equipment for animal labour',
  })
  @IsString()
  @IsOptional()
  animalEquipmentName?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of animals used',
  })
  @IsNumber()
  @IsOptional()
  animalCount?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Hours of animal labour operation',
  })
  @IsNumber()
  @IsOptional()
  animalHours?: number;

  @ApiPropertyOptional({
    example: 1500,
    description: 'Fee / cost for animal labour in KES',
  })
  @IsNumber()
  @IsOptional()
  animalFee?: number;

  // ── HUMAN LABOUR ───────────────────────────────────────────────
  @ApiPropertyOptional({
    example: 5,
    description: 'Number of persons for human labour',
  })
  @IsNumber()
  @IsOptional()
  humanCount?: number;

  @ApiPropertyOptional({
    example: 6,
    description: 'Hours of human labour',
  })
  @IsNumber()
  @IsOptional()
  humanHours?: number;

  @ApiPropertyOptional({
    example: 1200,
    description: 'Fee / cost for human labour in KES',
  })
  @IsNumber()
  @IsOptional()
  humanFee?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
