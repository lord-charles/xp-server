import { PartialType } from '@nestjs/swagger';
import { CreateChemicalDto } from './create-chemical.dto';

export class UpdateChemicalDto extends PartialType(CreateChemicalDto) {}
