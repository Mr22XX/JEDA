import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Latar bergerak: dua cahaya besar bergeser pelan (CSS) dan, di perangkat dengan mouse,
 * satu cahaya yang mengikuti kursor dengan jeda halus. Semuanya transform saja, tanpa blur.
 * Dijeda saat tab browser tidak terlihat, dan dimatikan untuk prefers-reduced-motion.
 */
export default function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current, l = light.current;
    if (!el || !l) return;
    const sync = () => { el.dataset.paused = String(document.hidden); };
    sync();
    document.addEventListener("visibilitychange", sync);

    let off = () => {};
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm && matchMedia("(pointer: fine)").matches) {
      gsap.set(l, { x: innerWidth * 0.7, y: innerHeight * 0.3 });
      const x = gsap.quickTo(l, "x", { duration: 1.1, ease: "power3.out" });
      const y = gsap.quickTo(l, "y", { duration: 1.1, ease: "power3.out" });
      const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
      addEventListener("pointermove", move, { passive: true });
      el.dataset.follow = "true";
      off = () => removeEventListener("pointermove", move);
    }
    return () => { document.removeEventListener("visibilitychange", sync); off(); };
  }, []);

  return (
    <div ref={ref} className="ambient" aria-hidden>
      <span className="orb orb-a" />
      <span className="orb orb-b" />
      <span ref={light} className="light" />
    </div>
  );
}