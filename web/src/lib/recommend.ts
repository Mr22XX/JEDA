/**
 * recommend: memilih skenario Latihan yang paling relevan dengan hasil Cek.
 * Taktik yang dilatihkan sebuah skenario = gabungan taktik pada semua pilihannya (lihat data/scenarios.ts).
 * Tiap taktik temuan diberi bobot (weight temuan), lalu skenario dengan total bobot taktik yang sama terbesar menang.
 * Mengembalikan { id, tactics } atau null bila tidak ada yang cocok. Dipakai Result.tsx untuk tombol "Latihan".
 */
import { SCENARIOS } from "../data/scenarios";
import type { Analysis } from "../engine";

/** Taktik yang dilatihkan sebuah skenario = gabungan taktik pada semua pilihannya. */
function taught(id: string): Set<string> {
  const sc = SCENARIOS.find((s) => s.id === id);
  const out = new Set<string>();
  Object.values(sc?.nodes ?? {}).forEach((n) => n.choices?.forEach((c) => c.tactics?.forEach((t) => out.add(t))));
  return out;
}

/** Pilih skenario Latihan yang paling banyak menyentuh taktik yang ditemukan di hasil Cek (diberi bobot temuan). */
export function recommend(r: Analysis): { id: string; tactics: string[] } | null {
  const w: Record<string, number> = {};
  r.findings.forEach((f) => { w[f.tactic] = (w[f.tactic] ?? 0) + f.weight; });
  let best: { id: string; tactics: string[]; score: number } | null = null;
  for (const sc of SCENARIOS) {
    const t = taught(sc.id);
    const shared = Object.keys(w).filter((x) => t.has(x));
    const score = shared.reduce((a, x) => a + w[x], 0);
    if (score > 0 && (!best || score > best.score)) best = { id: sc.id, tactics: shared, score };
  }
  return best && { id: best.id, tactics: best.tactics };
}