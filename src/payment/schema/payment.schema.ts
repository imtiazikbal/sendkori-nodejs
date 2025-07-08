import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CANCELLED } from 'dns';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;
const IPaymentSatus = {
  FAILED: 'Failed',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

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

  @Prop({ default: IPaymentSatus.PENDING })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
