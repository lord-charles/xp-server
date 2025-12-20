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
  @ApiProperty({
    description: 'Name of the inventory item',
    example: 'Premium Dairy Concentrate Feed',
  })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    required: false,
    description: 'Batch or lot number for tracking',
    example: 'BATCH-DF-2024-Q4-001',
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({
    required: false,
    description: 'Category of the item',
    example: 'Animal Feed & Nutrition',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    required: false,
    description: 'Stock keeping unit identifier',
    example: 'SKU-FEED-DAIRY-001',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 150,
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    required: false,
    description: 'Unit of measurement',
    example: '50kg bags',
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({
    description: 'Current storage location',
    example: 'Main Warehouse, Section A, Shelf 3',
  })
  @IsString()
  @IsNotEmpty()
  currentLocation: string;

  @ApiProperty({
    description: 'Current condition of the item',
    example: 'Excellent',
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
  })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({
    required: false,
    description: 'Purchase price per unit in KES',
    example: 3500.0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'purchasePrice must be a number' },
  )
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({
    required: false,
    description: 'Date when the item was purchased',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Supplier or vendor name',
    example: 'Kenya Agricultural Supplies Ltd',
  })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty({
    required: false,
    description: 'Expiration or best before date',
    example: '2025-06-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Next scheduled inspection date',
    example: '2025-03-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextInspectionDate?: Date;
}
