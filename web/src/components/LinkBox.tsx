type Props = { value: string; onChange: (v: string) => void; onSubmit: () => void; busy: boolean };

export default function LinkBox({ value, onChange, onSubmit, busy }: Props) {
  async function paste() {
    try { const t = await navigator.clipboard.readText(); if (t) onChange(t.trim()); } catch { /* izin clipboard ditolak: pengguna bisa menempel manual */ }
  }
  return (
    <div className="rounded-[1.65rem] border border-line bg-surface shadow-xl shadow-brand/10 transition focus-within:border-transparent focus-within:shadow-2xl focus-within:shadow-brand/25">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <label htmlFor="lnk" className="flex items-center gap-2 text-sm font-semibold">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-brand">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
          Tautan yang ingin dicek
        </label>
        <button type="button" onClick={paste} className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand">Tempel</button>
      </div>
      <input
        id="lnk" type="text" inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        value={value} maxLength={2048} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder="https://contoh-tautan.example/halaman"
        className="block w-full bg-transparent px-5 py-4 text-base outline-none placeholder:text-muted/70"
      />
      <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted">Tekan Enter untuk memeriksa</span>
        <button type="button" onClick={onSubmit} disabled={busy || !value.trim()}
          className="h-11 w-full rounded-xl bg-brand px-6 font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto">
          {busy ? "Memeriksa…" : "Periksa tautan"}
        </button>
      </div>
    </div>
  );
}