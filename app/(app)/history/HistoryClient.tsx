"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, CheckCircle2, XCircle, History as HistoryIcon } from "lucide-react";

import type { SerializedHistory } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export default function HistoryClient({ history }: { history: SerializedHistory[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test History</h1>
        <p className="text-muted-foreground">Every test you&apos;ve taken, newest first.</p>
      </div>

      {history.length === 0 ? (
        <Card className="items-center border-dashed py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <HistoryIcon className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">No tests taken yet.</p>
          <Button asChild>
            <Link href="/test/word">Take a word test</Link>
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {history.map((h) => {
            const open = openId === h.id;
            return (
              <Card key={h.id} className="gap-0 overflow-hidden py-0">
                <button
                  onClick={() => setOpenId(open ? null : h.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant={h.type === "word" ? "default" : "secondary"}>
                      {h.type === "word" ? "Word" : "Sentence"}
                    </Badge>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{h.unitName}</div>
                      <div className="text-xs text-muted-foreground">
                        {fmtDate(h.createdAt)} · {h.correct}/{h.total} correct · time{" "}
                        {fmtDuration(h.durationSec)} / {fmtDuration(h.timeLimitSec)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-2xl font-bold tabular-nums", scoreColor(h.score))}>
                      {h.score}%
                    </span>
                    <ChevronDown
                      className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
                    />
                  </div>
                </button>

                {open && (
                  <ul className="divide-y border-t">
                    {h.details.map((d, i) => (
                      <li
                        key={i}
                        className={cn("flex flex-col gap-1 px-4 py-3", d.correct ? "bg-success/5" : "bg-destructive/5")}
                      >
                        <div className="text-sm text-muted-foreground">{d.prompt}</div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span className={cn("inline-flex items-center gap-1", d.correct ? "text-success" : "text-destructive")}>
                            {d.correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                            You: <span className="font-semibold">{d.given || "—"}</span>
                          </span>
                          {!d.correct && (
                            <span className="text-muted-foreground">
                              Correct: <span className="font-semibold text-foreground">{d.expected}</span>
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
