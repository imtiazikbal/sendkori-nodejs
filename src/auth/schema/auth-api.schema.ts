import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthDocument = Auth_API_key & Document;

@Schema({ timestamps: true })
export class Auth_API_key {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true, index: true })
  key!: string;
  @Prop({ type: Types.ObjectId, ref: 'Auth' })
  userId: string;
}

export const Auth_API_keySchema = SchemaFactory.createForClass(Auth_API_key);
