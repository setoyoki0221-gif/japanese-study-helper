// Lenient answer grading for typed Japanese answers.

// Normalize a string for comparison: trim, lowercase ASCII, drop all
// whitespace (incl. full-width space) and common punctuation. This makes
// typed answers tolerant of spacing and punctuation differences.
export function normalize(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[\s　]+/g, "") // ascii + full-width whitespace
    .replace(/[。、，．・！？!?,.;；:：「」『』（）()【】\-―ー~〜]/g, (m) =>
      m === "ー" ? "ー" : "" // keep long-vowel mark (ー) which is meaningful
    );
}

// Split a meaning/answer field into acceptable alternatives.
// Accepts separators: comma, slash, semicolon, Japanese comma.
function alternatives(value: string): string[] {
  return value
    .split(/[\/,;、]/)
    .map((s) => normalize(s))
    .filter(Boolean);
}

// Returns true if `given` matches any of the acceptable answers.
// `accepted` may contain multiple fields (e.g. japanese + reading), each of
// which may itself list comma-separated alternatives.
export function isCorrect(given: string, accepted: string[]): boolean {
  const g = normalize(given);
  if (!g) return false;
  const pool = accepted.flatMap((a) => alternatives(a));
  return pool.includes(g);
}
