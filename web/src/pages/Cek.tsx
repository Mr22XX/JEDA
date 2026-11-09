/**
 * Cek: halaman utama (tab "cek"), tempat pengguna memeriksa pesan atau tautan mencurigakan.
 * - Dua mode: "pesan" (MessageBox + analyze) dan "tautan" (LinkBox + analyzeLink), berganti lewat switchMode.
 * - Kolom kiri: judul, ThreeSteps, pemilih mode, kotak input, catatan privasi.
 * - Kolom kanan: Result (+ LinkPartsCard untuk tautan), pesan galat, atau Empty (demo animasi GSAP saat belum ada hasil).
 * - Pesan galat disimpan mentah dan diterjemahkan saat ditampilkan, supaya ikut berganti bila bahasa diganti.
 * - Semua analisis berjalan di perangkat (modul ../engine). FactStrip ditampilkan di bawah.
 * Props: goto (pindah tab, diteruskan ke Result).
 */
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { analyze, analyzeLink, type Analysis, type LinkParts } from "../engine";
import { SAMPLES, SAMPLES_EN, LINK_SAMPLES, type Goto } from "../content";
import { useI18n } from "../i18n";
import Result from "../components/Result";
import MessageBox from "../components/MessageBox";
import LinkBox from "../components/LinkBox";
import LinkPartsCard from "../components/LinkPartsCard";
import FactStrip from "../components/FactStrip";
import ThreeSteps from "../components/ThreeSteps";

gsap.registerPlugin(useGSAP);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const Lock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

type Mode = "pesan" | "tautan";

function Empty({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const parts = mode === "pesan" ? t.demo.pesan : t.demo.tautan;
  const points = mode === "pesan" ? t.cek.emptyPesan : t.cek.emptyTautan;

  let k = 0;
  const nodes = parts.map((p, i) => {
    if (typeof p === "string") return <span key={i}>{p}</span>;
    const n = k++;
    return (
      <span key={i} className="mark">
        <span data-bg={n} className="mark-bg" aria-hidden />
        <span className="mark-t">{p.m}</span><sup>{n + 1}</sup>
      </span>
    );
  });
  const tags = parts.filter((p): p is { m: string; tag: string } => typeof p !== "string").map((p) => p.tag);

  // Satu putaran: pesan muncul, bagian janggal disorot satu per satu, lalu meter terisi. Hanya transform dan opacity.
  // Berhenti sendiri saat kartu tidak terlihat (termasuk saat tab Cek tersembunyi).
  useGSAP(() => {
    if (reduced() || !ref.current) return;
    const q = gsap.utils.selector(ref);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3, defaults: { ease: "power2.out" } });
    tl.set(q("[data-stage]"), { opacity: 1 })
      .fromTo(q("[data-bubble]"), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
    // Daftar di bawah menyala bergantian mengikuti adegan: sorot, label, lalu meter.
    const row = (i: number, at: string) => tl.fromTo(q(`[data-row="${i}"]`), { opacity: 0.4 }, { opacity: 1, duration: 0.3 }, at);
    tags.forEach((_, i) => {
      tl.fromTo(q(`[data-bg="${i}"]`), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, i === 0 ? ">+0.35" : ">+0.2");
      if (i === 0) row(0, "<");
      tl.fromTo(q(`[data-chip="${i}"]`), { opacity: 0, y: 8, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.35 }, "<+0.25");
      if (i === 0) row(1, "<");
    });
    tl.fromTo(q("[data-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.16, ease: "power1.out" }, ">+0.15");
    row(2, "<");
    tl.fromTo(q("[data-verdict]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, "<")
      .to(q("[data-stage]"), { opacity: 0, duration: 0.45 }, "+=3")
      .to(q("[data-row]"), { opacity: 0.4, duration: 0.45 }, "<");
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(ref.current);
    return () => io.disconnect();
  }, { scope: ref, dependencies: [mode, tags.length], revertOnUpdate: true });

  return (
    <div ref={ref} className="spec-card">
      <div data-stage>
        <p className="spec-label">{t.demo.label}</p>
        <p data-bubble className={`spec-bubble ${mode === "tautan" ? "font-mono text-[0.92rem] break-all" : ""}`}>{nodes}</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={t.cek.emptyTitle}>
          {tags.map((tag, i) => <li key={tag} data-chip={i} className="spec-chip"><b>{i + 1}</b>{tag}</li>)}
        </ul>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex w-28 gap-1 sm:w-36" aria-hidden>
            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><span data-fill className="block h-full origin-left bg-tinggi" /></span>)}
          </div>
          <span data-verdict className="text-sm font-bold text-tinggi">{t.levels.tinggi.title}</span>
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-extrabold tracking-tight sm:text-3xl">{t.cek.emptyTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{mode === "pesan" ? t.demo.leadPesan : t.demo.leadTautan}</p>
      <ol className="mt-5 divide-y divide-line border-y border-line">
        {points.map((p, i) => (
          <li key={p} data-row={i} className="flex items-center gap-4 py-3">
            <span className="flex w-8 shrink-0 items-center" aria-hidden>
              {i === 0 && <span className="block h-3.5 w-7 rounded-sm border-b-2 border-tinggi bg-tinggi/25" />}
              {i === 1 && <b className="grid size-5 place-items-center rounded-full bg-tinggi text-[0.65rem] text-white">1</b>}
              {i === 2 && <span className="flex gap-0.5"><i className="h-1.5 w-2 rounded-full bg-tinggi" /><i className="h-1.5 w-2 rounded-full bg-tinggi" /><i className="h-1.5 w-2 rounded-full bg-tinggi" /></span>}
            </span>
            <span className="text-sm font-semibold leading-snug sm:text-base">{p}</span>
          </li>
        ))}
      </ol>

      <p className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-muted">
        <span>{t.demo.note}</span>
        <span className="font-semibold text-brand">{t.demo.device}</span>
      </p>
    </div>
  );
}

export default function Cek({ goto }: { goto: Goto }) {
  const { t, lang, linkError } = useI18n();
  const [mode, setMode] = useState<Mode>("pesan");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [checked, setChecked] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [parts, setParts] = useState<LinkParts | null>(null);
  const [error, setError] = useState("");
  const [extra, setExtra] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  // Satu urutan masuk saat halaman dibuka.
  useGSAP(() => {
    if (reduced()) return;
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-in=line]", { yPercent: 110, duration: 0.8, stagger: 0.14 })
      .from("[data-in=fade]", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45")
      .from("[data-underline]", { scaleX: 0, duration: 0.7, ease: "power3.inOut" }, "-=0.5");
  }, { scope: root });

  function reset() { setResult(null); setParts(null); setError(""); setExtra(null); }
  function switchMode(m: Mode) { if (m !== mode) { setMode(m); reset(); } }

  async function run() {
    const input = mode === "pesan" ? text : link;
    if (!input.trim() || busy) return;
    setBusy(true); setError(""); setExtra(null);
    try {
      if (mode === "pesan") {
        setResult(await analyze(text)); setChecked(text); setParts(null);
      } else {
        const r = await analyzeLink(link);
        if (r.error) { setResult(null); setParts(null); setError(r.error); return; }
        setResult(r); setChecked(r.input); setParts(r.parts);
        setExtra(r.note === "EXTRACTED" ? r.extra_links : null);
      }
      requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) return;
        resultRef.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      });
    } catch (e) {
      setResult(null); setParts(null);
      setError(e instanceof Error ? e.message : "GENERIC");
    } finally { setBusy(false); }
  }

  // Pesan galat disimpan mentah lalu diterjemahkan saat ditampilkan, jadi ikut berganti bila bahasa diganti.
  const errText = !error ? "" : error === "ENGINE_NOT_BUILT" ? t.cek.errNotBuilt : error === "ENGINE_OUTDATED" ? t.cek.errOutdated : error === "GENERIC" ? t.cek.errGeneric : linkError(error);
  const samples = (lang === "en" ? SAMPLES_EN : SAMPLES).map((s, i) => ({ name: t.cek.sampleNames[i] ?? s.name, text: s.text }));
  const linkSamples = LINK_SAMPLES.map((s, i) => ({ name: t.cek.linkSampleNames[i] ?? s.name, text: s.text }));

  return (
    <div ref={root}>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 sm:gap-10 sm:px-5 sm:pt-10 lg:grid-cols-2 lg:gap-14 lg:pt-16">
        <section className="min-w-0">
          <h1 className="text-[clamp(2rem,9vw,2.5rem)] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">{t.cek.h1a}</span></span>
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block"><span className="mark-line">{t.cek.h1b}<i data-underline aria-hidden /></span></span></span>
          </h1>
          <p data-in="fade" className="mt-4 max-w-prose text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">{t.cek.lead}</p>
          <div data-in="fade"><ThreeSteps /></div>

          <div data-in="fade" role="group" aria-label={t.cek.modeGroup} className="mt-6 flex w-full rounded-full border border-line bg-surface p-1 sm:mt-7 sm:inline-flex sm:w-auto backdrop-blur">
            {([["pesan", t.cek.modePesan], ["tautan", t.cek.modeTautan]] as const).map(([m, l]) => (
              <button key={m} onClick={() => switchMode(m)} aria-pressed={mode === m}
                className={`min-h-10 flex-1 rounded-full px-5 py-2 text-sm font-semibold transition sm:flex-none ${mode === m ? "bg-brand text-on-brand font-bold" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>

          <div data-in="fade" className="mt-4">
            {mode === "pesan"
              ? <MessageBox value={text} onChange={setText} onSubmit={run} onClear={reset} busy={busy} samples={samples} />
              : <LinkBox value={link} onChange={setLink} onSubmit={run} onClear={reset} busy={busy} samples={linkSamples} />}
          </div>

          <p data-in="fade" className="mt-6 flex max-w-prose items-start gap-2 text-sm leading-relaxed text-muted">
            <Lock />
            {mode === "pesan" ? t.cek.privacyPesan : t.cek.privacyTautan}
          </p>
          {mode === "pesan" && t.cek.langNote && <p data-in="fade" className="mt-3 max-w-prose rounded-xl bg-brand/10 p-3 text-sm leading-relaxed">{t.cek.langNote}</p>}
        </section>

        <section data-in="fade" ref={resultRef} aria-live="polite" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          {error ? (
            <div role="alert" className="rounded-3xl border border-tinggi bg-tinggi/10 p-5">
              <h2 className="font-bold text-tinggi">{t.cek.errTitle}</h2>
              <p className="mt-1 text-sm">{errText}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {mode === "tautan" && extra !== null && <p className="rounded-xl bg-brand/10 p-3 text-sm leading-relaxed">{t.cek.linkExtracted(extra)}</p>}
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