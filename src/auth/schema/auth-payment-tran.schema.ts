import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Auth_Payment_Tran extends Document {
  key: string;
  senderNumber: string;
  incomingTime: number;
  fullMessage: string;
  trxId?: string;
  fromNumber?: string;
  amount?: number;
}
@Schema({ timestamps: true })
export class Auth_Payment_Tran {
  @Prop({ required: true, unique: true, index: true, ref: 'Auth_API_key' })
  key: string;

  @Prop({ type: Types.ObjectId, ref: 'Auth', index: true })
  userId: string;

  @Prop({ required: true })
  senderNumber: string;

  @Prop({ required: true })
  incomingTime: number;

  @Prop({ required: false })
  fullMessage: string;

  @Prop({ required: true })
  trxId?: string;

  @Prop({ required: false })
  fromNumber?: string;

  @Prop({ required: false })
  amount?: number;

  @Prop({ type: Boolean, default: false })
  validated?: boolean;
}

export const Auth_Payment_TranSchema =
  SchemaFactory.createForClass(Auth_Payment_Tran);
