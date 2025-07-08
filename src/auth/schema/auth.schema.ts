import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop()
  picture?: string;

  @Prop({ type: String, required: false, default: '' })
  subscriptionId?: string;

  @Prop()
  phoneNumber?: string;
  @Prop({ type: [String], default: ['user'] })
  roles?: string[];

  @Prop({ type: String, default: '1' })
  active?: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
