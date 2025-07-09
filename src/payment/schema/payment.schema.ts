import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;
export enum IPaymentSatus {
  FAILED = 'Failed',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface IPaymentMethod {
  name: string;
  type: string;
  amount: number;
  tranId: string;
}

type ICurrency = 'USD' | 'BDT';
@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, index: true, unique: true })
  sessionId: string;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Auth_API_key',
    index: true,
  })
  apiKey: string;

  @Prop({ type: Types.ObjectId, ref: 'Auth', index: true })
  userId: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: ['USD', 'BDT'], default: 'USD' })
  currency: string;

  @Prop({ required: true })
  tranId: string;

  @Prop({ required: true })
  successUrl: string;

  @Prop({ required: true })
  failUrl: string;
  @Prop({ required: true })
  cancelUrl: string;

  @Prop({ required: false, default: false })
  sessionTimeout: boolean;

  @Prop({ required: false, default: '' })
  paymentMethod: string;

  @Prop({ default: IPaymentSatus.PENDING })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
