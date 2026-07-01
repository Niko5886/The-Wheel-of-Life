import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Step } from '../types'

interface StepIndicatorProps {
  step: Step
}

const STEPS = [
  { n: 1, label: 'Оценяване' },
  { n: 2, label: 'Резултат' },
] as const

/** 'assess' → активна е стъпка 1; 'result' → стъпка 2. */
function currentIndex(step: Step): number {
  return step === 'result' ? 2 : 1
}

/**
 * Индикатор на текущата стъпка (1/2/3), горе. Активната е откроена с
 * брандов градиент; завършените — със зелена отметка (§6).
 */
export default function StepIndicator({ step }: StepIndicatorProps) {
  const cur = currentIndex(step)

  return (
    <nav aria-label="Напредък по стъпките" className="mb-3 flex items-start justify-center md:mb-4">
      {STEPS.map((s, i) => {
        const isActive = s.n === cur
        const isDone = s.n < cur
        return (
          <div key={s.n} className="flex items-start">
            <div className="flex w-16 flex-col items-center gap-1 sm:w-20">
              <motion.div
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm font-bold shadow-soft',
                  isActive
                    ? 'bg-gradient-to-br from-brand-red to-brand-orange text-white'
                    : isDone
                      ? 'bg-brand-green text-white'
                      : 'bg-white/70 text-ink/40',
                ].join(' ')}
              >
                {isDone ? <Check size={15} strokeWidth={3} /> : s.n}
              </motion.div>
              <span
                className={[
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-ink' : 'text-ink/45',
                ].join(' ')}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={[
                  'mt-[15px] h-0.5 w-6 rounded-full transition-colors sm:w-10',
                  s.n < cur ? 'bg-brand-green' : 'bg-ink/15',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
