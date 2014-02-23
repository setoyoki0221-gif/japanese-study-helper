import mongoose, { Schema, model, models, Types } from "mongoose";

/* ---------------------------------- User ---------------------------------- */

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);

/* ---------------------------------- Unit ---------------------------------- */
// A Unit holds a list of vocabulary words and a list of example sentences.

export interface IWord {
  _id: Types.ObjectId;
  japanese: string;
  reading: string;
  meaning: string;
}

export interface ISentence {
  _id: Types.ObjectId;
  japanese: string;
  meaning: string;
}

export interface IUnit {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  words: IWord[];
  sentences: ISentence[];
  createdAt: Date;
  updatedAt: Date;
}

const WordSchema = new Schema<IWord>({
  japanese: { type: String, required: true, trim: true },
  reading: { type: String, default: "", trim: true },
  meaning: { type: String, required: true, trim: true },
});

const SentenceSchema = new Schema<ISentence>({
  japanese: { type: String, required: true, trim: true },
  meaning: { type: String, required: true, trim: true },
});

const UnitSchema = new Schema<IUnit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    words: { type: [WordSchema], default: [] },
    sentences: { type: [SentenceSchema], default: [] },
  },
  { timestamps: true }
);

export const Unit = models.Unit || model<IUnit>("Unit", UnitSchema);

export { mongoose };
