"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Check } from "lucide-react";

import type { SerializedUnit } from "@/lib/serialize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WordRow = { japanese: string; reading: string; meaning: string };
type SentenceRow = { japanese: string; meaning: string };

export default function UnitEditor({ unit }: { unit: SerializedUnit }) {
  const [name, setName] = useState(unit.name);
  const [words, setWords] = useState<WordRow[]>(
    unit.words.map((w) => ({ japanese: w.japanese, reading: w.reading, meaning: w.meaning }))
  );
  const [sentences, setSentences] = useState<SentenceRow[]>(
    unit.sentences.map((s) => ({ japanese: s.japanese, meaning: s.meaning }))
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function updateWord(i: number, field: keyof WordRow, value: string) {
    setWords((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function updateSentence(i: number, field: keyof SentenceRow, value: string) {
    setSentences((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    const res = await fetch(`/api/units/${unit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, words, sentences }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Failed to save.");
      return;
    }
    setWords(data.unit.words.map((w: WordRow) => ({ ...w })));
    setSentences(data.unit.sentences.map((s: SentenceRow) => ({ ...s })));
    setStatus("saved");
    setMessage("All changes saved.");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1 text-muted-foreground">
            <Link href="/units">
              <ArrowLeft /> Back to units
            </Link>
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-auto border-transparent bg-transparent px-1 py-0 text-2xl font-bold shadow-none hover:border-input focus-visible:border-ring"
          />
        </div>
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? (
            <Loader2 className="animate-spin" />
          ) : status === "saved" ? (
            <Check />
          ) : (
            <Save />
          )}
          {status === "saving" ? "Saving…" : "Save"}
        </Button>
      </div>
      {message && (
        <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-success"}>
          {message}
        </p>
      )}

      {/* Words */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            Words <span className="ml-1 text-sm font-normal text-muted-foreground">({words.length})</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWords((r) => [...r, { japanese: "", reading: "", meaning: "" }])}
          >
            <Plus /> Add word
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 text-xs font-medium uppercase text-muted-foreground sm:grid">
            <span>Japanese</span>
            <span>Reading (kana)</span>
            <span>Meaning</span>
            <span className="w-9" />
          </div>
          {words.length === 0 && (
            <p className="text-sm text-muted-foreground">No words yet. Add some above.</p>
          )}
          {words.map((w, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Input value={w.japanese} onChange={(e) => updateWord(i, "japanese", e.target.value)} placeholder="日本語" />
              <Input value={w.reading} onChange={(e) => updateWord(i, "reading", e.target.value)} placeholder="にほんご" />
              <Input value={w.meaning} onChange={(e) => updateWord(i, "meaning", e.target.value)} placeholder="Japanese language" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWords((r) => r.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove word"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sentences */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            Sentences{" "}
            <span className="ml-1 text-sm font-normal text-muted-foreground">({sentences.length})</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSentences((r) => [...r, { japanese: "", meaning: "" }])}
          >
            <Plus /> Add sentence
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs font-medium uppercase text-muted-foreground sm:grid">
            <span>Japanese sentence</span>
            <span>Meaning / translation</span>
            <span className="w-9" />
          </div>
          {sentences.length === 0 && (
            <p className="text-sm text-muted-foreground">No sentences yet. Add some above.</p>
          )}
          {sentences.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input value={s.japanese} onChange={(e) => updateSentence(i, "japanese", e.target.value)} placeholder="これはペンです。" />
              <Input value={s.meaning} onChange={(e) => updateSentence(i, "meaning", e.target.value)} placeholder="This is a pen." />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSentences((r) => r.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove sentence"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tip: empty rows (missing Japanese or meaning) are dropped automatically when you save.
      </p>
    </div>
  );
}
