/**
 * Penggabung data berbahasa: memilih versi Indonesia (data asli) atau Inggris (data asli + override dari data/en.ts).
 * Fungsi scenariosFor, situationsFor, statsFor, channelsFor di-memo agar terjemahan hanya dihitung sekali.
 * Bila terjemahan suatu item tidak ada, otomatis jatuh ke teks Indonesia.
 */
import { SCENARIOS, type Scenario } from "../data/scenarios";
import { SITUATIONS, type Situation } from "../data/emergency";
import { STATS, CHANNELS, type Channel } from "../data/facts";
import { SCENARIOS_EN, SITUATIONS_EN, STATS_EN, CHANNELS_EN, LINK_LABELS_EN } from "../data/en";

export type Lang = "id" | "en";
const cache: Record<string, unknown> = {};
const memo = <T,>(k: string, f: () => T): T => (cache[k] ??= f()) as T;

export const scenariosFor = (lang: Lang): Scenario[] =>
  lang === "id" ? SCENARIOS : memo("sc", () => SCENARIOS.map((sc) => {
    const e = SCENARIOS_EN[sc.id];
    if (!e) return sc;
    const nodes = Object.fromEntries(Object.entries(sc.nodes).map(([k, n]) => {
      const en = e.nodes[k];
      if (!en) return [k, n];
      return [k, {
        ...n,
        messages: en.messages ?? n.messages,
        choices: n.choices?.map((c, i) => ({ ...c, text: en.choices?.[i]?.text ?? c.text, feedback: en.choices?.[i]?.feedback ?? c.feedback })),
        end: n.end ? { ...n.end, ...(en.end ?? {}) } : undefined,
      }];
    }));
    return { ...sc, title: e.title, persona: e.persona, contact: e.contact, audience: sc.audience ? e.audience ?? sc.audience : undefined, fact: e.fact, nodes };
  }));

export const situationsFor = (lang: Lang): Situation[] =>
  lang === "id" ? SITUATIONS : memo("sit", () => SITUATIONS.map((s) => ({ ...s, ...(SITUATIONS_EN[s.id] ?? {}) })));

export const statsFor = (lang: Lang) =>
  lang === "id" ? STATS : memo("st", () => STATS.map((s, i) => ({ ...s, ...(STATS_EN[i] ?? {}) })));

export const channelsFor = (lang: Lang): Record<string, Channel> =>
  lang === "id" ? CHANNELS : memo("ch", () => Object.fromEntries(Object.entries(CHANNELS).map(([id, c]) => [id, {
    ...c, ...(CHANNELS_EN[id] ?? {}), links: c.links.map((l) => ({ ...l, label: LINK_LABELS_EN[l.label] ?? l.label })),
  }])));