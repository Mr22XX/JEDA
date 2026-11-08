import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Cek from "./pages/Cek";
import Latihan from "./pages/Latihan";
import Darurat from "./pages/Darurat";
import Tentang from "./pages/Tentang";
import Logo from "./components/Logo";
import { useI18n, type Lang } from "./i18n";
import type { Goto, Tab } from "./content";

gsap.registerPlugin(useGSAP);

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const TABS: { id: Tab; icon: ReactNode }[] = [
  { id: "cek", icon: <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon> },
  { id: "latihan", icon: <Icon><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" /></Icon> },
  { id: "darurat", icon: <Icon><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.01" /></Icon> },
  { id: "tentang", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Icon> },
];

// Alamat: #tab atau #tab/argumen, misalnya #latihan/loker. Penghitung n membuat tujuan yang sama bisa dibuka ulang.
let counter = 0;
function read() {
  const [t, arg] = location.hash.slice(1).split("/");
  return { tab: TABS.find((x) => x.id === t)?.id ?? ("cek" as Tab), arg, n: ++counter };
}

const isDark = () => {
  const d = document.documentElement.dataset.theme;
  return d ? d === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};

function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: dark)");
    const f = () => { if (!document.documentElement.dataset.theme) setDark(m.matches); };
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  useEffect(() => { document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#070605" : "#faf7f4"); }, [dark]);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("jeda:theme", next ? "dark" : "light"); } catch { /* penyimpanan dimatikan: abaikan */ }
  }
  return (
    <button type="button" onClick={toggle} aria-label={dark ? t.app.toLight : t.app.toDark} title={dark ? t.app.toLight : t.app.toDark}
      className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-brand hover:text-brand">
      {dark
        ? <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
        : <Icon><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Icon>}
    </button>
  );
}

function LangToggle() {
  const { t, lang, setLang } = useI18n();
  return (
    <div role="group" aria-label={t.app.language} className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-bold backdrop-blur">
      {(["id", "en"] as Lang[]).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l}
          className={`min-w-8 rounded-full px-2.5 py-1.5 transition ${lang === l ? "bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "text-muted hover:text-ink"}`}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  const [nav, setNav] = useState(read);
  const tab = nav.tab;
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = () => setNav(read());
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const goto: Goto = (to, arg) => {
    const h = arg ? `${to}/${arg}` : to;
    if (location.hash.slice(1) === h) setNav(read()); else location.hash = h;
    scrollTo({ top: 0 });
  };

  useGSAP(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-page]:not([hidden])", { opacity: 0, y: 14, duration: 0.4, ease: "power2.out" });
  }, { scope: page, dependencies: [tab] });

  return (
    <div className="min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto box-content flex h-14 max-w-6xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top,0px)] sm:h-16">
          <button onClick={() => goto("cek")} className="flex items-center gap-2.5 rounded-lg py-2" aria-label={t.app.home}>
            <Logo height={22} />
            <span className="text-lg font-extrabold tracking-tight">JEDA</span>
          </button>
          <nav aria-label={t.app.mainMenu} className="hidden gap-1 rounded-full border border-line bg-surface p-1 backdrop-blur sm:flex">
            {TABS.map((x) => (
              <button key={x.id} onClick={() => goto(x.id)} aria-current={tab === x.id ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === x.id ? "bg-gradient-to-r from-amber-500 to-orange-600 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.35)]" : "text-muted hover:text-ink"}`}>{t.app.nav[x.id]}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2"><LangToggle /><ThemeToggle /></div>
        </div>
      </header>

      {/* Semua halaman tetap terpasang agar hasil Cek dan progres Latihan tidak hilang saat pindah menu. */}
      <div ref={page}>
        <div data-page hidden={tab !== "cek"}><Cek goto={goto} /></div>
        <div data-page hidden={tab !== "latihan"}><Latihan goto={goto} open={tab === "latihan" && nav.arg ? { id: nav.arg, n: nav.n } : null} /></div>
        <div data-page hidden={tab !== "darurat"}><Darurat /></div>
        <div data-page hidden={tab !== "tentang"}><Tentang /></div>
      </div>

      <nav aria-label={t.app.mainMenu} className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur sm:hidden">
        {TABS.map((x) => (
          <button key={x.id} onClick={() => goto(x.id)} aria-current={tab === x.id ? "page" : undefined}
            className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${tab === x.id ? "text-brand" : "text-muted"}`}>
            {tab === x.id && <span className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-brand" aria-hidden />}
            {x.icon}<span>{t.app.navShort[x.id]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
