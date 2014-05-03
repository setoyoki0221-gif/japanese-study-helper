import Link from "next/link";
import {
  BookOpen,
  PenLine,
  MessagesSquare,
  CheckCircle2,
  TrendingUp,
  Trophy,
  ArrowRight,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Unit, TestHistory } from "@/lib/models";
import { serializeUnit, serializeHistory } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await getSession();
  await connectDB();

  const unitDocs = await Unit.find({ userId: session!.userId }).sort({ updatedAt: -1 });
  const units = unitDocs.map(serializeUnit);
  const totalWords = units.reduce((n, u) => n + u.wordCount, 0);
  const totalSentences = units.reduce((n, u) => n + u.sentenceCount, 0);

  const testDocs = await TestHistory.find({ userId: session!.userId }).sort({ createdAt: -1 });
  const tests = testDocs.map(serializeHistory);
  const avgScore =
    tests.length > 0 ? Math.round(tests.reduce((n, t) => n + t.score, 0) / tests.length) : null;
  const bestScore = tests.length > 0 ? Math.max(...tests.map((t) => t.score)) : null;
  const recent = tests.slice(0, 5);
  const topUnits = units.slice(0, 4);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { label: "Units", value: units.length, icon: BookOpen, tint: "bg-indigo-500/10 text-indigo-500" },
    { label: "Words", value: totalWords, icon: PenLine, tint: "bg-violet-500/10 text-violet-500" },
    { label: "Sentences", value: totalSentences, icon: MessagesSquare, tint: "bg-sky-500/10 text-sky-500" },
    { label: "Tests", value: tests.length, icon: CheckCircle2, tint: "bg-emerald-500/10 text-emerald-500" },
    { label: "Average", value: avgScore === null ? "—" : `${avgScore}%`, icon: TrendingUp, tint: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-8 text-white shadow-lg shadow-indigo-600/20 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100">{today}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              こんにちは、{session!.name} さん
            </h1>
            <p className="mt-2 max-w-md text-indigo-100">
              Ready to study? Pick a unit and start a test — every result is saved to your history.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Link href="/test/word">
                <PenLine /> Word test
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/15 text-white ring-1 ring-inset ring-white/30 backdrop-blur hover:bg-white/25"
            >
              <Link href="/test/text">
                <MessagesSquare /> Sentence test
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="gap-0 py-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="px-5">
              <div className={cn("mb-3 inline-flex size-10 items-center justify-center rounded-xl", s.tint)}>
                <s.icon className="size-5" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Onboarding */}
      {units.length === 0 && (
        <Card className="items-center border-dashed bg-primary/5 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-lg font-semibold">Create your first unit</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            A unit holds your words and sentences. Add some, then come back to take a test.
          </p>
          <Button asChild className="mt-2">
            <Link href="/units">
              Get started <ArrowRight />
            </Link>
          </Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            {tests.length > 0 && (
              <Link href="/history" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            )}
          </div>
          <Card className="gap-0 overflow-hidden py-0">
            {recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No tests yet — your results will appear here.
              </div>
            ) : (
              <ul className="divide-y">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center gap-4 p-4">
                    <Badge variant={t.type === "word" ? "default" : "secondary"}>
                      {t.type === "word" ? "Word" : "Sentence"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{t.unitName}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.correct}/{t.total} correct · {timeAgo(t.createdAt as string)}
                      </div>
                    </div>
                    <span className={cn("text-lg font-bold", scoreColor(t.score))}>{t.score}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {bestScore !== null && (
            <Card className="mt-4 flex-row items-center gap-3 border-warning/30 bg-warning/10 py-4">
              <div className="pl-2">
                <Trophy className="size-6 text-warning" />
              </div>
              <div className="text-sm">
                Your best score is <span className="font-bold">{bestScore}%</span> across{" "}
                {tests.length} test{tests.length === 1 ? "" : "s"}. Keep it up!
              </div>
            </Card>
          )}
        </section>

        {/* Your units */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your units</h2>
            <Link href="/units" className="text-sm font-medium text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {topUnits.length === 0 ? (
              <Card className="py-6 text-center text-sm text-muted-foreground">No units yet.</Card>
            ) : (
              topUnits.map((u) => (
                <Link key={u.id} href={`/units/${u.id}`} className="group block">
                  <Card className="flex-row items-center justify-between py-4 transition group-hover:border-primary/40 group-hover:shadow-sm">
                    <div className="min-w-0 px-5">
                      <div className="truncate font-medium group-hover:text-primary">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.wordCount} words · {u.sentenceCount} sentences
                      </div>
                    </div>
                    <ArrowRight className="mr-5 size-4 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Card>
                </Link>
              ))
            )}
            {units.length > topUnits.length && (
              <Link
                href="/units"
                className="block rounded-xl border border-dashed p-3 text-center text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                +{units.length - topUnits.length} more
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
