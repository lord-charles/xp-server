import { PartialType } from '@nestjs/swagger';
import { CreateLabourDto } from './create-labour.dto';

export class UpdateLabourDto extends PartialType(CreateLabourDto) {}
