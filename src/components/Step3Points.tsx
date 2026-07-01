import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Sphere, SphereId } from '../types'
import WheelSvg from './WheelSvg'

interface Step3PointsProps {
  spheres: Sphere[]
  onPointChange: (id: SphereId, value: number) => void
  onCalculate: () => void
}

/**
 * СТЪПКА 3 — Поставяне на точки (§4). Точките са предварително позиционирани
 * (point = score от Стъпка 1); потребителят кликва/плъзга по оста, за да ги
 * коригира. Долу — бутон „Изчисли ▸".
 */
export default function Step3Points({
  spheres,
  onPointChange,
  onCalculate,
}: Step3PointsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full max-w-xl flex-col items-center"
    >
      <p className="mb-3 max-w-md text-center text-ink/70">
        Кликни върху всяка ос, за да поставиш или коригираш точката си.
        <span className="mt-0.5 block text-sm text-ink/50">
          (можеш и да плъзгаш точките)
        </span>
      </p>

      <WheelSvg
        spheres={spheres}
        mode="interactive"
        onPointChange={onPointChange}
        className="h-auto w-full"
      />

      <button
        type="button"
        onClick={onCalculate}
        className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-green to-brand-orange px-7 py-3 font-heading font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[.98]"
      >
        Изчисли
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </motion.section>
  )
}
