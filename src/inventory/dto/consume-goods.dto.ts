import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ConsumeGoodsDto {
  @ApiProperty({ example: 2, description: 'Quantity to consume from stock' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
