import { useRef, useState } from "react";
import { useI18n } from "../i18n";

type Sample = { name: string; text: string };
type Props = { value: string; onChange: (v: string) => void; onSubmit: () => void; onClear: () => void; busy: boolean; samples: Sample[] };

/** Ukuran tetap seperti MessageBox, supaya tidak ada yang bergeser saat mengetik. */
export default function LinkBox({ value, onChange, onSubmit, onClear, busy, samples }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLInputElement>(null);
  const [hint, setHint] = useState("");

  async function paste() {
    setHint("");
    try { const txt = await navigator.clipboard.readText(); if (txt) onChange(txt.trim()); else setHint(t.box.clipEmpty); }
    catch { setHint(t.box.clipDenied); }
    ref.current?.focus();
  }
  function clear() { setHint(""); onChange(""); onClear(); ref.current?.focus(); }

  return (
    <div className="rounded-3xl border border-line bg-surface shadow-xl shadow-brand/10 transition focus-within:border-transparent focus-within:shadow-2xl focus-within:shadow-brand/25">
      <div className="flex h-14 items-center justify-between gap-3 px-5">
        <label htmlFor="lnk" className="flex items-center gap-2 text-sm font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
          {t.box.linkLabel}
        </label>
        <button type="button" onClick={value ? clear : paste}
          className="min-w-[4.5rem] rounded-full border border-line px-3 py-1 text-center text-sm font-semibold text-muted transition hover:border-brand hover:text-brand">
          {value ? t.box.clear : t.box.paste}
        </button>
      </div>
      <input
        id="lnk" ref={ref} type="text" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        value={value} maxLength={2048} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder={t.box.linkPlaceholder}
        className="block h-12 w-full bg-transparent px-5 text-base outline-none placeholder:text-muted/70"
      />
      <div className="flex items-center gap-2 overflow-x-auto px-5 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-sm text-muted">{t.box.tryExamples}</span>
        {samples.map((s) => (
          <button key={s.name} type="button" onClick={() => onChange(s.text)}
            className="shrink-0 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand/20 active:scale-95">{s.name}</button>
        ))}
      </div>
      <div className="flex h-16 items-center justify-between gap-3 border-t border-line px-5">
        <span aria-live="polite" className="min-w-0 truncate text-sm text-tinggi">{hint}</span>
        <button type="button" onClick={onSubmit} disabled={busy || !value.trim()} aria-busy={busy}
          className="h-11 w-44 shrink-0 rounded-xl bg-brand font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
          {t.box.submitLink}
        </button>
      </div>
    </div>
  );
}