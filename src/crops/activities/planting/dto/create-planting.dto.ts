import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePlantingDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  // ── Step 1: Method & Date ─────────────────────────────────────────────────

  @ApiProperty({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Date of planting',
  })
  @IsDateString()
  dateOfPlanting: string;

  @ApiProperty({
    example: 'direct-seeding',
    enum: ['direct-seeding', 'transplanting'],
  })
  @IsIn(['direct-seeding', 'transplanting'])
  methodOfPlanting: string;

  // ── Step 2: Seed Information ──────────────────────────────────────────────

  @ApiProperty({
    example: 'inventory',
    enum: ['inventory', 'recently-acquired'],
  })
  @IsIn(['inventory', 'recently-acquired'])
  seedSource: string;

  @ApiPropertyOptional({
    example: 'Hybrid 614',
    description: 'Required when seedSource=recently-acquired',
  })
  @IsString()
  @IsOptional()
  seedVarietyName?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dateAcquired?: string;

  @ApiProperty({
    example: 'agronet',
    enum: ['government', 'cooperative', 'agronet', 'personally-procured'],
  })
  @IsIn(['government', 'cooperative', 'agronet', 'personally-procured'])
  sourceOfSeeds: string;

  @ApiProperty({ example: '2', description: 'Seeds per hole' })
  @IsString()
  @IsNotEmpty()
  seedRatePerHole: string;

  @ApiProperty({ example: '75 × 30', description: 'Row × plant spacing in cm' })
  @IsString()
  @IsNotEmpty()
  spacing: string;

  @ApiProperty({ example: '5', description: 'Planting depth in cm' })
  @IsString()
  @IsNotEmpty()
  plantingDepth: string;

  @ApiProperty({ example: '12', description: 'Quantity planted in kg' })
  @IsString()
  @IsNotEmpty()
  quantityPlanted: string;

  // ── Step 3: Transplanting details (only when methodOfPlanting=transplanting) ──

  @ApiPropertyOptional({
    example: 'human-hand',
    enum: ['machine', 'animal-driven', 'human-hand'],
  })
  @IsIn(['machine', 'animal-driven', 'human-hand'])
  @IsOptional()
  methodOfTransplanting?: string;

  @ApiPropertyOptional({ example: 'One per hole' })
  @IsString()
  @IsOptional()
  seedlingRate?: string;

  @ApiPropertyOptional({ example: '60 × 30' })
  @IsString()
  @IsOptional()
  transplantSpacing?: string;

  @ApiPropertyOptional({ example: '5' })
  @IsString()
  @IsOptional()
  transplantDepth?: string;

  // ── Step 3: Assessment ────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: '2026-02-22T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  assessmentDate?: string;

  @ApiPropertyOptional({
    example: '90',
    description: 'Percentage of seeds/seedlings established',
  })
  @IsString()
  @IsOptional()
  percentageEstablished?: string;

  @ApiPropertyOptional({ example: 'yes', enum: ['yes', 'no', 'partial'] })
  @IsIn(['yes', 'no', 'partial'])
  @IsOptional()
  harvestDelivered?: string;

  @ApiPropertyOptional({
    example: 'replanting',
    enum: ['replanting', 'fertilizer', 'irrigation', 'pest-control', 'none'],
  })
  @IsIn(['replanting', 'fertilizer', 'irrigation', 'pest-control', 'none'])
  @IsOptional()
  remedy?: string;

  // ── Labour ────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'human', 'animal'],
  })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
