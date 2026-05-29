import { PartialType } from '@nestjs/swagger';
import { CreateFieldConditionDto } from './create-field-condition.dto';

export class UpdateFieldConditionDto extends PartialType(
  CreateFieldConditionDto,
) {}
