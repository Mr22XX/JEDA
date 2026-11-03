import { useEffect, useRef, useState } from "react";

const MAX = 5000;

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  busy: boolean;
};

export default function MessageBox({ value, onChange, onSubmit, onClear, busy }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState("");

  // Tinggi kotak mengikuti isi, dengan batas atas agar tidak menutupi layar.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`;
  }, [value]);

  async function paste() {
    setHint("");
    try {
      const t = await navigator.clipboard.readText();
      if (t) onChange(t.slice(0, MAX));
      else setHint("Clipboard kosong.");
      ref.current?.focus();
    } catch {
      setHint("Browser tidak mengizinkan akses clipboard. Tempel manual dengan Ctrl + V.");
      ref.current?.focus();
    }
  }

  const nearLimit = value.length > MAX - 300;

  return (
    <div>
      {/* Saat aktif, border hilang dan bayangan sedikit menguat sebagai penanda */}
      <div className="rounded-[1.65rem] border border-line bg-surface shadow-xl shadow-brand/10 transition focus-within:border-transparent focus-within:shadow-2xl focus-within:shadow-brand/25">
        <div>
          <div className="flex items-center justify-between gap-3 px-5 pt-4">
            <label htmlFor="msg" className="flex items-center gap-2 text-sm font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" />
              </svg>
              Pesan yang ingin dicek
            </label>
            <button type="button" onClick={paste}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
              Tempel
            </button>
          </div>

          <textarea
            id="msg" ref={ref} value={value} maxLength={MAX}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onSubmit(); }}
            placeholder="Tempel pesan WhatsApp, SMS, email, atau tautan yang membuatmu ragu…"
            className="block min-h-32 sm:min-h-40 w-full resize-none overflow-y-auto bg-transparent px-5 py-3 text-base leading-relaxed outline-none placeholder:text-muted/70"
          />

          <p aria-live="polite" className={`px-5 text-sm text-tinggi ${hint ? "pb-2" : "hidden"}`}>{hint}</p>

          <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className={nearLimit ? "font-semibold text-tinggi" : ""}>{value.length}/{MAX}</span>
              {value && <button type="button" onClick={onClear} className="rounded px-1 font-semibold hover:text-ink">Hapus</button>}
              <span className="hidden sm:inline">Ctrl + Enter untuk memeriksa</span>
            </div>
            <button type="button" onClick={onSubmit} disabled={busy || !value.trim()}
              className="h-11 w-full rounded-xl bg-brand px-6 font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto">
              {busy ? "Memeriksa…" : "Periksa pesan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}