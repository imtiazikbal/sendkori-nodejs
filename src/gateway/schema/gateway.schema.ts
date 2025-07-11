import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GatewayDocument = Gateway & Document;

export type PaymentMethodType = 'mobile_payment' | 'card' | 'bank_transfer';

@Schema({ timestamps: true })
export class Gateway {
  @Prop({ required: true })
  title: string;

  @Prop()
  image?: string;

  @Prop({ required: true })
  status: boolean;

  @Prop({ type: String, default: '' })
  type: string;

  @Prop({
    type: String,
    required: true,
  })
  paymentMethod: string;
}

export const GatewaySchema = SchemaFactory.createForClass(Gateway);
