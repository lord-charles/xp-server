import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateCropSaleDto {
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
    description: 'Date of sale',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsString()
  @IsOptional()
  quantityUnit?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsNotEmpty()
  pricePerUnit: number;

  @ApiPropertyOptional({ example: 'John Buyer' })
  @IsString()
  @IsOptional()
  buyerName?: string;

  @ApiPropertyOptional({ example: 'Cash' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
