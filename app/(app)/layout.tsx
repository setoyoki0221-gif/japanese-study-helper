import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Nav from "./Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Nav userName={session.name} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
