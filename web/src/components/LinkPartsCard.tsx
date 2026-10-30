import type { LinkParts } from "../engine";

export default function LinkPartsCard({ parts }: { parts: LinkParts }) {
  const rows: [string, string, string][] = [
    ["Domain utama (perkiraan)", parts.registrable, "Inilah yang menentukan siapa pemilik situs."],
    ["Subdomain", parts.subdomain || "tidak ada", "Bagian di depan domain utama. Penipu sering menaruh nama merek di sini."],
    ["Jalur", parts.path || "/", "Halaman di dalam situs. Isinya bisa diatur siapa saja."],
  ];
  if (parts.port) rows.push(["Port", parts.port, "Nomor pintu sambungan. Situs biasa jarang memakai port khusus."]);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="text-lg font-bold">Cara membaca tautan ini</h3>
      <dl className="mt-3 divide-y divide-line">
        {rows.map(([k, v, hint]) => (
          <div key={k} className="py-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="mt-0.5 break-all font-semibold">{v}</dd>
            <dd className="mt-0.5 text-sm text-muted">{hint}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">Domain utama ditebak dengan daftar akhiran sederhana, jadi bisa meleset untuk akhiran yang jarang.</p>
    </section>
  );
}