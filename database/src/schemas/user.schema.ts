import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: [String], default: [] })
  favoriteDriverKeys: string[];

  @Prop({ type: [Number], default: [] })
  favoriteCircuitKeys: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);