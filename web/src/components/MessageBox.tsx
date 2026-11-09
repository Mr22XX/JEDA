/**
 * MessageBox: kotak input untuk menempel pesan mencurigakan (tab "cek", mode pesan).
 * Fitur: Tempel/Hapus, penghitung karakter (maks 5000), chip contoh pesan, Ctrl/Cmd+Enter untuk kirim.
 * Semua ukuran tetap; teks panjang digulir di dalam kotak, bukan memperbesar kotaknya.
 */
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
    <div className="rounded-3xl border border-line bg-surface shadow-2xl transition focus-within:border-brand/50 focus-within:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-5">
        <label htmlFor="msg" className="flex min-w-0 items-center gap-2 text-sm font-semibold">
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

      <div>
        <textarea
          id="msg" ref={ref} value={value} maxLength={MAX}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onSubmit(); }}
          placeholder={t.box.placeholder}
          className="block h-40 w-full resize-none overflow-y-auto bg-transparent px-4 pb-3 text-base leading-relaxed outline-none [scrollbar-gutter:stable] placeholder:text-muted/70 sm:h-48 sm:px-5"
        />
      </div>

      {/* Contoh ada di baris sendiri (bukan menimpa kotak teks), supaya tidak menutupi placeholder di layar sempit. */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-sm text-muted">{t.box.tryExamples}</span>
        {samples.map((s) => (
          <button key={s.name} type="button" onClick={() => onChange(s.text)}
            className="chip shrink-0 whitespace-nowrap">{s.name}</button>
        ))}
      </div>

      <div className="flex h-16 items-center justify-between gap-3 border-t border-line px-4 sm:px-5">
        <span aria-live="polite" className={`min-w-0 truncate text-sm tabular-nums ${hint || near ? "text-tinggi" : "text-muted"}`}>
          {hint || (value ? `${value.length}/${MAX}` : "")}
        </span>
        <button type="button" onClick={onSubmit} disabled={busy || !value.trim()} aria-busy={busy} title="Ctrl + Enter"
          className="h-11 w-36 shrink-0 sm:w-44 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-neutral-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
          {t.box.submitMsg}
        </button>
      </div>
    </div>
  );
}