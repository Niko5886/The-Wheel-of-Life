import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Sphere, SphereId } from '../types'
import { SPHERES } from '../data/spheres'
import { MIN_SCORE, MAX_SCORE } from '../lib/geometry'

interface Step1SlidersProps {
  spheres: Sphere[]
  onScoreChange: (id: SphereId, score: number) => void
  onNext: () => void
}

/** Цвят на сектора по id (§6). */
const COLOR_BY_ID = new Map(SPHERES.map((s) => [s.id, s.color]))

/**
 * СТЪПКА 1 — Оценяване (§4). 7 слайдера 0–10 (стъпка 1), всеки с етикет,
 * видима стойност и цвят на своя сектор. Стойностите се контролират отвън
 * (споделеният `spheres` state в App). Бутон „Напред →".
 */
export default function Step1Sliders({
  spheres,
  onScoreChange,
  onNext,
}: Step1SlidersProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <header className="text-center mb-6">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-ink">
          Оцени всяка сфера от 0 до 10
        </h2>
        <p className="mt-1 text-ink/60">0 = незадоволително, 10 = оптимално</p>
      </header>

      <ul className="space-y-5 rounded-3xl bg-white/60 backdrop-blur-sm shadow-soft p-5 md:p-7">
        {spheres.map((s, i) => {
          const color = COLOR_BY_ID.get(s.id) ?? '#9CA3AF'
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {s.label}
                </span>
                <span
                  data-testid={`score-${s.id}`}
                  className="min-w-[2.25rem] rounded-lg bg-softbg px-2 py-0.5 text-center font-heading font-bold tabular-nums text-ink"
                >
                  {s.score}
                </span>
              </div>
              <input
                type="range"
                min={MIN_SCORE}
                max={MAX_SCORE}
                step={1}
                value={s.score}
                onChange={(e) => onScoreChange(s.id, Number(e.target.value))}
                aria-label={s.label}
                className="wol-range mt-2"
                style={{ accentColor: color }}
              />
            </motion.li>
          )
        })}
      </ul>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-red to-brand-orange px-6 py-3 font-heading font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[.98]"
        >
          Напред
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </motion.section>
  )
}
