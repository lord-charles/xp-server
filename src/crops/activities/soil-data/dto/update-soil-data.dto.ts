import { PartialType } from '@nestjs/swagger';
import { CreateSoilDataDto } from './create-soil-data.dto';

export class UpdateSoilDataDto extends PartialType(CreateSoilDataDto) {}
