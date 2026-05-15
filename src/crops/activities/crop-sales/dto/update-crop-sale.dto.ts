import { PartialType } from '@nestjs/swagger';
import { CreateCropSaleDto } from './create-crop-sale.dto';

export class UpdateCropSaleDto extends PartialType(CreateCropSaleDto) {}
