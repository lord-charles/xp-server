import { PartialType } from '@nestjs/swagger';
import { CreatePesticideDto } from './create-pesticide.dto';

export class UpdatePesticideDto extends PartialType(CreatePesticideDto) {}
