import { PartialType } from '@nestjs/swagger';
import { CreateProcessingDto } from './create-processing.dto';

export class UpdateProcessingDto extends PartialType(CreateProcessingDto) {}
