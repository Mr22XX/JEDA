/** Logo JEDA: dua batang "jeda". Bentuk dan gradasinya sama dengan favicon (public/favicon.svg). */
export default function Logo({ height = 22 }: { height?: number }) {
  const bar = { width: height * 0.28, height, borderRadius: height * 0.12 };
  return (
    <span className="flex" style={{ gap: height * 0.2 }} aria-hidden>
      <i className="bg-linear-to-b from-brand to-calm" style={bar} />
      <i className="bg-linear-to-b from-brand to-calm" style={bar} />
    </span>
  );
}