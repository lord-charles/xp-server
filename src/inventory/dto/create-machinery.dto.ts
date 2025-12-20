import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateMachineryDto {
  @ApiProperty({ example: 'John Deere Tractor 5075E' })
  @IsString()
  @IsNotEmpty()
  equipmentName: string;

  @ApiProperty({ required: false, example: 'JD-5075E-2024-001' })
  @IsString()
  @IsOptional()
  equipmentId?: string;

  @ApiProperty({ required: false, example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiProperty({ required: false, example: 45000.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ required: false, example: 'Main Barn, Equipment Bay 1' })
  @IsString()
  @IsOptional()
  machineryLocation?: string;

  @ApiProperty({ required: false, example: 'Excellent' })
  @IsString()
  @IsOptional()
  machineryCondition?: string;

  @ApiProperty({ required: false, example: '2024-11-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  lastServiceDate?: Date;

  @ApiProperty({ required: false, example: '2025-05-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  nextServiceDate?: Date;
}
