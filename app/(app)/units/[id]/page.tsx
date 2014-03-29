import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Unit } from "@/lib/models";
import { serializeUnit } from "@/lib/serialize";
import UnitEditor from "./UnitEditor";

export const dynamic = "force-dynamic";

export default async function UnitEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  await connectDB();
  const unit = await Unit.findOne({ _id: id, userId: session!.userId }).catch(() => null);
  if (!unit) notFound();
  return <UnitEditor unit={serializeUnit(unit)} />;
}
