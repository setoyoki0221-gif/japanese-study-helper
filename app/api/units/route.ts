import { connectDB } from "@/lib/db";
import { Unit } from "@/lib/models";
import { requireUser, json, error, handler } from "@/lib/api";
import { serializeUnit } from "@/lib/serialize";

// GET /api/units — list the current user's units (with counts)
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const units = await Unit.find({ userId: user.userId }).sort({ createdAt: 1 });
  return json({ units: units.map(serializeUnit) });
});

// POST /api/units — create a new unit
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { name } = await req.json();
  if (!name || !String(name).trim()) {
    return error("Unit name is required.");
  }
  await connectDB();
  const unit = await Unit.create({
    userId: user.userId,
    name: String(name).trim(),
    words: [],
    sentences: [],
  });
  return json({ unit: serializeUnit(unit) }, 201);
});
