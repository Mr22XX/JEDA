import type { Goto } from "../content";

const STEPS = [
  { tab: "cek", title: "Kenali", text: "Cek pesan atau tautan yang janggal", n: "1" },
  { tab: "latihan", title: "Belajar", text: "Latih insting lewat simulasi chat", n: "2" },
  { tab: "darurat", title: "Bertindak", text: "Tahu langkah saat sudah terlanjur", n: "3" },
] as const;

export default function ThreeSteps({ goto }: { goto: Goto }) {
  return (
    <nav aria-label="Tiga fungsi JEDA" className="grid grid-cols-3 gap-2 sm:gap-3">
      {STEPS.map((s) => (
        <button key={s.tab} onClick={() => goto(s.tab)}
          className="rounded-2xl border border-line bg-surface p-3 text-left transition hover:-translate-y-0.5 hover:border-brand sm:p-4">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand" aria-hidden>{s.n}</span>
          <span className="mt-2 block text-base font-extrabold sm:text-lg">{s.title}</span>
          <span className="mt-0.5 block text-xs leading-snug text-muted sm:text-sm">{s.text}</span>
        </button>
      ))}
    </nav>
  );
}