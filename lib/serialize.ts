import type { IUnit, IWord, ISentence, ITestHistory } from "@/lib/models";

export function serializeWord(w: IWord) {
  return {
    id: w._id.toString(),
    japanese: w.japanese,
    reading: w.reading,
    meaning: w.meaning,
  };
}

export function serializeSentence(s: ISentence) {
  return {
    id: s._id.toString(),
    japanese: s.japanese,
    meaning: s.meaning,
  };
}

export function serializeUnit(u: IUnit) {
  return {
    id: u._id.toString(),
    name: u.name,
    words: (u.words || []).map(serializeWord),
    sentences: (u.sentences || []).map(serializeSentence),
    wordCount: u.words?.length ?? 0,
    sentenceCount: u.sentences?.length ?? 0,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function serializeHistory(h: ITestHistory) {
  return {
    id: h._id.toString(),
    type: h.type,
    unitId: h.unitId.toString(),
    unitName: h.unitName,
    total: h.total,
    correct: h.correct,
    score: h.score,
    timeLimitSec: h.timeLimitSec,
    durationSec: h.durationSec,
    wordCount: h.wordCount,
    details: (h.details || []).map((d) => ({
      prompt: d.prompt,
      expected: d.expected,
      given: d.given,
      correct: d.correct,
    })),
    createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : String(h.createdAt),
  };
}

export type SerializedUnit = ReturnType<typeof serializeUnit>;
export type SerializedWord = ReturnType<typeof serializeWord>;
export type SerializedSentence = ReturnType<typeof serializeSentence>;
export type SerializedHistory = ReturnType<typeof serializeHistory>;
