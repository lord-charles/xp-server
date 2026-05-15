import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateHarvestingDto {
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
    description: 'Date of harvesting',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'machine',
    enum: ['machine', 'human', 'animal'],
  })
  @IsIn(['machine', 'human', 'animal'])
  methodOfHarvesting: string;

  @ApiPropertyOptional({ example: 'Combine harvester' })
  @IsString()
  @IsOptional()
  typeOfMachine?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  fuelCost?: number;

  @ApiPropertyOptional({ example: 'Hired' })
  @IsString()
  @IsOptional()
  sourceMachine?: string;

  @ApiPropertyOptional({ example: 'Operator' })
  @IsString()
  @IsOptional()
  operatorType?: string;

  @ApiPropertyOptional({ example: 'Hired' })
  @IsString()
  @IsOptional()
  sourceLabor?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  workerName?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @IsOptional()
  timeWorked?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  harvestedQuantity?: number;

  @ApiPropertyOptional({ example: 'Grade A' })
  @IsString()
  @IsOptional()
  harvestedQuality?: string;

  @ApiPropertyOptional({ example: 'Truck' })
  @IsString()
  @IsOptional()
  meansOfTransport?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  numberOfTrips?: number;

  @ApiPropertyOptional({ example: 8000 })
  @IsNumber()
  @IsOptional()
  costOfTransport?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
