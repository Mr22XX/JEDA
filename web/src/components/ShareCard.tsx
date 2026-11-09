/**
 * ShareCard: tombol untuk membagikan peringatan sebagai gambar (PNG 1080x1350).
 * Gambar digambar di canvas pada perangkat pengguna, tidak ada yang dikirim ke server.
 * Memakai Web Share API bila tersedia; kalau tidak, gambar diunduh.
 * Props: text (isi peringatan, dari field `warn` di data/emergency.ts).
 */
import { useState } from "react";
import { useI18n } from "../i18n";

const W = 1080, H = 1350;

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []; let line = "";
  for (const word of text.split(/\s+/)) {
    const t = line ? `${line} ${word}` : word;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = word; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Menggambar kartu peringatan di perangkat pengguna (canvas). Tidak ada yang dikirim ke server. */
async function makeCard(text: string, L: { title: string; tagline: string; footer: string }): Promise<Blob> {
  await document.fonts?.ready;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#0c0a09"); bg.addColorStop(1, "#1c140e");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const bar = g.createLinearGradient(0, 90, 0, 170); bar.addColorStop(0, "#F59E0B"); bar.addColorStop(1, "#EA580C");
  g.fillStyle = bar;
  [90, 130].forEach((x) => { g.beginPath(); g.roundRect(x, 90, 22, 80, 9); g.fill(); });
  const font = '"Bricolage Grotesque", system-ui, sans-serif';
  g.fillStyle = "#ffffff"; g.textBaseline = "top";
  g.font = `800 56px ${font}`; g.fillText("JEDA", 180, 106);
  g.font = `800 120px ${font}`; g.fillText(L.title, 90, 260);
  let size = 54, lines: string[] = [];
  for (; size >= 32; size -= 2) { g.font = `600 ${size}px ${font}`; lines = wrap(g, text, W - 180); if (lines.length * size * 1.4 <= 640) break; }
  lines.forEach((l, i) => g.fillText(l, 90, 440 + i * size * 1.4));
  g.fillStyle = "#F59E0B"; g.font = `700 40px ${font}`; g.fillText(L.tagline, 90, H - 160);
  g.fillStyle = "#FED7AA"; g.font = `500 30px ${font}`; g.fillText(L.footer, 90, H - 100);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Gagal membuat gambar"))), "image/png"));
}

export default function ShareCard({ text }: { text: string }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState("");
  async function run() {
    setMsg("");
    try {
      const file = new File([await makeCard(text, { title: t.darurat.cardTitle, tagline: t.darurat.cardTagline, footer: t.darurat.cardFooter })], "peringatan-jeda.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: t.darurat.shareTitle, text }); return; }
        catch (e) { if ((e as Error).name === "AbortError") return; }
      }
      const url = URL.createObjectURL(file); const a = document.createElement("a");
      a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url);
      setMsg(t.darurat.downloaded);
    } catch { setMsg(t.darurat.imgFail); }
  }
  return (
    <>
      <button type="button" onClick={run} className="h-11 rounded-xl bg-brand px-5 font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[.98]">{t.darurat.share}</button>
      {msg && <p role="status" className="w-full text-sm text-muted">{msg}</p>}
    </>
  );
}