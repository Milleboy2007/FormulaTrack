import { Schema, model, InferSchemaType } from 'mongoose';

const CornerSchema = new Schema(
    {
        cornerNumber: { type: Number, required: true },
        xCoord: { type: Number, required: true },
        yCoord: { type: Number, required: true },
        distanceFromStart: { type: Number, required: true }, //en décimètre, distance du point de départ du circuit comparé au corner
        angle: { type: Number, required: true }, 
        direction: { type: String, enum: ['Left', 'Right'] },
    },
    { _id: false },
)

const LayoutSchema = new Schema(
    {
        year: { type: Number, required: true },
        outline: { // forme/tracé du circuit, valeur prise d'une voiture qui parcour réellement le circuit
            x: { type: [Number], default: [] },
            y: { type: [Number], default: [] },
        },
        corners: { type: [CornerSchema], default: [] },
        infoUrl: { type: String, required: false },
    },
    { _id: false },
)

export const CircuitSchema = new Schema(
    {
        circuitKey: { type: Number, required: true, unique: true },
        shortName: { type: String, required: true },
        location: { type: String, required: true },
        countryName: { type: String, required: true },
        circuitType: { type: String, enum: ['Permanent', 'Temporary - Street', 'Temporary - Road'], required: true }, //enum suit les types de l'api
        pictureUrl: { type: String, required: false }, // au cas ou l'url est vide/missing
        layouts: { type: [LayoutSchema], default: [] }, //liste des layouts qu'un circuit a eu over the years, avec l'année et le tracé du circuit
    },
    { timestamps: true}
)

export type Circuit = InferSchemaType<typeof CircuitSchema>;
export const CircuitModel = model('Circuit', CircuitSchema);