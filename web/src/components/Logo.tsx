/**
 * Logo: logo JEDA berupa dua batang "jeda" bergradien oranye/amber.
 * Props: height (ukuran dasar, lebar dan jarak dihitung proporsional).
 */
export default function Logo({ height = 22 }: { height?: number }) {
  const bar = {
    width: height * 0.28,
    height,
    borderRadius: height * 0.14,
    background: "linear-gradient(180deg, #F59E0B 0%, #EA580C 100%)",
    boxShadow: "0 0 10px rgba(245, 158, 11, 0.45)",
  };
  return (
    <span className="inline-flex items-center shrink-0" style={{ gap: height * 0.2 }} aria-hidden>
      <i className="block transition-transform duration-200 hover:scale-105" style={bar} />
      <i className="block transition-transform duration-200 hover:scale-105" style={bar} />
    </span>
  );
}