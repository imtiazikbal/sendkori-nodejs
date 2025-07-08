import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export enum Currency {
  USD = 'USD',
  BDT = 'BDT',
}

export enum PaymentStatus {
  FAILED = 'Failed',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Total amount', example: 100.5 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ enum: Currency, default: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ description: 'Transaction ID', example: 'tran_456def' })
  @IsString()
  @IsNotEmpty()
  tranId: string;

  @ApiProperty({
    description: 'Success URL',
    example: 'https://yourapp.com/payment-success',
  })
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'Failure URL',
    example: 'https://yourapp.com/payment-fail',
  })
  @IsString()
  @IsNotEmpty()
  failUrl: string;

  @ApiProperty({
    description: 'Cancel URL',
    example: 'https://yourapp.com/payment-cancel',
  })
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
