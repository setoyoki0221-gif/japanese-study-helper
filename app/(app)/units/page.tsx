import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Unit } from "@/lib/models";
import { serializeUnit } from "@/lib/serialize";
import UnitsClient from "./UnitsClient";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const session = await getSession();
  await connectDB();
  const units = await Unit.find({ userId: session!.userId }).sort({ createdAt: 1 });
  return <UnitsClient initialUnits={units.map(serializeUnit)} />;
}
