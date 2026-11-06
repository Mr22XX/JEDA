import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Analysis, Finding } from "../engine";
import { LEVELS, type Goto } from "../content";
import { useI18n } from "../i18n";
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

type Props = { result: Analysis; text: string; mode?: "pesan" | "tautan"; onGoto?: Goto };

export default function Result({ result, text, mode = "pesan", onGoto }: Props) {
  const { t, tact, why, combo, scenarios } = useI18n();
  const lv = LEVELS[result.level];
  const lt = t.levels[result.level];
  const rec = recommend(result);
  const recTitle = rec ? scenarios.find((x) => x.id === rec.id)?.title ?? rec.id : "";
  const ref = useRef<HTMLElement>(null);
  const markerAt = `${(0.03 + 0.94 * Math.min(result.score, 12) / 12) * 100}%`;
  const note = mode === "tautan" && result.level === "tidak_ditemukan" ? t.result.linkNote : lt.note;

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
    <article ref={ref} data-card className="overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-brand/10">
      <div className={`h-1.5 ${lv.bar}`} aria-hidden />
      <div className="p-5 sm:p-7">
        <div className="flex items-start gap-3">
          {/* Ikon "i" untuk hasil bersih: JEDA tidak pernah menyatakan sesuatu aman */}
          <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-on-brand ${lv.bar}`} aria-hidden>
            {result.level === "tidak_ditemukan" ? "i" : "!"}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">{mode === "tautan" ? t.result.fromLink : t.result.fromMsg}</p>
            <h2 data-title className={`text-2xl font-extrabold leading-tight ${lv.text}`}>{lt.title}</h2>
          </div>
        </div>
        <p data-title className="mt-3 leading-relaxed text-muted">{note}</p>

        <div role="img" aria-label={t.result.meterAria(lt.title)} className="mt-5">
          <div className="relative h-2 rounded-full bg-linear-to-r from-calm via-ringan to-tinggi">
            <span data-marker className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface bg-ink shadow-lg" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">{t.result.meterLabels.map((m) => <span key={m}>{m}</span>)}</div>
        </div>

        {result.findings.length > 0 && (
          <>
            <h3 className="mt-7 text-sm font-semibold text-muted">{t.result.marked}</h3>
            <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm border border-line bg-paper p-4 leading-loose">
              {segments(text, result.findings).map((s, i) =>
                s.f ? <mark key={i} title={tact(s.f.tactic)} className="sweep">{s.t}</mark> : <span key={i}>{s.t}</span>,
              )}
            </p>
            <ul className="mt-3">
              {result.findings.map((f) => (
                <li data-finding key={f.rule_id} className="border-t border-line py-3 first:border-t-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="rounded-full bg-sedang/15 px-2.5 py-0.5 text-sm font-semibold text-sedang">{tact(f.tactic)}</span>
                    <q className="break-all text-sm text-muted">{f.snippet}</q>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed">{why(f)}</p>
                </li>
              ))}
            </ul>
            {result.combos.length > 0 && (
              <p data-finding className="mt-2 rounded-xl bg-tinggi/10 p-3 text-sm font-semibold text-tinggi">{t.result.combos}: {result.combos.map(combo).join(", ")}.</p>
            )}
          </>
        )}

        <div data-steps className="mt-7 rounded-2xl bg-brand/10 p-5">
          <h3 className="font-bold">{t.result.whatToDo}</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            {lt.steps.map((x) => <li key={x}>{x}</li>)}
          </ul>
          {/* Tautan teks, bukan tombol besar: hanya muncul bila relevan */}
          {onGoto && result.level !== "tidak_ditemukan" && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-brand/20 pt-3 text-sm font-semibold">
              <button onClick={() => onGoto("darurat")} className="text-left text-tinggi hover:underline">{t.result.toEmergency}</button>
              {rec && <button onClick={() => onGoto("latihan", rec.id)} className="text-left text-brand hover:underline">{t.result.toPractice(recTitle)}</button>}
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">{mode === "tautan" ? t.result.disclaimerLink : t.result.disclaimerMsg}</p>
      </div>
    </article>
  );
}