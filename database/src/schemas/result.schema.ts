import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Result extends Document {
  @Prop({ required: true })
  meetingKey: number;

  @Prop({ required: true })
  sessionKey: number;

  @Prop({ required: true })
  driverKey: string;

  @Prop() // peut être null dans les cas dns/dsq
  position?: number;

  @Prop() // même chose, peut être null dans les cas dns/dsq
  startPosition?: number;

  @Prop({ default: false })
  dnf: boolean;

  @Prop({ default: false })
  dns: boolean;

  @Prop({ default: false })
  dsq: boolean;

  @Prop() // même chose, peut être null dans les cas dns/dsq
  numberOfLaps?: number;

  @Prop() // temps de la course au complet si une race, best lap time si pratique ou qualif
  durationSeconds?: number;

  @Prop({ type: [Number], default: undefined }) // Q1-Q3, seulement pour les qualifying sessions
  qualifyingTimes?: number[];

  @Prop() // secondes
  gapToLeader?: number;

  @Prop() // le N de "+N LAP(S)", absent si 0
  lapsBehind?: number;

  @Prop() // optional, peut être mis plus tard
  points?: number;

  @Prop() // secondes, pris de laps
  fastestLapTime?: number;
}

export const ResultSchema = SchemaFactory.createForClass(Result);

ResultSchema.index({ sessionKey: 1, driverKey: 1 }, { unique: true });
ResultSchema.index({ driverKey: 1 });