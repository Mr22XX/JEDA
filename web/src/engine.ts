/**
 * Jembatan ke mesin WASM hasil build Rust (src/wasm). Memuat modul sekali, memanggil analyze dan analyze_link,
 * lalu mem-parse JSON-nya. Tipe di sini harus sejajar dengan struct Rust (Finding, Analysis, Parts, LinkAnalysis).
 * Galat: ENGINE_NOT_BUILT bila src/wasm belum dibuild, ENGINE_OUTDATED bila WASM lama. Bangun ulang dengan `npm run build:wasm`.
 */

export type Finding = { rule_id: string; tactic: string; weight: number; start: number; end: number; snippet: string; why: string };
export type Level = "tidak_ditemukan" | "ringan" | "sedang" | "tinggi";
export type Analysis = { score: number; level: Level; findings: Finding[]; combos: string[]; tactics: string[]; disclaimer: string };
export type LinkParts = { scheme: string | null; userinfo: string | null; host: string; subdomain: string; registrable: string; port: string | null; path: string };
export type LinkAnalysis = Analysis & { error: string | null; input: string; note: string | null; extra_links: number; parts: LinkParts | null };

type Mod = { default: () => Promise<unknown>; analyze: (t: string) => string; analyze_link?: (t: string) => string };

// Hasil build wasm-pack ada di ./wasm. glob membuat build tidak gagal bila folder belum ada.
const modules = import.meta.glob("./wasm/jeda_engine.js");
let loading: Promise<Mod> | null = null;

function load() {
  loading ??= (async () => {
    const importer = Object.values(modules)[0];
    if (!importer) throw new Error("ENGINE_NOT_BUILT");
    const m = (await importer()) as Mod;
    await m.default();
    return m;
  })().catch((e) => { loading = null; throw e; });
  return loading;
}

export async function analyze(text: string): Promise<Analysis> {
  return JSON.parse((await load()).analyze(text)) as Analysis;
}

export async function analyzeLink(url: string): Promise<LinkAnalysis> {
  const m = await load();
  if (typeof m.analyze_link !== "function") throw new Error("ENGINE_OUTDATED");
  return JSON.parse(m.analyze_link(url)) as LinkAnalysis;
}