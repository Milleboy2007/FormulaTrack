import { Schema, model, InferSchemaType } from 'mongoose';

const weather = new Schema(
    {
        airTempAvg: { type: Number }, //température de l'extérieur
        trackTempAvg: { type: Number }, //température de la piste
        conditions: { type: String,  enum: ['Dry', 'Wet', 'Mixed'] },
    },
    { _id: false}
)

export const SessionSchema = new Schema(
    {
        sessionKey: { type: Number, required: true, unique: true },
        meetingKey: { type: Number, required: true },
        circuitKey: { type: Number, required: true },
        year: { type: Number, required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['Practice', 'Qualifying', 'Sprint Qualifying', 'Sprint', 'Race'],
            required: true,
        },
        startDateTime: { type: Date, required: true },
        endDateTime: { type: Date, required: true },
        isCanceled: { type: Boolean, default: false },
        weather: { type: [weather], default: [] },
    },
    { timestamps: true}
)

SessionSchema.index({ meetingKey: 1 }); //sessions par grand prix
SessionSchema.index({ circuitKey: 1, type: 1 }); //sessions par type, par circuit (ex: toutes les qualifs de tous les circuits)

export type Session = InferSchemaType<typeof SessionSchema>;
export const SessionModel = model('Session', SessionSchema);