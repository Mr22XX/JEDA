import { useRef, useState } from "react";
import { useI18n } from "../i18n";

const MAX = 5000;
type Sample = { name: string; text: string };
type Props = { value: string; onChange: (v: string) => void; onSubmit: () => void; onClear: () => void; busy: boolean; samples: Sample[] };

/**
 * Semua ukuran di sini tetap (tinggi kotak, lebar tombol, slot penghitung) supaya tampilan tidak bergeser
 * saat teks bertambah. Teks panjang digulir di dalam kotak, bukan memperbesar kotaknya.
 */
export default function MessageBox({ value, onChange, onSubmit, onClear, busy, samples }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState("");

  async function paste() {
    setHint("");
    try {
      const txt = await navigator.clipboard.readText();
      if (txt) onChange(txt.slice(0, MAX)); else setHint(t.box.clipEmpty);
    } catch { setHint(t.box.clipDenied); }
    ref.current?.focus();
  }
  function clear() { setHint(""); onChange(""); onClear(); ref.current?.focus(); }

  const near = value.length > MAX - 300;
  return (
    <div className="rounded-3xl border-2 border-edge bg-surface shadow-xl shadow-brand/10 transition focus-within:border-transparent focus-within:shadow-2xl focus-within:shadow-brand/25">
      <div className="flex h-14 items-center justify-between gap-3 px-5">
        <label htmlFor="msg" className="flex items-center gap-2 text-sm font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" />
          </svg>
          {t.box.msgLabel}
        </label>
        <button type="button" onClick={value ? clear : paste}
          className="btn-2 btn-sm min-w-[5rem]">
          {value ? t.box.clear : t.box.paste}
        </button>
      </div>

      <div className="relative">
        <textarea
          id="msg" ref={ref} value={value} maxLength={MAX}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onSubmit(); }}
          placeholder={t.box.placeholder}
          className="block h-44 w-full resize-none overflow-y-auto bg-transparent px-5 pb-3 text-base leading-relaxed outline-none [scrollbar-gutter:stable] placeholder:text-muted/70 sm:h-52"
        />
        {!value && (
          <div className="absolute inset-x-4 bottom-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 text-sm text-muted">{t.box.tryExamples}</span>
            {samples.map((s) => (
              <button key={s.name} type="button" onClick={() => onChange(s.text)}
                className="chip shrink-0">{s.name}</button>
            ))}
          </div>
        )}
      </div>

      <div className="flex h-16 items-center justify-between gap-3 border-t border-line px-5">
        <span aria-live="polite" className={`min-w-0 truncate text-sm tabular-nums ${hint || near ? "text-tinggi" : "text-muted"}`}>
          {hint || (value ? `${value.length}/${MAX}` : "")}
        </span>
        <button type="button" onClick={onSubmit} disabled={busy || !value.trim()} aria-busy={busy} title="Ctrl + Enter"
          className="h-11 w-44 shrink-0 rounded-xl bg-brand font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
          {t.box.submitMsg}
        </button>
      </div>
    </div>
  );
}