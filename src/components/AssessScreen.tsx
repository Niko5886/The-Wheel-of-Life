import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Sphere, SphereId } from '../types'
import { SPHERES } from '../data/spheres'
import { MIN_SCORE, MAX_SCORE } from '../lib/geometry'
import WheelSvg from './WheelSvg'

interface AssessScreenProps {
  spheres: Sphere[]
  /** Двупосочно: движи и слайдера, и точката (една стойност 0..10 на сфера). */
  onValueChange: (id: SphereId, value: number) => void
  onCalculate: () => void
}

/** Цвят на сектора по id (§6). */
const COLOR_BY_ID = new Map(SPHERES.map((s) => [s.id, s.color]))

/**
 * Обединеният екран 'assess' (бивши Стъпка 1 + 2). Две колони:
 *  • ляво  — 7-те слайдера,
 *  • дясно — колелото на живо (точки + полигон, синхронизирани с state-а).
 * Движение на слайдер ↔ клик по ос обновяват СЪЩАТА стойност мигновено.
 * На мобилен колоните се подреждат вертикално (слайдери → колело).
 */
export default function AssessScreen({
  spheres,
  onValueChange,
  onCalculate,
}: AssessScreenProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-5xl"
    >
      <header className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-extrabold text-ink md:text-3xl">
          Оцени всяка сфера от 0 до 10
        </h2>
        <p className="mt-1 text-ink/60">0 = незадоволително, 10 = оптимално</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
        {/* ЛЯВА колона — слайдери */}
        <ul className="space-y-5 rounded-3xl bg-white/60 p-5 shadow-soft backdrop-blur-sm md:p-6">
          {spheres.map((s, i) => {
            const color = COLOR_BY_ID.get(s.id) ?? '#9CA3AF'
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: 'easeOut' }}
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
                  onChange={(e) => onValueChange(s.id, Number(e.target.value))}
                  aria-label={s.label}
                  className="wol-range mt-2"
                  style={{ accentColor: color }}
                />
              </motion.li>
            )
          })}
        </ul>

        {/* ДЯСНА колона — колелото на живо (точки + полигон) */}
        <div className="flex flex-col items-center md:sticky md:top-6">
          <WheelSvg
            spheres={spheres}
            mode="interactive"
            withPolygon
            onPointChange={onValueChange}
            className="h-auto w-full max-w-md"
          />
          <p className="mt-2 max-w-xs text-center text-sm text-ink/50">
            Движи слайдер или кликни по ос, за да коригираш точката.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onCalculate}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-green to-brand-orange px-8 py-3 font-heading font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[.98]"
        >
          Изчисли
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </motion.section>
  )
}
