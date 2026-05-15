import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateChemicalDto {
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
    description: 'Date of chemical application',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Insecticide' })
  @IsString()
  @IsNotEmpty()
  chemicalName: string;

  @ApiPropertyOptional({ example: 'Synthetic' })
  @IsString()
  @IsOptional()
  chemicalType?: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @IsOptional()
  dosage?: number;

  @ApiPropertyOptional({ example: 'liters' })
  @IsString()
  @IsOptional()
  dosageUnit?: string;

  @ApiPropertyOptional({ example: 'Spraying' })
  @IsString()
  @IsOptional()
  applicationMethod?: string;

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
