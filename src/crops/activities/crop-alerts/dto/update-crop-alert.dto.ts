import { PartialType } from '@nestjs/swagger';
import { CreateCropAlertDto } from './create-crop-alert.dto';

export class UpdateCropAlertDto extends PartialType(CreateCropAlertDto) {}
