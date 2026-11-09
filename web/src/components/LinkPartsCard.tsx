/**
 * LinkPartsCard: membedah struktur tautan (skema, userinfo, subdomain, domain utama, port, path).
 * Domain utama disorot karena dialah yang menentukan pemilik situs; userinfo (bagian sebelum @)
 * dicoret merah karena sering dipakai untuk menyamarkan domain asli.
 * Props: parts bertipe LinkParts dari engine.
 */
import type { LinkParts } from "../engine";
import { useI18n } from "../i18n";

export default function LinkPartsCard({ parts }: { parts: LinkParts }) {
  const { t } = useI18n();
  const p = t.parts;
  const rows: [string, string, string][] = [
    [p.main, parts.registrable, p.mainHint],
    [p.sub, parts.subdomain || p.none, p.subHint],
    [p.path, parts.path || "/", p.pathHint],
  ];
  if (parts.port) rows.push([p.port, parts.port, p.portHint]);
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="text-lg font-bold">{p.title}</h3>

      {/* Struktur tautan: domain utama disorot karena dialah yang menentukan pemilik situs */}
      <p className="mt-3 text-xs font-semibold text-muted">{p.anatomy}</p>
      <div className="mt-1.5 break-all rounded-2xl bg-paper p-4 font-mono text-sm leading-relaxed" role="img"
        aria-label={`${p.main}: ${parts.registrable}`}>
        {parts.scheme && <span className="text-muted">{parts.scheme}://</span>}
        {parts.userinfo && <><span className="rounded bg-tinggi/15 px-0.5 text-tinggi line-through">{parts.userinfo}</span><span className="font-bold text-tinggi">@</span></>}
        {parts.subdomain && <span className="text-muted">{parts.subdomain}.</span>}
        <span className="rounded bg-brand/20 px-0.5 font-bold text-brand underline decoration-2 underline-offset-4">{parts.registrable}</span>
        {parts.port && <span className="text-muted">:{parts.port}</span>}
        <span className="text-muted">{parts.path}</span>
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-brand" aria-hidden />{p.legendMain}</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-muted" aria-hidden />{p.legendOther}</span>
        {parts.userinfo && <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-tinggi" aria-hidden />{p.legendFake}</span>}
      </p>

      <dl className="mt-4 divide-y divide-line">
        {rows.map(([k, v, hint]) => (
          <div key={k} className="py-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="mt-0.5 break-all font-semibold">{v}</dd>
            <dd className="mt-0.5 text-sm text-muted">{hint}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">{p.footnote}</p>
    </section>
  );
}