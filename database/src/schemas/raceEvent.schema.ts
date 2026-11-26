import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RaceEvent extends Document {
  @Prop({ required: true, unique: true }) // clé crée quand on insert les données pour éviter les doublons
  eventKey: string;

  @Prop({ required: true })
  sessionKey: number;

  @Prop({ type: String, enum: ['Pit', 'Overtake', 'RaceControl'], required: true })
  type: string;

  @Prop({ required: true })
  date: Date;

  @Prop() // vide pour les événements de piste (drapeau jaune, safety car, vsc)
  driverKey?: string;

  @Prop()
  lapNumber?: number;

  //info par rapport aux pit stopes
  @Prop() // secondes dans la voie des stands
  laneDuration?: number;

  @Prop() // secondes en arrêt, dispo seulement depuis le GP des États-Unis 2024 (so plus vieux ont pas)
  stopDuration?: number;

  // info overtake
  @Prop() // le pilote dépassé (driverKey = celui qui dépasse)
  overtakenDriverKey?: string;

  @Prop() // position du pilote qui dépasse après l'overtake
  newPosition?: number;

  @Prop() // calculé plus tard (à partir de location + virages), pas fourni par l'API
  cornerNumber?: number;

  // info raceControl
  @Prop() // 'Flag', 'SafetyCar', etc. (catégorie de l'API)
  category?: string;

  @Prop() // 'YELLOW', 'RED', 'GREEN', etc.
  flag?: string;

  @Prop()
  message?: string;
}

export const RaceEventSchema = SchemaFactory.createForClass(RaceEvent);

RaceEventSchema.index({ sessionKey: 1, type: 1, date: 1 }); // timeline d'une session, filtrée par type
RaceEventSchema.index({ sessionKey: 1, driverKey: 1 });     // tout ce qui concerne un pilote dans une course