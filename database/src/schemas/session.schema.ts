import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class WeatherSummary {
  @Prop() // température de l'extérieur
  airTempAvg?: number;

  @Prop() // température de la piste/du sol
  trackTempAvg?: number;

  @Prop({ type: String, enum: ['Dry', 'Wet', 'Mixed'] })
  conditions?: string;
}
export const WeatherSummarySchema = SchemaFactory.createForClass(WeatherSummary);

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true, unique: true })
  sessionKey: number;

  @Prop({ required: true })
  meetingKey: number;

  @Prop({ required: true })
  circuitKey: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: ['Practice', 'Qualifying', 'Sprint Qualifying', 'Sprint', 'Race'],
    required: true,
  })
  sessionType: string;

  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ default: false })
  isCanceled: boolean;

  @Prop({ type: WeatherSummarySchema })
  weather?: WeatherSummary;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.index({ meetingKey: 1 }); // sessions par grand prix
SessionSchema.index({ circuitKey: 1, type: 1 }); // sessions par type, par circuit