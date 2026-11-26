import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// infos de saison d'un pilote (numéro, team, couleur de l'équipe)
@Schema({ _id: false })
export class DriverSeason {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  teamName: string;

  @Prop() // hex sans #
  teamColour?: string;

  @Prop({ required: true })
  number: number;
}
export const DriverSeasonSchema = SchemaFactory.createForClass(DriverSeason);

@Schema({ timestamps: true })
export class Driver extends Document {
  @Prop({ required: true, unique: true }) // key faite avec nom du driver, permet de checker les duplicates avant de pull de l'api
  driverKey: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: false }) //au cas où y a juste le fullName
  firstName?: string;

  @Prop({ required: false }) //au cas où y a juste le fullName
  lastName?: string;

  @Prop({ required: true })
  acronym: string;

  @Prop() // au cas où l'url est vide/missing
  pictureUrl?: string;

  @Prop({ type: [DriverSeasonSchema], default: [] })
  seasons: DriverSeason[];
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

DriverSchema.index({ 'seasons.year': 1 });