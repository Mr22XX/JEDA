import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Analysis, Finding } from "../engine";
import { LEVELS, LINK_NOTE, label, type Goto } from "../content";
import { recommend } from "../lib/recommend";

gsap.registerPlugin(useGSAP);

function segments(text: string, findings: Finding[]) {
  const sorted = [...findings].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: { t: string; f?: Finding }[] = [];
  let pos = 0;
  for (const f of sorted) {
    if (f.start < pos) continue; // sorotan tumpang tindih dilewati, tetap tampil di daftar alasan
    if (f.start > pos) out.push({ t: text.slice(pos, f.start) });
    out.push({ t: text.slice(f.start, f.end), f });
    pos = f.end;
  }
  if (pos < text.length) out.push({ t: text.slice(pos) });
  return out;
}

export default function Result({ result, text, mode = "pesan", onGoto }: { result: Analysis; text: string; mode?: "pesan" | "tautan"; onGoto?: Goto }) {
  const lv = LEVELS[result.level];
  const rec = recommend(result);
  const ref = useRef<HTMLElement>(null);
  const markerAt = `${(0.03 + 0.94 * Math.min(result.score, 12) / 12) * 100}%`;

  useGSAP(() => {
    gsap.set(".sweep", { backgroundSize: "0% 100%" });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".sweep", { backgroundSize: "100% 100%" });
      gsap.set("[data-marker]", { left: markerAt });
      return;
    }
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from("[data-card]", { y: 24, opacity: 0, duration: 0.5 })
      .fromTo("[data-marker]", { left: "3%" }, { left: markerAt, duration: 1.1, ease: "power2.inOut" }, "-=0.2")
      .from("[data-title]", { y: 14, opacity: 0, duration: 0.45 }, "-=0.7")
      .to(".sweep", { backgroundSize: "100% 100%", duration: 0.5, stagger: 0.2, ease: "power2.out" }, "-=0.1")
      .from("[data-finding]", { x: -18, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.5")
      .from("[data-steps]", { y: 16, opacity: 0, duration: 0.45 }, "-=0.2");
  }, { scope: ref, dependencies: [result] });

  return (
    <article ref={ref} data-card className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-brand/10 sm:p-7">
      <div role="img" aria-label={`Tingkat kewaspadaan: ${lv.title}`}>
        <div className="relative h-3 rounded-full bg-linear-to-r from-calm via-ringan to-tinggi">
          <span data-marker className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface bg-ink shadow-lg" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted"><span>Tidak ada tanda</span><span>Ringan</span><span>Sedang</span><span>Tinggi</span></div>
      </div>

      <h2 data-title className={`mt-5 text-3xl font-extrabold leading-tight ${lv.text}`}>{lv.title}</h2>
      <p data-title className="mt-1 text-muted">{(mode === "tautan" && LINK_NOTE[result.level]) || lv.note}</p>

      {result.findings.length > 0 && (
        <>
          <h3 className="mt-7 text-sm font-semibold text-muted">Bagian yang kami tandai</h3>
          <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm border border-line bg-paper p-4 leading-loose">
            {segments(text, result.findings).map((s, i) =>
              s.f ? <mark key={i} title={label(s.f.tactic)} className="sweep">{s.t}</mark> : <span key={i}>{s.t}</span>,
            )}
          </p>
          <ul className="mt-4">
            {result.findings.map((f) => (
              <li data-finding key={f.rule_id} className="border-t border-line py-3 first:border-t-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="rounded-full bg-sedang/15 px-2.5 py-0.5 text-sm font-semibold text-sedang">{label(f.tactic)}</span>
                  <q className="break-all text-sm text-muted">{f.snippet}</q>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed">{f.why}</p>
              </li>
            ))}
          </ul>
          {result.combos.length > 0 && (
            <p data-finding className="mt-2 rounded-xl bg-tinggi/10 p-3 text-sm font-semibold text-tinggi">Pola gabungan: {result.combos.join(", ")}.</p>
          )}
        </>
      )}

      <div data-steps className="mt-7 rounded-2xl bg-brand/10 p-5">
        <h3 className="font-bold">Yang bisa kamu lakukan</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {lv.steps.map((s) => <li key={s}>{s}</li>)}
        </ul>
        {onGoto && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => onGoto("darurat")} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper">Sudah terlanjur? Buka langkah darurat</button>
            <button onClick={() => onGoto("latihan", rec?.id)} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-left">
              {rec ? `Latih pola ini: ${rec.title}` : "Latih insting dengan simulasi"}
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-muted">{result.disclaimer}</p>
    </article>
  );
}