import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Corner {
  @Prop({ required: true })
  cornerNumber: number;

  @Prop({ required: true })
  xCoord: number;

  @Prop({ required: true })
  yCoord: number;

  @Prop({ required: true }) // en décimètre, distance du point de départ du circuit comparé au corner
  distanceFromStart: number;

  @Prop({ required: true })
  angle: number;

  @Prop({ type: String, enum: ['Left', 'Right'] })
  direction?: string;
}
export const CornerSchema = SchemaFactory.createForClass(Corner);

@Schema({ _id: false })
export class Outline {
  @Prop({ type: [Number], default: [] })
  x: number[];

  @Prop({ type: [Number], default: [] })
  y: number[];
}
export const OutlineSchema = SchemaFactory.createForClass(Outline);

@Schema({ _id: false })
export class Layout {
  @Prop({ required: true })
  year: number;

  @Prop({ type: OutlineSchema, default: () => ({}) }) // forme/tracé du circuit, pris d'une voiture qui parcourt le circuit frl
  outline: Outline;

  @Prop({ type: [CornerSchema], default: [] })
  corners: Corner[];

  @Prop()
  infoUrl?: string;
}
export const LayoutSchema = SchemaFactory.createForClass(Layout);

@Schema({ timestamps: true })
export class Circuit extends Document {
  @Prop({ required: true, unique: true })
  circuitKey: number;

  @Prop({ required: true })
  shortName: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  countryName: string;

  @Prop({
    type: String,
    enum: ['Permanent', 'Temporary - Street', 'Temporary - Road'], // suit les types de l'api
    required: true,
  })
  circuitType: string;

  @Prop() // au cas où l'url est missing
  pictureUrl?: string;

  @Prop({ type: [LayoutSchema], default: [] }) // layouts du circuit durant les années
  layouts: Layout[];
}

export const CircuitSchema = SchemaFactory.createForClass(Circuit);