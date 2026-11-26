import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class CarSamples {
  @Prop({ type: [Number], default: [] }) // ms depuis le début du tour (lap.dateStart)
  timeSinceStart: number[];

  @Prop({ type: [Number], default: [] }) // km/h
  speed: number[];

  @Prop({ type: [Number], default: [] }) // % (0-100)
  throttle: number[];

  @Prop({ type: [Boolean], default: [] }) // l'API donne 0 ou 100, faudra convertir en booléen à l'ingestion
  brake: boolean[];

  @Prop({ type: [Number], default: [] }) // 0 = neutre, 1 à 8
  gear: number[];

  @Prop({ type: [Number], default: [] })
  rpm: number[];
  
  //(depuis 2026 c'est du full active aero, pas juste drs faut vérifier si le field retourne anything since 2026)
  @Prop({ type: [Number], default: [] }) // code brut de l'API
  drs: number[];
}
export const CarSamplesSchema = SchemaFactory.createForClass(CarSamples);

@Schema({ _id: false })
export class LocationSamples { //la position d'une auto dans le track
  @Prop({ type: [Number], default: [] }) // ms since le début du tour
  timeSinceStart: number[]; 

  @Prop({ type: [Number], default: [] }) // même unité que l'outline des circuits (décimètres)
  x: number[];

  @Prop({ type: [Number], default: [] })
  y: number[];

  @Prop({ type: [Number], default: [] })
  z: number[];
}
export const LocationSamplesSchema = SchemaFactory.createForClass(LocationSamples);

@Schema({ timestamps: true })
export class LapTelemetry extends Document {
  @Prop({ required: true })
  sessionKey: number;

  @Prop({ required: true })
  driverKey: string;

  @Prop({ required: true })
  lapNumber: number;
  
  // les deux blocs (car et location) viennent d'appels API séparés avec des horodatages différents :
  @Prop({ type: CarSamplesSchema, required: true })
  carData: CarSamples;
  //va falloir comparer le temps/date de locationOnTrack et carData pour find out le data s'est passé où sur le track (L'api les retournes séparés)
  @Prop({ type: LocationSamplesSchema, required: true })
  locationOnTrack: LocationSamples;

  @Prop({ type: [Number], default: undefined }) //distance parcourue dans le tour depuis la ligne de départ (0 = départ, décimètres), même longueur que locationOnTrack.timeSinceStart, même mesure que pour la distance des corners
  distanceFromStart?: number[]; // calculé par le backend 
}

export const LapTelemetrySchema = SchemaFactory.createForClass(LapTelemetry);

LapTelemetrySchema.index({ sessionKey: 1, driverKey: 1, lapNumber: 1 }, { unique: true });