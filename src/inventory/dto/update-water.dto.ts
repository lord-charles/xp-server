import { PartialType } from '@nestjs/swagger';
import { CreateWaterDto } from './create-water.dto';

export class UpdateWaterDto extends PartialType(CreateWaterDto) {}
