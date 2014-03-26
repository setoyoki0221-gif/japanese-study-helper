"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, BookOpen, ArrowRight } from "lucide-react";

import type { SerializedUnit } from "@/lib/serialize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function UnitsClient({ initialUnits }: { initialUnits: SerializedUnit[] }) {
  const [units, setUnits] = useState(initialUnits);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed to create unit.");
      return;
    }
    setUnits((u) => [...u, data.unit]);
    setName("");
  }

  async function deleteUnit(id: string) {
    if (!confirm("Delete this unit and all its words & sentences?")) return;
    const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
    if (res.ok) setUnits((u) => u.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Units</h1>
        <p className="text-muted-foreground">Organize your words and sentences into study units.</p>
      </div>

      <form onSubmit={createUnit} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New unit name (e.g. Lesson 1)"
        />
        <Button type="submit" disabled={busy}>
          <Plus /> Add unit
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {units.length === 0 ? (
        <Card className="items-center border-dashed py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BookOpen className="size-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            No units yet. Create one above to start adding words and sentences.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {units.map((u) => (
            <Card key={u.id} className="gap-0 py-0">
              <div className="flex items-center justify-between gap-3 p-4">
                <Link href={`/units/${u.id}`} className="group min-w-0 flex-1">
                  <div className="truncate font-semibold group-hover:text-primary">{u.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {u.wordCount} words · {u.sentenceCount} sentences
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/units/${u.id}`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUnit(u.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete unit"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <Link
                href={`/units/${u.id}`}
                className="flex items-center justify-between border-t px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                Open unit <ArrowRight className="size-3.5" />
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
