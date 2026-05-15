import { PartialType } from '@nestjs/swagger';
import { CreateHarvestingDto } from './create-harvesting.dto';

export class UpdateHarvestingDto extends PartialType(CreateHarvestingDto) {}
