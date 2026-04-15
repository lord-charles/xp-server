import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreateCycleDto {
  @ApiProperty({ example: 'clh2x0f380001mk08x7v2p4m1' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ example: 'Dry Season 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '01/02/2026', description: 'DD/MM/YYYY' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: '30/06/2026', description: 'DD/MM/YYYY' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'entire', enum: ['entire', 'input'] })
  @IsIn(['entire', 'input'])
  landSelection: string;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Required when landSelection is input',
  })
  @IsNumber()
  @IsOptional()
  landSize?: number;

  @ApiPropertyOptional({ example: 'acres', default: 'acres' })
  @IsString()
  @IsOptional()
  landUnit?: string;
}
