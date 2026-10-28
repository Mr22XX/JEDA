import { STATS } from "../data/facts";

export default function FactStrip() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28 sm:pb-20">
      <h2 className="text-2xl font-extrabold tracking-tight">Kenapa ini penting</h2>
      <p className="mt-1 text-muted">Angka dari laporan masyarakat Indonesia</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-3xl font-extrabold text-brand">{s.value}</p>
            <p className="mt-2 text-sm leading-snug">{s.label}</p>
            <p className="mt-3 text-xs text-muted">
              {s.period} ·{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-ink">{s.src}</a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}