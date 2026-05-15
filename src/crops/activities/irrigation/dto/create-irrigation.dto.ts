import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateIrrigationDto {
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
    description: 'Date of irrigation',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'drip',
    description: 'Irrigation method',
  })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiPropertyOptional({ example: 'Moist' })
  @IsString()
  @IsOptional()
  soilMoisture?: string;

  @ApiPropertyOptional({ example: 'Borehole' })
  @IsString()
  @IsOptional()
  waterSource?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({ example: 'liters' })
  @IsString()
  @IsOptional()
  volumeUnit?: string;

  @ApiPropertyOptional({ example: 'Drip line' })
  @IsString()
  @IsOptional()
  applicationMethod?: string;

  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @IsOptional()
  systemCost?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @IsOptional()
  fuelCost?: number;

  @ApiPropertyOptional({
    example: 'human',
    enum: ['machine', 'human', 'animal'],
  })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  hoursWorked?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  additionalCharges?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
