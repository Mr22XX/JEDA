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
      <dl className="mt-3 divide-y divide-line">
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