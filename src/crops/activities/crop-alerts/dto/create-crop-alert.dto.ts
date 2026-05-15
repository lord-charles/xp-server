import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateCropAlertDto {
  @ApiProperty({ example: 'clx2def' })
  @IsString()
  @IsNotEmpty()
  cropId: string;

  @ApiProperty({ example: 'clh2x0f3' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ example: 'Watering needed' })
  @IsString()
  @IsNotEmpty()
  alertType: string;

  @ApiProperty({ example: 'Soil moisture is below 30%' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    example: 'warning',
    enum: ['info', 'warning', 'critical'],
  })
  @IsIn(['info', 'warning', 'critical'])
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
