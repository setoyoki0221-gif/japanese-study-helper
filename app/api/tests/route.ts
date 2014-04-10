import { connectDB } from "@/lib/db";
import { Unit, TestHistory, type ITestDetail } from "@/lib/models";
import { requireUser, json, error, handler } from "@/lib/api";
import { serializeHistory } from "@/lib/serialize";
import { isCorrect } from "@/lib/grade";

// GET /api/tests — current user's test history, newest first
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const history = await TestHistory.find({ userId: user.userId })
    .sort({ createdAt: -1 })
    .limit(200);
  return json({ history: history.map(serializeHistory) });
});

type Answer = { itemId: string; given: string };

// POST /api/tests — submit a finished test; the server re-grades authoritatively
// using the unit's stored answers, then records the result in history.
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { unitId, type, timeLimitSec, durationSec, wordCount } = body;
  const answers: Answer[] = Array.isArray(body.answers) ? body.answers : [];

  if (type !== "word" && type !== "text") return error("Invalid test type.");
  if (!unitId) return error("unitId is required.");

  await connectDB();
  const unit = await Unit.findOne({ _id: unitId, userId: user.userId });
  if (!unit) return error("Unit not found.", 404);

  const givenMap = new Map<string, string>();
  for (const a of answers) givenMap.set(String(a.itemId), String(a.given ?? ""));

  const details: ITestDetail[] = [];

  if (type === "word") {
    for (const w of unit.words) {
      const id = w._id.toString();
      if (!givenMap.has(id)) continue; // only items that were part of this test
      const given = givenMap.get(id) ?? "";
      const accepted = [w.japanese, w.reading].filter(Boolean);
      details.push({
        prompt: w.meaning,
        expected: w.reading ? `${w.japanese}（${w.reading}）` : w.japanese,
        given,
        correct: isCorrect(given, accepted),
      });
    }
  } else {
    for (const s of unit.sentences) {
      const id = s._id.toString();
      if (!givenMap.has(id)) continue;
      const given = givenMap.get(id) ?? "";
      details.push({
        prompt: s.meaning,
        expected: s.japanese,
        given,
        correct: isCorrect(given, [s.japanese]),
      });
    }
  }

  if (details.length === 0) return error("No answers were submitted.");

  const total = details.length;
  const correct = details.filter((d) => d.correct).length;
  const score = Math.round((correct / total) * 100);

  const record = await TestHistory.create({
    userId: user.userId,
    type,
    unitId: unit._id,
    unitName: unit.name,
    total,
    correct,
    score,
    timeLimitSec: Number(timeLimitSec) || 0,
    durationSec: Number(durationSec) || 0,
    wordCount: type === "word" ? Number(wordCount) || total : undefined,
    details,
  });

  return json({ result: serializeHistory(record) }, 201);
});
