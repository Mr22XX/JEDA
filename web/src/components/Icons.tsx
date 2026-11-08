/** Ikon panah dan tautan keluar. Warna mengikuti teks (currentColor), jadi otomatis ikut mode gelap. */
type Dir = "left" | "right";

export function Arrow({ dir, size = 18 }: { dir: Dir; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`arrow arrow-${dir === "left" ? "l" : "r"} shrink-0`}>
      {dir === "right" ? <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></> : <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>}
    </svg>
  );
}

export function External({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      <path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
