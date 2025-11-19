import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsEnum,
  Min,
} from 'class-validator';
import { PaymentMethod, BuyerType } from './create-sale-listing.dto';

export class CompleteSaleDto {
  @ApiProperty({
    description: 'Date when the sale was completed',
    example: '2025-06-15T10:00:00Z',
  })
  @IsDateString()
  saleDate: string;

  @ApiProperty({
    description: 'Name of the buyer',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiPropertyOptional({
    description: 'Contact information of the buyer',
    example: '+254712345678',
  })
  @IsString()
  @IsOptional()
  buyerContact?: string;

  @ApiPropertyOptional({
    enum: BuyerType,
    description: 'Buyer type classification',
    example: BuyerType.INDIVIDUAL,
  })
  @IsEnum(BuyerType)
  @IsOptional()
  buyerType?: BuyerType;

  @ApiProperty({
    description: 'Final sale amount',
    example: 85000,
  })
  @IsNumber()
  @Min(0)
  saleAmount: number;

  @ApiPropertyOptional({
    description: 'Prevailing market price at time of sale',
    example: 80000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  marketPrice?: number;

  @ApiPropertyOptional({
    description: 'Actual sale price agreed (alias of saleAmount for compatibility)',
    example: 85000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Payment method used',
    example: PaymentMethod.MOBILE_MONEY,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Receipt number for the transaction',
    example: 'RCT-2025-001',
  })
  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the sale',
    example: 'Buyer satisfied with the livestock condition',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Array of attachment URLs (receipts, photos, etc.)',
    example: ['https://example.com/receipt.pdf'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
