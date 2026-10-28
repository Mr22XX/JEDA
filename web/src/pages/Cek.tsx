import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { analyze, type Analysis } from "../engine";
import { SAMPLES, type Tab } from "../content";
import FactStrip from "../components/FactStrip";
import Result from "../components/Result";
import MessageBox from "../components/MessageBox";

gsap.registerPlugin(useGSAP);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const Lock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

function Empty() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.14, ease: "back.out(1.6)", delay: 0.6 });
    gsap.to("[data-breathe]", { scale: 0.9, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.6 });
  }, { scope: ref });
  return (
    <div ref={ref} className="rounded-3xl border border-line bg-surface/70 p-8 text-center backdrop-blur sm:p-12">
      <div data-breathe className="mx-auto flex w-fit gap-3" aria-hidden>
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">Hasil pemeriksaan muncul di sini</h2>
      <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-muted">
        {["Bagian pesan yang mencurigakan ditandai", "Alasan di balik setiap tanda bahaya", "Langkah yang bisa kamu ambil"].map((t) => (
          <li key={t} className="flex items-center gap-2"><span className="size-2 rounded-full bg-calm" aria-hidden />{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Cek({ goto }: { goto: (t: Tab) => void }) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  // Satu urutan masuk saat halaman dibuka.
  useGSAP(() => {
    if (reduced()) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-in=line]", { yPercent: 110, duration: 0.8, stagger: 0.14 }, "-=0.2")
      .from("[data-in=fade]", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45");
  }, { scope: root });

  async function run() {
    if (!text.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const r = await analyze(text);
      setResult(r); setChecked(text);
      requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) return;
        resultRef.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      });
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memeriksa pesan. Muat ulang halaman lalu coba lagi.");
    } finally { setBusy(false); }
  }

  return (
    <div ref={root}>
      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 lg:grid-cols-2 lg:gap-14 lg:pt-16">
        <section>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">Ragu sama pesan ini?</span></span>
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">Jeda dulu.</span></span>
          </h1>
          <p data-in="fade" className="mt-5 max-w-prose text-lg leading-relaxed text-muted">
            Tempel pesan, tawaran, atau tautan yang terasa janggal. Kami tunjukkan bagian yang mencurigakan beserta alasannya.
          </p>

          <div data-in="fade" className="mt-8">
            <MessageBox value={text} onChange={setText} onSubmit={run} busy={busy}
              onClear={() => { setText(""); setResult(null); setError(""); }} />
          </div>

          <div data-in="fade" className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Coba contoh fiktif:</span>
            {SAMPLES.map((s) => (
              <button key={s.name} onClick={() => setText(s.text)}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand hover:text-brand active:translate-y-0">
                {s.name}
              </button>
            ))}
          </div>

          <p data-in="fade" className="mt-6 flex max-w-prose items-start gap-2 text-sm leading-relaxed text-muted">
            <Lock /> Teks kamu diproses di perangkat ini dan tidak dikirim ke server. Jangan masukkan data pribadi asli seperti nomor KTP atau kode OTP.
          </p>
        </section>

        <section data-in="fade" ref={resultRef} aria-live="polite" className="scroll-mt-4 lg:sticky lg:top-8 lg:self-start">
          {error ? (
            <div role="alert" className="rounded-3xl border border-tinggi bg-tinggi/10 p-5">
              <h2 className="font-bold text-tinggi">Pesan belum bisa diperiksa</h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : result ? (
            <Result result={result} text={checked} onGoto={goto} />
          ) : (
            <Empty />
          )}
        </section>
      </main>
      <FactStrip />
    </div>
  );
}