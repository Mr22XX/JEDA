import Logo from "./Logo";
import { useI18n } from "../i18n";
import type { Goto } from "../content";

const REPO = "https://github.com/Mr22XX/JEDA";


const TEXT = {
  id: {
    tagline: "Ragu? Jeda dulu, cek dulu.",
    about: "Alat bantu mengenali, mempelajari, dan menangani penipuan digital. Semua pemeriksaan berjalan di perangkatmu.",
    explore: "Jelajahi",
    important: "Penting",
    notice: "JEDA tidak pernah menyatakan sebuah pesan atau tautan aman. Hasilnya hanya petunjuk, bukan jaminan.",
    made: "",
    source: "Kode sumber di GitHub",
    rights: "© 2026 JEDA",
    nav: { cek: "Cek dulu", latihan: "Latihan", darurat: "Langkah darurat", tentang: "Tentang dan batasan" },
  },
  en: {
    tagline: "Unsure? Pause first, check first.",
    about: "A tool to recognize, learn about and respond to digital scams. Every check runs on your own device.",
    explore: "Explore",
    important: "Important",
    notice: "JEDA never says a message or link is safe. Results are hints, not guarantees.",
    made: "",
    source: "Source code on GitHub",
    rights: "© 2026 JEDA.",
    nav: { cek: "Check", latihan: "Practice", darurat: "Emergency steps", tentang: "About and limitations" },
  },
} as const;

const LINKS = ["cek", "latihan", "darurat", "tentang"] as const;

export default function Footer({ goto }: { goto: Goto }) {
  const { lang } = useI18n();
  const x = TEXT[lang];
  return (
    <footer className="mt-8 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo height={22} />
            <span className="text-lg font-extrabold tracking-tight">JEDA</span>
          </div>
          <p className="mt-3 font-semibold">{x.tagline}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{x.about}</p>
        </div>

        <nav aria-label={x.explore}>
          <h2 className="text-sm font-bold">{x.explore}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LINKS.map((id) => (
              <li key={id}>
                <button onClick={() => goto(id)} className="text-left text-muted transition hover:text-brand hover:underline">{x.nav[id]}</button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold">{x.important}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{x.notice}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{x.made}</p>
          <p className="mt-3 text-sm">
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline-offset-2 hover:underline">{x.source} ↗</a>
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted">{x.rights}</p>
      </div>
    </footer>
  );
}