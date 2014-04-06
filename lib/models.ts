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

/* ------------------------------ Test History ------------------------------ */

export type TestType = "word" | "text";

export interface ITestDetail {
  prompt: string;
  expected: string;
  given: string;
  correct: boolean;
}

export interface ITestHistory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TestType;
  unitId: Types.ObjectId;
  unitName: string;
  total: number;
  correct: number;
  score: number; // percentage 0-100
  timeLimitSec: number;
  durationSec: number;
  wordCount?: number; // only for word tests
  details: ITestDetail[];
  createdAt: Date;
}

const TestDetailSchema = new Schema<ITestDetail>(
  {
    prompt: String,
    expected: String,
    given: String,
    correct: Boolean,
  },
  { _id: false }
);

const TestHistorySchema = new Schema<ITestHistory>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["word", "text"], required: true },
  unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
  unitName: { type: String, required: true },
  total: { type: Number, required: true },
  correct: { type: Number, required: true },
  score: { type: Number, required: true },
  timeLimitSec: { type: Number, required: true },
  durationSec: { type: Number, required: true },
  wordCount: { type: Number },
  details: { type: [TestDetailSchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
});

export const TestHistory =
  models.TestHistory || model<ITestHistory>("TestHistory", TestHistorySchema);

export { mongoose };
