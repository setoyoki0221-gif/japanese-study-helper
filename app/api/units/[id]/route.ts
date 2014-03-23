import { connectDB } from "@/lib/db";
import { Unit } from "@/lib/models";
import { requireUser, json, error, handler } from "@/lib/api";
import { serializeUnit } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/units/:id — full unit with words & sentences
export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  await connectDB();
  const unit = await Unit.findOne({ _id: id, userId: user.userId });
  if (!unit) return error("Unit not found.", 404);
  return json({ unit: serializeUnit(unit) });
});

type IncomingWord = { japanese?: string; reading?: string; meaning?: string };
type IncomingSentence = { japanese?: string; meaning?: string };

// PUT /api/units/:id — update name and/or replace words & sentences
export const PUT = handler(async (req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const body = await req.json();

  await connectDB();
  const unit = await Unit.findOne({ _id: id, userId: user.userId });
  if (!unit) return error("Unit not found.", 404);

  if (typeof body.name === "string") {
    if (!body.name.trim()) return error("Unit name cannot be empty.");
    unit.name = body.name.trim();
  }

  if (Array.isArray(body.words)) {
    const words = (body.words as IncomingWord[])
      .map((w) => ({
        japanese: String(w.japanese ?? "").trim(),
        reading: String(w.reading ?? "").trim(),
        meaning: String(w.meaning ?? "").trim(),
      }))
      .filter((w) => w.japanese && w.meaning);
    unit.words = words;
  }

  if (Array.isArray(body.sentences)) {
    const sentences = (body.sentences as IncomingSentence[])
      .map((s) => ({
        japanese: String(s.japanese ?? "").trim(),
        meaning: String(s.meaning ?? "").trim(),
      }))
      .filter((s) => s.japanese && s.meaning);
    unit.sentences = sentences;
  }

  await unit.save();
  return json({ unit: serializeUnit(unit) });
});

// DELETE /api/units/:id
export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  await connectDB();
  const res = await Unit.deleteOne({ _id: id, userId: user.userId });
  if (res.deletedCount === 0) return error("Unit not found.", 404);
  return json({ ok: true });
});
