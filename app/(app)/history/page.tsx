import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { TestHistory } from "@/lib/models";
import { serializeHistory } from "@/lib/serialize";
import HistoryClient from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getSession();
  await connectDB();
  const history = await TestHistory.find({ userId: session!.userId })
    .sort({ createdAt: -1 })
    .limit(200);
  return <HistoryClient history={history.map(serializeHistory)} />;
}
