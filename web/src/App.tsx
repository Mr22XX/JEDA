import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Cek from "./pages/Cek";
import Latihan from "./pages/Latihan";
import Darurat from "./pages/Darurat";
import Tentang from "./pages/Tentang";
import Logo from "./components/Logo";
import type { Goto, Tab } from "./content";

gsap.registerPlugin(useGSAP);

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const TABS: { id: Tab; label: string; short: string; icon: ReactNode }[] = [
  { id: "cek", label: "Cek dulu", short: "Cek", icon: <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon> },
  { id: "latihan", label: "Latihan", short: "Latihan", icon: <Icon><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" /></Icon> },
  { id: "darurat", label: "Langkah darurat", short: "Darurat", icon: <Icon><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.01" /></Icon> },
  { id: "tentang", label: "Tentang", short: "Tentang", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Icon> },
];

// Alamat: #tab atau #tab/argumen, misalnya #latihan/loker. Penghitung n membuat tujuan yang sama bisa dibuka ulang.
let counter = 0;
function read() {
  const [t, arg] = location.hash.slice(1).split("/");
  return { tab: TABS.find((x) => x.id === t)?.id ?? ("cek" as Tab), arg, n: ++counter };
}

export default function App() {
  const [nav, setNav] = useState(read);
  const tab = nav.tab;
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = () => setNav(read());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const goto: Goto = (t, arg) => {
    const h = arg ? `${t}/${arg}` : t;
    if (location.hash.slice(1) === h) setNav(read()); else location.hash = h;
    scrollTo({ top: 0 });
  };

  useGSAP(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-page]:not([hidden])", { opacity: 0, y: 14, duration: 0.4, ease: "power2.out" });
  }, { scope: page, dependencies: [tab] });

  const navBtn = (t: (typeof TABS)[number], cls: string, active: string, idle: string, children: ReactNode) => (
    <button key={t.id} onClick={() => goto(t.id)} aria-current={tab === t.id ? "page" : undefined} className={`${cls} ${tab === t.id ? active : idle}`}>{children}</button>
  );

  return (
    <div className="min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 pt-[env(safe-area-inset-top,0px)] sm:h-16 box-content">
          <button onClick={() => goto("cek")} className="flex items-center gap-2.5 rounded-lg py-2" aria-label="JEDA, ke beranda">
            <Logo height={22} />
            <span className="text-lg font-extrabold tracking-tight">JEDA</span>
          </button>
          <nav aria-label="Menu utama" className="hidden gap-1 rounded-full border border-line bg-surface p-1 sm:flex">
            {TABS.map((t) => navBtn(t, "rounded-full px-4 py-1.5 text-sm font-semibold transition", "bg-brand text-on-brand", "text-muted hover:text-ink", t.label))}
          </nav>
          <p className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted sm:hidden">Diproses di perangkatmu</p>
        </div>
      </header>

      {/* Semua halaman tetap terpasang agar hasil Cek dan progres Latihan tidak hilang saat pindah menu. */}
      <div ref={page}>
        <div data-page hidden={tab !== "cek"}><Cek goto={goto} /></div>
        <div data-page hidden={tab !== "latihan"}><Latihan goto={goto} open={tab === "latihan" && nav.arg ? { id: nav.arg, n: nav.n } : null} /></div>
        <div data-page hidden={tab !== "darurat"}><Darurat /></div>
        <div data-page hidden={tab !== "tentang"}><Tentang /></div>
      </div>

      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur sm:hidden">
        {TABS.map((t) => navBtn(t, "relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors", "text-brand", "text-muted",
          <>
            {tab === t.id && <span className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-brand" aria-hidden />}
            {t.icon}<span>{t.short}</span>
          </>))}
      </nav>
    </div>
  );
}