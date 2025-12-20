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
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ required: false, description: 'Any text batch number' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentLocation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({ required: false })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'purchasePrice must be a number' },
  )
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplier?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  nextInspectionDate?: Date;
}
