import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Cek from "./pages/Cek";
import Latihan from "./pages/Latihan";
import Darurat from "./pages/Darurat";
import type { Tab } from "./content";

gsap.registerPlugin(useGSAP);

const TABS: { id: Tab; label: string; aspect: string }[] = [
  { id: "cek", label: "Cek dulu", aspect: "Kenali" },
  { id: "latihan", label: "Latihan", aspect: "Belajar" },
  { id: "darurat", label: "Langkah darurat", aspect: "Bertindak" },
];
const fromHash = (): Tab => TABS.find((t) => t.id === location.hash.slice(1))?.id ?? "cek";

export default function App() {
  const [tab, setTab] = useState<Tab>(fromHash);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = () => setTab(fromHash());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const goto = (t: Tab) => { location.hash = t; scrollTo({ top: 0 }); };

  useGSAP(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-page]", { opacity: 0, y: 14, duration: 0.4, ease: "power2.out" });
  }, { scope: page, dependencies: [tab] });

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <button onClick={() => goto("cek")} className="flex items-center gap-2.5" aria-label="JEDA, ke beranda">
          <span className="flex gap-1" aria-hidden><i className="h-5 w-1.5 rounded-sm bg-brand" /><i className="h-5 w-1.5 rounded-sm bg-brand" /></span>
          <span className="text-lg font-extrabold tracking-tight">JEDA</span>
        </button>
        <nav aria-label="Menu utama" className="hidden gap-1 rounded-full border border-line bg-surface p-1 sm:flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => goto(t.id)} aria-current={tab === t.id ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === t.id ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>{t.label}</button>
          ))}
        </nav>
      </header>

      <div ref={page}><div data-page>
        {tab === "cek" && <Cek goto={goto} />}
        {tab === "latihan" && <Latihan goto={goto} />}
        {tab === "darurat" && <Darurat />}
      </div></div>

      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur sm:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => goto(t.id)} aria-current={tab === t.id ? "page" : undefined}
            className={`flex flex-col items-center py-2.5 text-sm font-semibold ${tab === t.id ? "text-brand" : "text-muted"}`}>
            {t.label}<span className="text-xs font-normal">{t.aspect}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}