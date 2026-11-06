import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { analyze, analyzeLink, type Analysis, type LinkParts } from "../engine";
import { SAMPLES, LINK_SAMPLES, type Goto } from "../content";
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
  useGSAP(() => {
    if (reduced()) return;
    gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.14, ease: "back.out(1.6)", delay: 0.6 });
    gsap.to("[data-breathe]", { scale: 0.9, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.6 });
  }, { scope: ref });
  const points = mode === "pesan" ? t.cek.emptyPesan : t.cek.emptyTautan;
  return (
    <div ref={ref} className="rounded-3xl border border-line bg-surface/70 p-8 text-center backdrop-blur sm:p-12">
      <div data-breathe className="mx-auto flex w-fit gap-3" aria-hidden>
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
        <i data-bar className="h-28 w-8 rounded-2xl bg-linear-to-b from-brand to-calm" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">{t.cek.emptyTitle}</h2>
      <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-muted">
        {points.map((p) => <li key={p} className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full bg-calm" aria-hidden />{p}</li>)}
      </ul>
    </div>
  );
}

export default function Cek({ goto }: { goto: Goto }) {
  const { t, linkError } = useI18n();
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
      setError(e instanceof Error ? e.message : "GENERIC");
    } finally { setBusy(false); }
  }

  // Pesan galat disimpan mentah lalu diterjemahkan saat ditampilkan, jadi ikut berganti bila bahasa diganti.
  const errText = !error ? "" : error === "ENGINE_NOT_BUILT" ? t.cek.errNotBuilt : error === "ENGINE_OUTDATED" ? t.cek.errOutdated : error === "GENERIC" ? t.cek.errGeneric : linkError(error);
  const samples = SAMPLES.map((s, i) => ({ name: t.cek.sampleNames[i] ?? s.name, text: s.text }));
  const linkSamples = LINK_SAMPLES.map((s, i) => ({ name: t.cek.linkSampleNames[i] ?? s.name, text: s.text }));

  return (
    <div ref={root}>
      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-6 sm:pt-10 lg:grid-cols-2 lg:gap-14 lg:pt-16">
        <section>
          <h1 className="text-[2.5rem] font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">{t.cek.h1a}</span></span>
            <span className="block overflow-hidden pb-1"><span data-in="line" className="block">{t.cek.h1b}</span></span>
          </h1>
          <p data-in="fade" className="mt-5 max-w-prose text-lg leading-relaxed text-muted">{t.cek.lead}</p>
          <div data-in="fade"><ThreeSteps /></div>

          <div data-in="fade" role="group" aria-label={t.cek.modeGroup} className="mt-7 inline-flex rounded-full border border-line bg-surface p-1">
            {([["pesan", t.cek.modePesan], ["tautan", t.cek.modeTautan]] as const).map(([m, l]) => (
              <button key={m} onClick={() => switchMode(m)} aria-pressed={mode === m}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === m ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>{l}</button>
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

        <section data-in="fade" ref={resultRef} aria-live="polite" className="scroll-mt-20 lg:sticky lg:top-8 lg:self-start">
          {error ? (
            <div role="alert" className="rounded-3xl border border-tinggi bg-tinggi/10 p-5">
              <h2 className="font-bold text-tinggi">{t.cek.errTitle}</h2>
              <p className="mt-1 text-sm">{errText}</p>
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