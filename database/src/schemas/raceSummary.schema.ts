import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PodiumEntry {
  @Prop({ required: true })
  position: number;

  @Prop({ required: true })
  driverKey: string;

  @Prop() // secondes (temps total pour le 1er, écart au leader pour les autres)
  gapToLeader?: number;
}
export const PodiumEntrySchema = SchemaFactory.createForClass(PodiumEntry);

@Schema({ _id: false })
export class DriverRaceSummary {
  @Prop({ required: true })
  driverKey: string;

  @Prop() // position de départ (starting_grid), absente si pas dispo
  startPosition?: number;

  @Prop() // absente si DNS/DSQ
  finishPosition?: number;

  @Prop() // finishPosition - startPosition, positif = a gagné des places
  positionsGained?: number;

  @Prop({ default: 0 })
  pitStops: number;

  @Prop({ type: [String], default: [] }) // ordre des pneus, ex: ['MEDIUM', 'HARD']
  tyreSequence: string[];

  @Prop() // secondes, meilleur tour de la course
  bestLapTime?: number;
}
export const DriverRaceSummarySchema = SchemaFactory.createForClass(DriverRaceSummary);

@Schema({ _id: false })
export class KeyMoment {
  @Prop({ type: String, enum: ['Overtake', 'PitStop', 'SafetyCar', 'Retirement'], required: true })
  type: string;

  @Prop({ required: true })
  lapNumber: number;

  @Prop() // le pilote principal (celui qui dépasse, qui abandonne...)
  driverKey?: string;

  @Prop() // le pilote dépassé, si applicable
  otherDriverKey?: string;

  @Prop() // virage où ça s'est joué, dérivé (absent si inconnu)
  cornerNumber?: number;

  @Prop({ type: String, enum: ['OnTrack', 'Pit', 'SafetyCar', 'Penalty', 'Unknown'], default: 'Unknown' }) // cause probable, dérivée (inférence, pas un fait de l'API)
  cause: string;

  @Prop() // lien vers l'événement source (RaceEvent.eventKey)
  eventKey?: string;
}
export const KeyMomentSchema = SchemaFactory.createForClass(KeyMoment);

@Schema({ timestamps: true })
export class RaceSummary extends Document {
  @Prop({ required: true, unique: true }) // une seule fiche par session de course
  sessionKey: number;

  @Prop({ required: true })
  meetingKey: number;

  @Prop({ required: true })
  circuitKey: number;

  @Prop({ required: true })
  year: number;

  @Prop({ type: String, enum: ['Race', 'Sprint'], required: true })
  sessionType: string;

  @Prop({ type: [PodiumEntrySchema], default: [] })
  podium: PodiumEntry[];

  @Prop() // 1er de la grille (starting_grid), absent si pas dispo
  poleDriverKey?: string;

  @Prop() // meilleur tour de la course
  fastestLapDriverKey?: string;

  @Prop() // secondes
  fastestLapTime?: number;

  @Prop({ default: 0 })
  totalOvertakes: number; // dépassements en piste seulement (pit/pénalités filtrés)

  @Prop({ default: 0 })
  totalPitStops: number;

  @Prop({ default: 0 })
  safetyCarPeriods: number; // SC + VSC

  @Prop({ default: 0 })
  retirements: number; // nombre de DNF

  @Prop({ type: [KeyMomentSchema], default: [] })
  keyMoments: KeyMoment[];

  @Prop({ type: [DriverRaceSummarySchema], default: [] })
  drivers: DriverRaceSummary[];

  @Prop({ type: String, enum: ['Partial', 'Complete'], default: 'Partial' }) // 'Partial' tant que les résultats officiels ne sont pas publiés
  status: string;

  @Prop({ default: 1 }) // version de la logique de génération, pour savoir quoi régénérer
  summaryVersion: number;

  @Prop() // moment de la dernière génération
  generatedAt?: Date;
}

export const RaceSummarySchema = SchemaFactory.createForClass(RaceSummary);

RaceSummarySchema.index({ circuitKey: 1, year: 1 });
RaceSummarySchema.index({ meetingKey: 1 });