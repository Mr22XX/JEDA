import { CHECKED } from "../data/facts";
import { useI18n, Rich } from "../i18n";

export default function Tentang() {
  const { t } = useI18n();
  const a = t.about;
  return (
    <main className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:pt-14">
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{a.title}</h1>
      <p className="mt-4 text-lg text-muted">{a.lead}</p>

      {a.sections.map((sec) => (
        <section key={sec.id} className="mt-6 rounded-3xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight">{sec.title}</h2>
          <div className="mt-3 space-y-3 leading-relaxed">
            {sec.paras?.map((p, i) => <p key={i}><Rich text={p.replace("{date}", CHECKED)} /></p>)}
            {sec.id === "scoring" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] text-left text-sm">
                  <thead><tr className="border-b border-line text-muted"><th className="py-2 pr-4">{a.levelHead[0]}</th><th className="py-2">{a.levelHead[1]}</th></tr></thead>
                  <tbody className="divide-y divide-line">{a.levelRows.map(([k, v]) => <tr key={k}><td className="py-2 pr-4">{k}</td><td>{v}</td></tr>)}</tbody>
                </table>
              </div>
            )}
            {sec.items && <ul className="list-disc space-y-1.5 pl-5">{sec.items.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul>}
            {sec.after?.map((p, i) => <p key={i}><Rich text={p} /></p>)}
          </div>
        </section>
      ))}
    </main>
  );
}