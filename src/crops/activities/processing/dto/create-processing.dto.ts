import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
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
  @IsIn(['machine', 'human', 'animal'])
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

  // ─── Pest Control Fields (Step 2) ───────────────────────────────────────
  @ApiPropertyOptional({
    example: '2026-02-16T00:00:00.000Z',
    description: 'Date of pest control during processing',
  })
  @IsDateString()
  @IsOptional()
  dateOfPestControl?: string;

  @ApiPropertyOptional({ example: 'Weevils' })
  @IsString()
  @IsOptional()
  pestIdentified?: string;

  @ApiPropertyOptional({
    example: 'pesticides',
    enum: ['wood-ash', 'carbonating', 'polythene-lined-bags', 'pesticides'],
  })
  @IsIn(['wood-ash', 'carbonating', 'polythene-lined-bags', 'pesticides'])
  @IsOptional()
  methodOfControl?: string;

  @ApiPropertyOptional({
    example: 'newly-purchased',
    enum: ['newly-purchased', 'existing-in-inventory'],
  })
  @IsIn(['newly-purchased', 'existing-in-inventory'])
  @IsOptional()
  pesticideSource?: string;

  @ApiPropertyOptional({ example: 'Actellic' })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiPropertyOptional({ example: 'Dusting' })
  @IsString()
  @IsOptional()
  methodOfApplication?: string;

  @ApiPropertyOptional({ example: '2kg' })
  @IsString()
  @IsOptional()
  amountAppliedPest?: string;

  @ApiPropertyOptional({ example: 'ABC123' })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-02-01T00:00:00.000Z',
    description: 'Date pesticide was purchased',
  })
  @IsDateString()
  @IsOptional()
  dateOfPurchase?: string;

  @ApiPropertyOptional({ example: 'Agrovet' })
  @IsString()
  @IsOptional()
  seller?: string;

  @ApiPropertyOptional({ example: '5kg' })
  @IsString()
  @IsOptional()
  quantityPurchased?: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  transportCost?: number;

  // ─── Storage Fields (Step 3) ────────────────────────────────────────────
  @ApiPropertyOptional({
    example: '2026-02-20T00:00:00.000Z',
    description: 'Date of storage',
  })
  @IsDateString()
  @IsOptional()
  dateOfStorage?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsNumber()
  @IsOptional()
  finalQuantity?: number;

  @ApiPropertyOptional({ example: 'Grade A' })
  @IsString()
  @IsOptional()
  finalQuality?: string;

  @ApiPropertyOptional({
    example: 'warehouses',
    enum: [
      'refrigerated-rooms',
      'cold-chain-trucks',
      'polythene-lined-bags',
      'clay-pots',
      'plastic-pots',
      'glass-pots',
      'silos',
      'warehouses',
      'barns',
      'granaries',
      'other',
    ],
  })
  @IsIn([
    'refrigerated-rooms',
    'cold-chain-trucks',
    'polythene-lined-bags',
    'clay-pots',
    'plastic-pots',
    'glass-pots',
    'silos',
    'warehouses',
    'barns',
    'granaries',
    'other',
  ])
  @IsOptional()
  typeOfStorage?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  miscellaneousCostsIncurred?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
