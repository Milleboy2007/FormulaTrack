import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema ({ timestamps: true })
export class Lap extends Document {
    @Prop({ required: true})
    dateStart: Date;

    @Prop({ required: true })
    sessionKey: number;

    @Prop({ required: true })
    driverKey: string;

    @Prop({ required: true })
    circuitKey: number;

    @Prop({ required: true })
    lapNumber: number;

    @Prop({ required: false })
    lapTime?: number; // en secondes

    @Prop({ type: [Number], default: undefined })
    sectors?: number[]; // en secondes, 3 secteurs/tour

    @Prop({ default: false })
    isPitOutLap: boolean; //c'est tu le lap après un pit stop

    @Prop({ required: false })
    intermediateSpeed1?: number; // en km/h, vitesse à laquelle un driver sort du secteur 1 (y en à pas pour secteur 3)

    @Prop({ required: false })
    intermediateSpeed2?: number; // en km/h, vitesse à laquelle un driver sort du secteur 2 (y en à pas pour secteur 3)
}

export const LapSchema = SchemaFactory.createForClass(Lap)

LapSchema.index({ sessionKey: 1, driverKey: 1, lapNumber: 1 }, { unique: true }); //check par session, par driver pour un lap
LapSchema.index({ circuitKey: 1, driverKey: 1 }); //par circuit, par driver