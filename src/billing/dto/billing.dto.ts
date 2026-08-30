import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBillingSettingDto {
  @ApiProperty({
    example: 'HIGHEST',
    description:
      'For PRICING_COMBINATION_STRATEGY use SUM, HIGHEST, LIVESTOCK_ONLY, or CROPS_ONLY.',
  })
  @IsString()
  value: string;
}

export class CreateOrUpdatePlanDto {
  @ApiProperty({ example: 'LIVESTOCK_STARTER' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Livestock Starter' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'LIVESTOCK_COUNT',
    enum: ['LIVESTOCK_COUNT', 'CROPS_ACRES', 'POULTRY_FLAT'],
  })
  @IsEnum(['LIVESTOCK_COUNT', 'CROPS_ACRES', 'POULTRY_FLAT'])
  metric: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiProperty({
    example: 100,
    description: 'Monthly amount in Kenyan shillings.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyAmount: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ example: 'ANNUAL', enum: ['MONTHLY', 'ANNUAL'] })
  @IsEnum(['MONTHLY', 'ANNUAL'])
  billingCycle: 'MONTHLY' | 'ANNUAL';
}

export class InitiateStkPushDto {
  @ApiProperty({ example: 'cm1invoice123456789' })
  @IsString()
  invoiceId: string;

  @ApiProperty({
    example: '0712345678',
    description:
      'Kenyan Safaricom number. 07..., 254..., or +254... is accepted.',
  })
  @IsString()
  phoneNumber: string;
}

export class InitiateAdminStkPushDto {
  @ApiProperty({
    example: '0712345678',
    description:
      'Kenyan Safaricom number. 07..., 254..., or +254... is accepted.',
  })
  @IsString()
  phoneNumber: string;
}

export class CreateAdminInvoiceDto {
  @ApiProperty({ example: 'cm1subscription123456' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ example: 'cm1billingplan123456' })
  @IsString()
  planId: string;
}

export class OverrideInvoicePlanDto {
  @ApiProperty({ example: 'cm1billingplan123456' })
  @IsString()
  planId: string;
}

export class RecordMpesaPaymentDto {
  @ApiProperty({
    example: 1000,
    description: 'Amount shown on the M-Pesa receipt.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'QWE123ABC',
    description: 'Unique M-Pesa receipt code.',
  })
  @IsString()
  receiptNumber: string;

  @ApiPropertyOptional({ example: '0712345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class RecordManualPaymentDto {
  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'BANK', enum: ['BANK', 'CHEQUE', 'CASH'] })
  @IsEnum(['BANK', 'CHEQUE', 'CASH'])
  provider: 'BANK' | 'CHEQUE' | 'CASH';

  @ApiPropertyOptional({ example: 'KCB-TRANSFER-10293' })
  @IsOptional()
  @IsString()
  reference?: string;
}
