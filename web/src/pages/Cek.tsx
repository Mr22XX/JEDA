import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { analyze, analyzeLink, type Analysis, type LinkParts } from "../engine";
import { SAMPLES, LINK_SAMPLES, type Goto } from "../content";
import Result from "../components/Result";
import MessageBox from "../components/MessageBox";
import LinkBox from "../components/LinkBox";
import LinkPartsCard from "../components/LinkPartsCard";
import FactStrip from "../components/FactStrip";
import ThreeSteps from "../components/Threesteps";

gsap.registerPlugin(useGSAP);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const Lock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

type Mode = "pesan" | "tautan";

function Empty({ mode }: { mode: Mode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (reduced()) return;
    gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.14, ease: "back.out(1.6)", delay: 0.6 });
    gsap.to("[data-breathe]", { scale: 0.9, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.6 });
  }, { scope: ref });
  const points = mode === "pesan"
    ? ["Bagian pesan yang mencurigakan ditandai", "Alasan di balik setiap tanda bahaya", "Langkah yang bisa kamu ambil"]
    : ["Tautan diuraikan: siapa pemilik domain sebenarnya", "Tanda bahaya pada bentuk tautan ditandai", "Langkah yang bisa kamu ambil"];
  return (
    <div ref={ref} className="rounded-3xl border border-line bg-surface/70 p-8 text-center backdrop-blur sm:p-12">
      <div data-breathe className="mx-auto flex w-fit gap-3" aria-hidden>
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">Hasil pemeriksaan muncul di sini</h2>
      <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-muted">
        {points.map((t) => <li key={t} className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full bg-calm" aria-hidden />{t}</li>)}
      </ul>
    </div>
  );
}

export default function Cek({ goto }: { goto: Goto }) {
  const [mode, setMode] = useState<Mode>("pesan");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [checked, setChecked] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [parts, setParts] = useState<LinkParts | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  // Satu urutan masuk saat halaman dibuka.
  useGSAP(() => {
    if (reduced()) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-in=line]", { yPercent: 110, duration: 0.8, stagger: 0.14 })
      .from("[data-in=fade]", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45");
  }, { scope: root });

  function reset() { setResult(null); setParts(null); setError(""); }
  function switchMode(m: Mode) { if (m !== mode) { setMode(m); reset(); } }

  async function run() {
    const input = mode === "pesan" ? text : link;
    if (!input.trim() || busy) return;
    setBusy(true); setError("");
    try {
      if (mode === "pesan") {
        setResult(await analyze(text)); setChecked(text); setParts(null);
      } else {
        const r = await analyzeLink(link);
        if (r.error) { setResult(null); setParts(null); setError(r.error); return; }
        setResult(r); setChecked(r.input); setParts(r.parts);
      }
      requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) return;
        resultRef.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      });
    } catch (e) {
      setResult(null); setParts(null);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memeriksa. Muat ulang halaman lalu coba lagi.");
    } finally { setBusy(false); }
  }

  const samples = mode === "pesan" ? SAMPLES : LINK_SAMPLES;
  const fill = mode === "pesan" ? setText : setLink;

  return (
    <div ref={root}>
      <section data-in="fade" className="mx-auto max-w-6xl px-5 pt-5"><ThreeSteps goto={goto} /></section>
      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-8 lg:grid-cols-2 lg:gap-14 lg:pt-14">
        <section>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">Ragu sama pesan ini?</span></span>
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">Jeda dulu.</span></span>
          </h1>
          <p data-in="fade" className="mt-5 max-w-prose text-lg leading-relaxed text-muted">
            Tempel pesan atau tautan yang terasa janggal. Kami tunjukkan bagian yang mencurigakan beserta alasannya.
          </p>

          <div data-in="fade" role="group" aria-label="Jenis pemeriksaan" className="mt-8 inline-flex rounded-full border border-line bg-surface p-1">
            {([["pesan", "Cek pesan"], ["tautan", "Cek tautan"]] as const).map(([m, l]) => (
              <button key={m} onClick={() => switchMode(m)} aria-pressed={mode === m}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === m ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>

          <div data-in="fade" className="mt-4">
            {mode === "pesan"
              ? <MessageBox value={text} onChange={setText} onSubmit={run} busy={busy} onClear={() => { setText(""); reset(); }} />
              : <LinkBox value={link} onChange={setLink} onSubmit={run} busy={busy} />}
          </div>

          <div data-in="fade" className="mt-4">
            <p className="text-sm text-muted">{mode === "pesan" ? "Coba contoh fiktif:" : "Coba contoh tautan:"}</p>
            <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {samples.map((s) => (
                <button key={s.name} onClick={() => fill(s.text)}
                  className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:border-brand hover:text-brand active:scale-95">{s.name}</button>
              ))}
            </div>
          </div>

          <p data-in="fade" className="mt-6 flex max-w-prose items-start gap-2 text-sm leading-relaxed text-muted">
            <Lock />
            {mode === "pesan"
              ? "Teks kamu diproses di perangkat ini dan tidak dikirim ke server. Jangan masukkan data pribadi asli seperti nomor KTP atau kode OTP."
              : "Kami hanya membaca bentuk tautan di perangkatmu. Situsnya tidak dibuka dan tautannya tidak dikirim ke mana pun."}
          </p>
        </section>

        <section data-in="fade" ref={resultRef} aria-live="polite" className="scroll-mt-20 lg:sticky lg:top-8 lg:self-start">
          {error ? (
            <div role="alert" className="rounded-3xl border border-tinggi bg-tinggi/10 p-5">
              <h2 className="font-bold text-tinggi">Belum bisa diperiksa</h2>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <Result result={result} text={checked} mode={mode} onGoto={goto} />
              {mode === "tautan" && parts && <LinkPartsCard parts={parts} />}
            </div>
          ) : (
            <Empty mode={mode} />
          )}
        </section>
      </main>
      <FactStrip />
    </div>
  );
}