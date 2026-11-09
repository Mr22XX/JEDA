/**
 * ThreeSteps: penjelasan alur tiga langkah penggunaan (Kenali, Belajar, Bertindak).
 * Bukan tombol, karena menu sudah ada di navigasi. Teks dari t.steps di i18n/dict.ts.
 */
import { useI18n } from "../i18n";

/** Penjelasan alur, bukan tombol: menu sudah ada di navigasi. */
export default function ThreeSteps() {
  const { t } = useI18n();
  const steps = t.steps.items;
  return (
    <ol aria-label={t.steps.label} className="mt-5 flex items-center gap-2 text-sm font-semibold text-muted">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand" aria-hidden>{i + 1}</span>
          {s}
          {i < steps.length - 1 && <span className="ml-1 h-px w-5 bg-line" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}