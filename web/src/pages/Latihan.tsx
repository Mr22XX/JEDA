import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SCENARIOS, type Choice } from "../data/scenarios";
import { label, type Tab } from "../content";

gsap.registerPlugin(useGSAP);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "jeda:selesai";
const load = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (v: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* penyimpanan dimatikan: abaikan */ } };

type Item = { me: boolean; text: string };

export default function Latihan({ goto }: { goto: (t: Tab) => void }) {
  const [sid, setSid] = useState<string | null>(null);
  const [nodeId, setNodeId] = useState("");
  const [log, setLog] = useState<Item[]>([]);
  const [fb, setFb] = useState<Choice | null>(null);
  const [stats, setStats] = useState({ good: 0, total: 0, tactics: [] as string[] });
  const [done, setDone] = useState<string[]>(load);
  const [run, setRun] = useState(0);
  const chat = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const seen = useRef(0);

  const s = SCENARIOS.find((x) => x.id === sid);
  const node = s && nodeId ? s.nodes[nodeId] : null;

  function start(id: string) {
    const sc = SCENARIOS.find((x) => x.id === id)!;
    seen.current = 0;
    setSid(id); setNodeId(sc.start); setFb(null); setRun((r) => r + 1);
    setLog(sc.nodes[sc.start].messages.map((text) => ({ me: false, text })));
    setStats({ good: 0, total: 0, tactics: [] });
  }
  function pick(c: Choice) {
    setLog((l) => [...l, { me: true, text: c.text }]);
    setFb(c);
    setStats((st) => ({ good: st.good + (c.good ? 1 : 0), total: st.total + 1, tactics: [...new Set([...st.tactics, ...(c.tactics ?? [])])] }));
  }
  function next() {
    if (!fb || !s) return;
    const n = s.nodes[fb.next];
    setLog((l) => [...l, ...n.messages.map((text) => ({ me: false, text }))]);
    setNodeId(fb.next); setFb(null);
    if (n.end) { const d = [...new Set([...done, s.id])]; setDone(d); save(d); }
  }

  // Pesan baru muncul bergantian seperti sedang diketik.
  useGSAP(() => {
    const kids = Array.from(chat.current?.children ?? []).slice(seen.current);
    seen.current = log.length;
    if (!kids.length || reduced()) return;
    gsap.from(kids, { y: 14, opacity: 0, duration: 0.4, stagger: 0.45, ease: "power2.out" });
  }, { dependencies: [log.length, run] });

  useEffect(() => {
    if (sid) bottom.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
  }, [log.length, fb, sid]);

  if (!s || !node) {
    return (
      <main className="mx-auto max-w-4xl px-5 pb-28 pt-10 sm:pt-14">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Latih insting kamu.</h1>
        <p className="mt-4 max-w-prose text-lg text-muted">Pilih satu situasi, lalu tentukan balasanmu. Setiap pilihan langsung diberi penjelasan taktik apa yang dipakai penipu. Semua nama dan tautan di simulasi ini fiktif.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {SCENARIOS.map((sc) => (
            <button key={sc.id} onClick={() => start(sc.id)} className="flex flex-col rounded-2xl border border-line bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-brand">
              {sc.audience && <span className="mb-2 w-fit rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">{sc.audience}</span>}
              <span className="text-lg font-bold leading-snug">{sc.title}</span>
              <span className="mt-2 text-sm text-muted">{sc.persona}</span>
              <span className="mt-4 text-sm font-semibold text-brand">{done.includes(sc.id) ? "Selesai. Main lagi" : "Mulai simulasi"}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const end = node.end;
  return (
    <main className="mx-auto max-w-2xl px-5 pb-28 pt-8 sm:pt-12">
      <button onClick={() => { setSid(null); setNodeId(""); }} className="text-sm font-semibold text-muted hover:text-ink">← Semua skenario</button>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">{s.title}</h1>
      <p className="mt-2 rounded-xl bg-brand/10 p-3 text-sm">
        {s.fact} <a href={s.factUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">Sumber</a>
      </p>

      <div ref={chat} className="mt-6 space-y-3" aria-live="polite">
        {log.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 leading-relaxed ${m.me ? "ml-auto rounded-tr-sm bg-brand text-on-brand" : "rounded-tl-sm border border-line bg-surface"}`}>{m.text}</div>
        ))}
      </div>

      {fb && (
        <div role="status" className={`mt-5 rounded-2xl border p-5 ${fb.good ? "border-calm bg-calm/10" : "border-tinggi bg-tinggi/10"}`}>
          <h2 className={`font-bold ${fb.good ? "text-calm" : "text-tinggi"}`}>{fb.good ? "Pilihan yang tepat" : "Hati-hati, ini jebakan"}</h2>
          <p className="mt-1 text-sm leading-relaxed">{fb.feedback}</p>
          {fb.tactics && <p className="mt-3 flex flex-wrap gap-2">{fb.tactics.map((t) => <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-sm font-semibold">{label(t)}</span>)}</p>}
          <button onClick={next} className="mt-4 h-11 rounded-xl bg-ink px-5 font-semibold text-paper">Lanjut</button>
        </div>
      )}

      {!fb && node.choices && (
        <div className="mt-5 grid gap-2">
          <p className="text-sm font-semibold text-muted">Balasanmu:</p>
          {node.choices.map((c) => (
            <button key={c.text} onClick={() => pick(c)} className="rounded-xl border border-line bg-surface px-4 py-3 text-left transition hover:border-brand hover:bg-brand/5 active:scale-[.99]">{c.text}</button>
          ))}
        </div>
      )}

      {!fb && end && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className={`text-2xl font-extrabold ${end.good ? "text-calm" : "text-tinggi"}`}>{end.title}</h2>
          <p className="mt-2 leading-relaxed">{end.summary}</p>
          <p className="mt-4 font-semibold">{stats.good} dari {stats.total} pilihan tepat</p>
          {stats.tactics.length > 0 && <>
            <p className="mt-3 text-sm text-muted">Taktik yang muncul di simulasi ini:</p>
            <p className="mt-1 flex flex-wrap gap-2">{stats.tactics.map((t) => <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-sm font-semibold">{label(t)}</span>)}</p>
          </>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => start(s.id)} className="h-11 rounded-xl bg-brand px-5 font-semibold text-on-brand">Ulangi</button>
            <button onClick={() => setSid(null)} className="h-11 rounded-xl border border-line px-5 font-semibold">Skenario lain</button>
            <button onClick={() => goto("cek")} className="h-11 rounded-xl border border-line px-5 font-semibold">Cek pesan sendiri</button>
            {!end.good && <button onClick={() => goto("darurat")} className="h-11 rounded-xl border border-tinggi px-5 font-semibold text-tinggi">Langkah darurat</button>}
          </div>
        </div>
      )}
      <div ref={bottom} />
    </main>
  );
}