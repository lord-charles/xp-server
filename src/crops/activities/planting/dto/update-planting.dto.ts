import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdatePlantingDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfPlanting?: string;

  @ApiPropertyOptional({ enum: ['direct-seeding', 'transplanting'] })
  @IsIn(['direct-seeding', 'transplanting'])
  @IsOptional()
  methodOfPlanting?: string;

  @ApiPropertyOptional({ enum: ['inventory', 'recently-acquired'] })
  @IsIn(['inventory', 'recently-acquired'])
  @IsOptional()
  seedSource?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seedVarietyName?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateAcquired?: string;

  @ApiPropertyOptional({
    enum: ['government', 'cooperative', 'agronet', 'personally-procured'],
  })
  @IsIn(['government', 'cooperative', 'agronet', 'personally-procured'])
  @IsOptional()
  sourceOfSeeds?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seedRatePerHole?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  spacing?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  plantingDepth?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  quantityPlanted?: string;

  @ApiPropertyOptional({ enum: ['machine', 'animal-driven', 'human-hand'] })
  @IsIn(['machine', 'animal-driven', 'human-hand'])
  @IsOptional()
  methodOfTransplanting?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seedlingRate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  transplantSpacing?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  transplantDepth?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  assessmentDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  percentageEstablished?: string;

  @ApiPropertyOptional({ enum: ['yes', 'no', 'partial'] })
  @IsIn(['yes', 'no', 'partial'])
  @IsOptional()
  harvestDelivered?: string;

  @ApiPropertyOptional({
    enum: ['replanting', 'fertilizer', 'irrigation', 'pest-control', 'none'],
  })
  @IsIn(['replanting', 'fertilizer', 'irrigation', 'pest-control', 'none'])
  @IsOptional()
  remedy?: string;

  @ApiPropertyOptional({ enum: ['machine', 'human', 'animal'] })
  @IsIn(['machine', 'human', 'animal'])
  @IsOptional()
  labourType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  numberOfWorkers?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
