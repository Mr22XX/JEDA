import type { ReactNode } from "react";
import Logo from "./Logo";
import { useI18n } from "../i18n";
import type { Goto, Tab } from "../content";

const IDS: Tab[] = ["cek", "latihan", "darurat", "tentang"];

const SOCIALS: { name: string; href: string; icon: ReactNode }[] = [
  {
    name: "Instagram",
    href: "https://instagram.com/kalibata.project",
    icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" /></>,
  },
  {
    name: "GitHub",
    href: "https://github.com/Mr22XX/JEDA",
    icon: <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
  },
  {
    name: "Website",
    href: "https://kalibataproject.my.id",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  },
];

export default function Footer({ goto, tab }: { goto: Goto; tab: Tab }) {
  const { t } = useI18n();
  const f = t.footer;

  function toTop() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <footer className="mt-10 border-t border-line bg-surface pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <button type="button" onClick={() => goto("cek")} aria-label={t.app.home} className="flex items-center gap-2.5 rounded-lg py-1">
            <Logo height={22} />
            <span className="text-lg font-extrabold tracking-tight">JEDA</span>
          </button>
          <p className="mt-3 text-base font-bold text-brand">{f.tagline}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{f.blurb}</p>

          <ul className="mt-5 flex gap-2.5">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name}
                  className="flex size-11 items-center justify-center rounded-full border-2 border-edge bg-surface text-ink transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-on-brand hover:shadow-lg hover:shadow-brand/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{s.icon}</svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={f.menu}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{f.menu}</h2>
          <ul className="mt-3 space-y-1">
            {IDS.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => goto(id)} aria-current={tab === id ? "page" : undefined}
                  className={`rounded py-1.5 text-sm font-semibold transition hover:text-brand ${tab === id ? "text-brand" : "text-ink"}`}>{t.app.nav[id]}</button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.privacy}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.disclaimer}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 text-xs text-muted">
          <span>{f.copy(new Date().getFullYear())}</span>
          <button type="button" onClick={toTop} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-semibold transition hover:border-brand hover:text-brand">
            {f.top}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}