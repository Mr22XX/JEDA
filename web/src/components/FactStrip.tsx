/**
 * FactStrip: deretan kartu statistik penipuan (jumlah laporan, kerugian, dana terblokir, dll.).
 * Data dari useI18n().stats, jadi ikut bahasa aktif. Setiap kartu menautkan ke sumber aslinya.
 * Sumber data: data/facts.ts (STATS), terjemahan di data/en.ts (STATS_EN).
 */
import { useI18n } from "../i18n";

export default function FactStrip() {
  const { t, stats } = useI18n();
  return (
    <section className="mx-auto max-w-6xl px-5 pb-12">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.facts.title}</h2>
      <p className="mt-1 text-muted">{t.facts.sub}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.url + s.value} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/40">
            <p className="text-3xl font-extrabold text-brand">{s.value}</p>
            <p className="mt-2 text-sm leading-snug text-ink">{s.label}</p>
            <p className="mt-3 text-xs text-muted">
              {s.period} ·{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="lnk no-underline text-brand hover:opacity-80">{s.src}</a>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}