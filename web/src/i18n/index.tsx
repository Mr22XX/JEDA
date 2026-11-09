/**
 * Inti i18n: I18nProvider, hook useI18n, dan komponen Rich.
 * - I18nProvider menyimpan bahasa aktif (localStorage "jeda:lang"), mengatur <html lang> dan judul halaman,
 *   lalu menyediakan kamus UI (t), data berbahasa, dan helper terjemah hasil engine (tact, why, combo, linkError).
 * - useI18n dipakai semua komponen untuk mengambil teks; wajib di dalam I18nProvider.
 * - Rich merender teks ringan: **tebal**, `kode`, [tautan](url), _miring_.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ID, EN, type Dict } from "./dict";
import { scenariosFor, situationsFor, statsFor, channelsFor, type Lang } from "./data";
import { WHY_EN, D01_NONLATIN_EN, COMBOS_EN, LINK_ERRORS_EN } from "../data/en";
import type { Finding } from "../engine";

export type { Lang };
const KEY = "jeda:lang";
const read = (): Lang => { try { return localStorage.getItem(KEY) === "en" ? "en" : "id"; } catch { return "id"; } };

type I18n = {
  lang: Lang; setLang: (l: Lang) => void; t: Dict;
  tact: (k: string) => string; why: (f: Finding) => string; combo: (n: string) => string; linkError: (m: string) => string;
  scenarios: ReturnType<typeof scenariosFor>; situations: ReturnType<typeof situationsFor>;
  stats: ReturnType<typeof statsFor>; channels: ReturnType<typeof channelsFor>;
};
const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(read);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = (lang === "en" ? EN : ID).app.title;
    try { localStorage.setItem(KEY, lang); } catch { /* penyimpanan dimatikan: abaikan */ }
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const t = lang === "en" ? EN : ID;
    const en = lang === "en";
    return {
      lang, setLang, t,
      tact: (k) => t.tactics[k] ?? k,
      why: (f) => {
        if (!en) return f.why;
        if (f.rule_id === "D01") return f.why.startsWith("Domain memuat") ? D01_NONLATIN_EN : WHY_EN.D01;
        return WHY_EN[f.rule_id] ?? f.why;
      },
      combo: (n) => (en ? COMBOS_EN[n] ?? n : n),
      linkError: (m) => (en ? LINK_ERRORS_EN[m] ?? m : m),
      scenarios: scenariosFor(lang), situations: situationsFor(lang), stats: statsFor(lang), channels: channelsFor(lang),
    };
  }, [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n harus dipakai di dalam I18nProvider");
  return c;
}

/** Teks ringan: **tebal**, `kode`, [tautan](url), _miring_. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|_[^_]+_)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
        if (p.startsWith("`")) return <code key={i} className="rounded bg-brand/10 px-1.5 py-0.5 text-sm">{p.slice(1, -1)}</code>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="lnk">{m[1]}</a>;
        if (p.length > 2 && p.startsWith("_") && p.endsWith("_")) return <i key={i}>{p.slice(1, -1)}</i>;
        return p;
      })}
    </>
  );
}