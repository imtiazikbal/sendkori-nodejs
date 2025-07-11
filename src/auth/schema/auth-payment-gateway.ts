import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Auth_Payment_Gateway extends Document {
  userId: string;
  gatewayId: string;
  status: string;
  number: string;
}
@Schema({ timestamps: true })
export class Auth_Payment_Gateway {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Auth' })
  userId: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'Gateway' })
  gatewayId: string;

  @Prop({ required: true })
  number: string;
  @Prop({ required: true, default: true })
  status: string;
}

export const Auth_Payment_GatewaySchema =
  SchemaFactory.createForClass(Auth_Payment_Gateway);
