import { useState } from "react";
import { CHECKED } from "../data/facts";
import { useI18n } from "../i18n";
import ShareCard from "../components/ShareCard";

export default function Darurat() {
  const { t, situations, channels } = useI18n();
  const D = t.darurat;
  const [sid, setSid] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const s = situations.find((x) => x.id === sid);

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopied(false); }
  }

  if (!s) {
    return (
      <main className="mx-auto max-w-4xl px-5 pb-10 pt-8 sm:pt-14">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{D.h1}</h1>
        <p className="mt-4 max-w-prose text-lg text-muted">{D.lead}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {situations.map((x) => (
            <button key={x.id} onClick={() => setSid(x.id)} className="rounded-2xl border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-tinggi">
              <span className="text-lg font-bold leading-snug">{x.title}</span>
              <span className="mt-2 block text-sm text-muted">{x.desc}</span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">{D.disclaimer.replace("{date}", CHECKED)}</p>
      </main>
    );
  }

  const group = (title: string, steps: string[], prefix: string) => (
    <section className="mt-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {steps.map((txt, i) => {
          const k = `${s.id}:${prefix}${i}`;
          return (
            <li key={k}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-4">
                <input type="checkbox" checked={!!checked[k]} onChange={() => setChecked((c) => ({ ...c, [k]: !c[k] }))} className="mt-1 size-5 shrink-0 accent-[var(--brand)]" />
                <span className={`leading-relaxed ${checked[k] ? "text-muted line-through" : ""}`}>{txt}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 pb-10 pt-6 sm:pt-12">
      <button onClick={() => setSid(null)} className="text-sm font-semibold text-muted hover:text-ink">{D.change}</button>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">{s.title}</h1>
      {group(D.now, s.now, "n")}
      {group(D.after, s.after, "a")}

      <section className="mt-8">
        <h2 className="text-xl font-bold">{D.where}</h2>
        <div className="mt-3 grid gap-3">
          {s.channels.map((id) => { const c = channels[id]; return (
            <div key={id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-bold">{c.name}</p>
              <p className="mt-1 text-sm text-muted">{c.use}</p>
              <p className="mt-3 flex flex-wrap gap-2">
                {c.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1 text-sm font-semibold hover:border-brand hover:text-brand">{l.label}</a>)}
              </p>
            </div>
          ); })}
        </div>
        <p className="mt-3 text-xs text-muted">{D.sources.replace("{date}", CHECKED)}</p>
      </section>

      <section className="mt-8 rounded-2xl bg-brand/10 p-5">
        <h2 className="text-xl font-bold">{D.warnTitle}</h2>
        <p className="mt-1 text-sm text-muted">{D.warnHint}</p>
        <p className="mt-3 rounded-xl bg-surface p-4 leading-relaxed">{s.warn}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <ShareCard text={s.warn} />
          <button onClick={() => copy(s.warn)} className="text-sm font-semibold text-brand hover:underline">{copied ? D.copied : D.copy}</button>
        </div>
      </section>
    </main>
  );
}