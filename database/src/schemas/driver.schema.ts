import { Schema, model, InferSchemaType } from 'mongoose';

//les info de saison d'un pilote (numéro, team, couleur de l'équipe)
const DriverSeasonSchema = new Schema(
  {
    year: { type: Number, required: true },
    teamName: { type: String, required: true },
    teamColour: { type: String },      // hex sans le #
    number: { type: Number, required: true },
  },
  { _id: false },
);

export const DriverSchema = new Schema(
  {
    driverKey: { type: String, required: true, unique: true }, //key fait a partir du nom du driver, permets de check des duplicates avant de pull de l'api
    fullName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    acronym: { type: String, required: true },
    pictureUrl: { type: String, required: false }, // au cas ou l'url est vide/missing
    seasons: { type: [DriverSeasonSchema], default: [] },
  },
  { timestamps: true },
);

DriverSchema.index({ 'seasons.year': 1 });


export type Driver = InferSchemaType<typeof DriverSchema>;
export const DriverModel = model('Driver', DriverSchema);