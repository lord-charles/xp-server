import { PartialType } from '@nestjs/swagger';
import { CreateFertilizerDto } from './create-fertilizer.dto';

export class UpdateFertilizerDto extends PartialType(CreateFertilizerDto) {}
