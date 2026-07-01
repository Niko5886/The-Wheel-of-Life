import type { CSSProperties } from 'react'
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
      className="w-full max-w-6xl"
    >
      <header className="mb-3 text-center">
        <h2 className="font-heading text-xl font-extrabold leading-tight text-ink md:text-2xl">
          Оцени всяка сфера от 0 до 10
        </h2>
        <p className="mt-0.5 text-sm text-ink/60">
          0 = незадоволително, 10 = оптимално
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
        {/* ЛЯВА колона — слайдери */}
        <ul className="space-y-0.5 rounded-3xl bg-white/60 p-3 shadow-soft backdrop-blur-sm">
          {spheres.map((s, i) => {
            const color = COLOR_BY_ID.get(s.id) ?? '#9CA3AF'
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.04 + i * 0.04, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium leading-tight text-ink">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {s.label}
                  </span>
                  <span
                    data-testid={`score-${s.id}`}
                    className="min-w-[2rem] rounded-lg bg-softbg px-2 py-0 text-center text-sm font-heading font-bold leading-tight tabular-nums text-ink"
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
                  className="wol-range mt-0"
                  style={
                    {
                      '--range-color': color,
                      '--range-fill': `${(s.score / MAX_SCORE) * 100}%`,
                    } as CSSProperties
                  }
                />
              </motion.li>
            )
          })}
        </ul>

        {/* ДЯСНА колона — колелото на живо (точки + полигон) */}
        <div className="flex flex-col items-center">
          <WheelSvg
            spheres={spheres}
            mode="interactive"
            withPolygon
            onPointChange={onValueChange}
            className="h-auto w-full max-w-[500px]"
          />
          <p className="mt-2 text-center text-xs text-ink/50">
            Движи слайдер или кликни по ос.
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
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
