import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GrandPrix extends Document {
  @Prop({ required: true, unique: true })
  meetingKey: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  officialName?: string;

  @Prop({ required: true })
  circuitKey: number;

  @Prop({ required: true })
  dateStart: Date;

  @Prop({ required: true })
  dateEnd: Date;

  @Prop({ required: true }) // offset de l'heure du circuit (GMT), pour afficher les horaires en heure locale du circuit, so genre GP de mtl va show le starting time de mtl, pas celui du uk par exemple
  gmtOffset: number;

  @Prop({ default: false })
  isCanceled: boolean;
}

export const GrandPrixSchema = SchemaFactory.createForClass(GrandPrix);

GrandPrixSchema.index({ year: 1 }); // GP par année
GrandPrixSchema.index({ circuitKey: 1 }); // GP par circuit