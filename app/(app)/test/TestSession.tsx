"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Timer, ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, PenLine, MessagesSquare } from "lucide-react";

import type { SerializedUnit, SerializedHistory } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TestType = "word" | "text";
type Phase = "config" | "running" | "result";
type Question = { id: string; prompt: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestSession({ type, units }: { type: TestType; units: SerializedUnit[] }) {
  const isWord = type === "word";
  const label = isWord ? "Word Test" : "Sentence Test";
  const Icon = isWord ? PenLine : MessagesSquare;

  const usable = units.filter((u) => (isWord ? u.wordCount : u.sentenceCount) > 0);

  const [phase, setPhase] = useState<Phase>("config");
  const [unitId, setUnitId] = useState(usable[0]?.id ?? "");
  const [wordCount, setWordCount] = useState(10);
  const [timeLimitMin, setTimeLimitMin] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [timeLimitSec, setTimeLimitSec] = useState(0);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const [result, setResult] = useState<SerializedHistory | null>(null);

  const selectedUnit = usable.find((u) => u.id === unitId);
  const available = selectedUnit ? (isWord ? selectedUnit.wordCount : selectedUnit.sentenceCount) : 0;

  const finish = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const durationSec = Math.min(
      timeLimitSec,
      Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
    );
    const payload = {
      unitId,
      type,
      timeLimitSec,
      durationSec,
      wordCount: isWord ? questions.length : undefined,
      answers: questions.map((q) => ({ itemId: q.id, given: answers[q.id] ?? "" })),
    };
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to submit test.");
      submittingRef.current = false;
      setPhase("config");
      return;
    }
    setResult(data.result);
    setPhase("result");
  }, [answers, isWord, questions, timeLimitSec, type, unitId]);

  useEffect(() => {
    if (phase !== "running") return;
    if (remaining <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remaining, finish]);

  useEffect(() => {
    if (phase === "running") inputRef.current?.focus();
  }, [phase, current]);

  async function start() {
    setError(null);
    if (!selectedUnit) {
      setError("Please select a unit.");
      return;
    }
    const res = await fetch(`/api/units/${unitId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load unit.");
      return;
    }
    const unit: SerializedUnit = data.unit;

    let qs: Question[];
    if (isWord) {
      const count = Math.min(Math.max(1, wordCount), unit.words.length);
      qs = shuffle(unit.words).slice(0, count).map((w) => ({ id: w.id, prompt: w.meaning }));
    } else {
      qs = shuffle(unit.sentences).map((s) => ({ id: s.id, prompt: s.meaning }));
    }
    if (qs.length === 0) {
      setError("This unit has no items to test.");
      return;
    }

    const limit = Math.max(1, timeLimitMin) * 60;
    submittingRef.current = false;
    setQuestions(qs);
    setAnswers({});
    setCurrent(0);
    setTimeLimitSec(limit);
    setRemaining(limit);
    startRef.current = Date.now();
    setResult(null);
    setPhase("running");
  }

  /* ------------------------------- CONFIG ------------------------------- */
  if (phase === "config") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
            <p className="text-sm text-muted-foreground">
              {isWord
                ? "Type the Japanese for each meaning shown."
                : "Type the Japanese sentence for each meaning shown."}
            </p>
          </div>
        </div>

        {usable.length === 0 ? (
          <Card className="items-center border-dashed py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No units have {isWord ? "words" : "sentences"} yet.
            </p>
            <Button asChild>
              <Link href="/units">Add some first</Link>
            </Button>
          </Card>
        ) : (
          <Card>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={unitId} onValueChange={setUnitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {usable.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({isWord ? u.wordCount : u.sentenceCount}{" "}
                        {isWord ? "words" : "sentences"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isWord && (
                <div className="space-y-1.5">
                  <Label>
                    Word count{" "}
                    <span className="font-normal text-muted-foreground">(max {available})</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={available}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Time limit (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={timeLimitMin}
                  onChange={(e) => setTimeLimitMin(Number(e.target.value))}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button onClick={start} className="w-full" size="lg">
                Start test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /* ------------------------------- RUNNING ------------------------------ */
  if (phase === "running") {
    const q = questions[current];
    const answeredCount = questions.filter((x) => (answers[x.id] ?? "").trim()).length;
    const low = remaining <= 10;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Question {current + 1} of {questions.length} · {answeredCount} answered
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-lg font-bold tabular-nums",
              low ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            )}
          >
            <Timer className="size-4" /> {fmt(remaining)}
          </div>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {isWord ? "Type the Japanese word" : "Type the Japanese sentence"}
            </div>
            <div className="mb-6 text-2xl font-semibold">{q.prompt}</div>
            <Input
              ref={inputRef}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (current < questions.length - 1) setCurrent((c) => c + 1);
                  else finish();
                }
              }}
              placeholder="ここに入力…"
              className="h-12 text-center text-xl"
              autoComplete="off"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ArrowLeft /> Prev
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => c + 1)}>
              Next <ArrowRight />
            </Button>
          ) : (
            <Button onClick={finish} className="bg-success text-white hover:bg-success/90">
              <CheckCircle2 /> Finish &amp; submit
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((x, i) => {
            const answered = (answers[x.id] ?? "").trim().length > 0;
            return (
              <button
                key={x.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "size-8 rounded-md text-sm font-medium transition-colors",
                  i === current
                    ? "bg-primary text-primary-foreground"
                    : answered
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <Button variant="link" onClick={finish} className="px-0 text-muted-foreground hover:text-destructive">
          End test now
        </Button>
      </div>
    );
  }

  /* ------------------------------- RESULT ------------------------------- */
  if (phase === "result" && result) {
    const pass = result.score >= 60;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="items-center text-center">
            <CardDescription>
              {label} · {result.unitName}
            </CardDescription>
            <div
              className={cn(
                "my-1 text-6xl font-extrabold tabular-nums",
                pass ? "text-success" : "text-destructive"
              )}
            >
              {result.score}%
            </div>
            <CardTitle className="font-normal text-muted-foreground">
              {result.correct} / {result.total} correct · finished in {fmt(result.durationSec)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y">
            {result.details.map((d, i) => (
              <li
                key={i}
                className={cn(
                  "flex flex-col gap-1 p-4",
                  d.correct ? "bg-success/5" : "bg-destructive/5"
                )}
              >
                <div className="text-sm text-muted-foreground">{d.prompt}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className={cn("inline-flex items-center gap-1", d.correct ? "text-success" : "text-destructive")}>
                    {d.correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                    Your answer: <span className="font-semibold">{d.given || "—"}</span>
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
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => { setPhase("config"); setResult(null); }}>
            <RotateCcw /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/history">View history</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
