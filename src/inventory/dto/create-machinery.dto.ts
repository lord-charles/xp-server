import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateMachineryDto {
  @ApiProperty({
    description: 'Name/model of the equipment',
    example: 'John Deere 5075E Utility Tractor',
  })
  @IsString()
  @IsNotEmpty()
  equipmentName: string;

  @ApiProperty({
    required: false,
    description: 'Unique equipment identifier or serial number',
    example: 'JD-5075E-KE-2024-001',
  })
  @IsString()
  @IsOptional()
  equipmentId?: string;

  @ApiProperty({
    required: false,
    description: 'Date when the equipment was purchased',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  purchaseDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Purchase price in KES',
    example: 2800000.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({
    required: false,
    description: 'Current location of the machinery',
    example: 'Equipment Shed, Bay 1, North Section',
  })
  @IsString()
  @IsOptional()
  machineryLocation?: string;

  @ApiProperty({
    required: false,
    description: 'Current condition of the equipment',
    example: 'Excellent',
    enum: [
      'Excellent',
      'Good',
      'Fair',
      'Poor',
      'Under Repair',
      'Out of Service',
    ],
  })
  @IsString()
  @IsOptional()
  machineryCondition?: string;

  @ApiProperty({
    required: false,
    description: 'Date of last maintenance service',
    example: '2024-11-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  lastServiceDate?: Date;

  @ApiProperty({
    required: false,
    description: 'Next scheduled service date',
    example: '2025-05-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextServiceDate?: Date;
}
