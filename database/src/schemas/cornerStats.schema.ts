import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CornerStats extends Document {
  @Prop({ required: true })
  sessionKey: number;

  @Prop({ required: true })
  driverKey: string;

  @Prop({ required: true })
  lapNumber: number;

  @Prop({ required: true }) // circuit de la session, pour les requêtes "par piste"
  circuitKey: number;

  @Prop({ required: true }) // numéro du corner (cornerNumber dans circuits.layouts)
  cornerNumber: number;

  // zone du/des corners analysée (pour expliquer/recalculer les valeurs) ---
  @Prop() // décimètres depuis la ligne de départ
  zoneStart?: number;

  @Prop() // décimètres depuis la ligne de départ
  zoneEnd?: number;

  //freinage
  @Prop() // premier spot ou brake = true dans la zone; absent si pas de freinage (virage pris at full speed)
  brakeStartDistance?: number; //décimètres

  @Prop() // nb de spots consécutifs ou brake = true (~0,27 s chacun)
  brakeSamples?: number;

  @Prop() // ms, approximatif (brakeSamples × intervalle entre spots)
  brakeDurationMs?: number;

  // vitesse
  @Prop() // km/h, vitesse à l'entrée de la zone
  entrySpeed?: number;

  @Prop() // km/h, vitesse minimale dans la zone
  minSpeed?: number;

  @Prop() // km/h, vitesse à la sortie de la zone
  exitSpeed?: number;

  // accélération
  @Prop() // décimètres, première fois ou le driver est on the gas après le point le plus lent
  throttlePickupDistance?: number;

  // trajectoire (à voir si on le met frl, voir note) ---
  @Prop() // mètres, écart de coté par rapport à la ligne centrale; positif = gauche
  lineOffset?: number;

  // contexte pour filtrer
  @Prop({ default: false }) // pit out lap, safety car, etc. (calculé avec de laps + events)
  isCleanLap: boolean; //clean si lap normal

  @Prop() // version de l'algorithme, pour savoir quoi recalculer si la logique change
  analysisVersion?: number;
}

export const CornerStatsSchema = SchemaFactory.createForClass(CornerStats);

CornerStatsSchema.index(
  { sessionKey: 1, driverKey: 1, lapNumber: 1, cornerNumber: 1 },
  { unique: true },
);
CornerStatsSchema.index({ circuitKey: 1, cornerNumber: 1, driverKey: 1 }); // comparaisons par piste/virage
CornerStatsSchema.index({ sessionKey: 1, cornerNumber: 1 });               // tous les pilotes à un virage donné