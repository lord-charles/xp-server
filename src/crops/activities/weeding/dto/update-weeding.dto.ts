import { PartialType } from '@nestjs/swagger';
import { CreateWeedingDto } from './create-weeding.dto';

export class UpdateWeedingDto extends PartialType(CreateWeedingDto) {}
