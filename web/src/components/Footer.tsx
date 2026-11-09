import Logo from "./Logo";
import { useI18n } from "../i18n";
import type { Goto, Tab } from "../content";

const IDS: Tab[] = ["cek", "latihan", "darurat", "tentang"];

export default function Footer({ goto, tab }: { goto: Goto; tab: Tab }) {
  const { t } = useI18n();
  const f = t.footer;

  function toTop() {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <footer className="mt-10 border-t border-line bg-surface/60 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <button type="button" onClick={() => goto("cek")} aria-label={t.app.home} className="flex items-center gap-2.5 rounded-lg py-1">
            <Logo height={22} />
            <span className="text-lg font-extrabold tracking-tight">JEDA</span>
          </button>
          <p className="mt-3 text-base font-bold text-brand">{f.tagline}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{f.blurb}</p>
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
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            {f.privacyTitle}
          </h2>
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