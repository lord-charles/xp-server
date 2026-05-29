import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreatePesticideDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiPropertyOptional({
    example: '["1", "2", "3"]',
    description: 'JSON array of selected pest IDs',
  })
  @IsString()
  @IsOptional()
  selectedPests?: string;

  @ApiPropertyOptional({
    example: 'contact',
    enum: ['contact', 'systemic', 'biological', 'residual'],
  })
  @IsIn(['contact', 'systemic', 'biological', 'residual'])
  @IsOptional()
  pesticideType?: string;

  @ApiPropertyOptional({
    example: 'newly-purchased',
    enum: ['newly-purchased', 'existing'],
  })
  @IsIn(['newly-purchased', 'existing'])
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    example: '2026-02-10T00:00:00.000Z',
    description: 'Date of purchase (if newly-purchased)',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 'Agro-Vet Store' })
  @IsString()
  @IsOptional()
  seller?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  quantityPurchased?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  transportCost?: number;

  @ApiProperty({ example: 'Cypermethrin' })
  @IsString()
  @IsNotEmpty()
  pesticideName: string;

  @ApiProperty({
    example: '2026-02-15T00:00:00.000Z',
    description: 'Date of application',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Spraying' })
  @IsString()
  @IsOptional()
  applicationMethod?: string;

  @ApiPropertyOptional({ example: 'Knapsack Sprayer' })
  @IsString()
  @IsOptional()
  equipment?: string;

  @ApiPropertyOptional({ example: '1:200' })
  @IsString()
  @IsOptional()
  dilutionRatio?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  amountApplied?: number;

  @ApiPropertyOptional({
    example: 'L',
    enum: ['L', 'mL', 'kg'],
  })
  @IsIn(['L', 'mL', 'kg'])
  @IsOptional()
  amountUnit?: string;

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'animal', 'human'],
  })
  @IsIn(['machine', 'animal', 'human'])
  @IsOptional()
  labour?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  workerName?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  timeWorked?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
