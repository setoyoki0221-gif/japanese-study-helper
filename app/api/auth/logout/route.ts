import { clearSession } from "@/lib/auth";
import { json, handler } from "@/lib/api";

export const POST = handler(async () => {
  await clearSession();
  return json({ ok: true });
});
