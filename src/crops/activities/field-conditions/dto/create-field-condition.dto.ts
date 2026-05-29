import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateFieldConditionDto {
  @ApiProperty({ example: 'clx2def', description: 'Crop ID' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3', description: 'Farm ID' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({
    example: '2026-02-10T00:00:00.000Z',
    description: 'Date of field condition assessment',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'sloped',
    enum: ['flat', 'sloped', 'hilly'],
    description: 'Field topography',
  })
  @IsIn(['flat', 'sloped', 'hilly'])
  topography: string;

  @ApiPropertyOptional({ example: 'Moderate slope towards south' })
  @IsString()
  @IsOptional()
  topographyNote?: string;

  @ApiProperty({
    example: 'well-drained',
    enum: ['well-drained', 'poorly-drained', 'waterlogged'],
    description: 'Drainage condition',
  })
  @IsIn(['well-drained', 'poorly-drained', 'waterlogged'])
  drainage: string;

  @ApiPropertyOptional({ example: 'Good drainage after recent rains' })
  @IsString()
  @IsOptional()
  drainageNote?: string;

  @ApiProperty({
    example: 'medium',
    enum: ['low', 'medium', 'high'],
    description: 'Previous crop residue level',
  })
  @IsIn(['low', 'medium', 'high'])
  previousCropResidue: string;

  @ApiPropertyOptional({ example: 'Maize stalks partially incorporated' })
  @IsString()
  @IsOptional()
  residueNote?: string;
}
