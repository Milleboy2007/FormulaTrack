import { Schema, model, InferSchemaType } from 'mongoose';

export const GrandPrixSchema = new Schema(
    {
        meetingKey: { type: Number, required: true, unique: true },
        year: { type: Number, required: true },
        name: { type: String, required: true },
        officialName: { type: String, required: false },
        circuitKey: { type: Number, required: true },
        dateStart: { type: Date, required: true },
        dateEnd: { type: Date, required: true },
        gmtOffset: { type: Number, required: true }, //offset GMT du circuit, pour convertir les horaires de l'api en heure locale du circuit (so GP de singapour affiche l'heure du GP en heure locale de singapour)
        isCanceled: { type: Boolean, default: false },
    },
    { timestamps: true}
)

GrandPrixSchema.index({ year: 1 }); //check les GP par années croissantes
GrandPrixSchema.index({ circuitKey: 1 }); //check les GP par ID de circuits croissants

export type GrandPrix = InferSchemaType<typeof GrandPrixSchema>;
export const GrandPrixModel = model('GrandPrix', GrandPrixSchema);
