import { Schema, model, InferSchemaType } from 'mongoose';

//en plain mongoose vu que j'ai pas le projet de la back-end yet
export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    favoriteDriverKeys: { type: [String], default: [] },
    favoriteCircuitKeys: { type: [Number], default: [] },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema>;
export const UserModel = model('User', UserSchema);