export type Finding = { rule_id: string; tactic: string; weight: number; start: number; end: number; snippet: string; why: string };
export type Level = "tidak_ditemukan" | "ringan" | "sedang" | "tinggi";
export type Analysis = { score: number; level: Level; findings: Finding[]; combos: string[]; tactics: string[]; disclaimer: string };

// Hasil build wasm-pack ada di ./wasm. glob membuat build tidak gagal bila folder belum ada.
const modules = import.meta.glob("./wasm/jeda_engine.js");
let loading: Promise<(t: string) => string> | null = null;

function load() {
  loading ??= (async () => {
    const importer = Object.values(modules)[0];
    if (!importer) throw new Error("Mesin analisis belum dibuild. Jalankan: npm run build:wasm");
    const m = (await importer()) as { default: () => Promise<unknown>; analyze: (t: string) => string };
    await m.default();
    return m.analyze;
  })().catch((e) => { loading = null; throw e; });
  return loading;
}

export async function analyze(text: string): Promise<Analysis> {
  return JSON.parse((await load())(text)) as Analysis;
}
