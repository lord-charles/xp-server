import { PartialType } from '@nestjs/swagger';
import { CreateIrrigationDto } from './create-irrigation.dto';

export class UpdateIrrigationDto extends PartialType(CreateIrrigationDto) {}
