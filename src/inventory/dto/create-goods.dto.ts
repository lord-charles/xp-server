import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateGoodsDto {
  @ApiProperty({ example: 'Dairy Feed Pellets' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    required: false,
    description: 'Any text batch number',
    example: 'BATCH-2024-001',
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ required: false, example: 'Animal Feed' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, example: 'SKU-FEED-001' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ required: false, example: 'bags' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 'Warehouse A, Section 2' })
  @IsString()
  @IsNotEmpty()
  currentLocation: string;

  @ApiProperty({ example: 'Good' })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({ required: false, example: 2500.0 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'purchasePrice must be a number' },
  )
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ required: false, example: '2024-12-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiProperty({ required: false, example: 'Agro Supplies Ltd' })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty({ required: false, example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({ required: false, example: '2025-03-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  nextInspectionDate?: Date;
}
