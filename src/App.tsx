import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Step1Sliders from './components/Step1Sliders'
import WheelSvg from './components/WheelSvg'
import { createInitialSpheres } from './data/spheres'
import type { SphereId, Step } from './types'

export default function App() {
  // Споделеният state на приложението (§8).
  const [spheres, setSpheres] = useState(createInitialSpheres)
  const [step, setStep] = useState<Step>(1)

  const handleScoreChange = (id: SphereId, score: number) => {
    setSpheres((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score } : s)),
    )
  }

  const goToStep2 = () => {
    // §8: при прехода 1 → 2 инициализираме точката = оценката.
    setSpheres((prev) => prev.map((s) => ({ ...s, point: s.score })))
    setStep(2)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-brand-yellow/50 via-softbg to-brand-green/10 px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-brand-red via-brand-orange to-brand-green bg-clip-text font-heading text-3xl font-extrabold uppercase tracking-tight text-transparent md:text-5xl">
          Колелото на живота
        </h1>
      </header>

      <main className="flex w-full flex-1 flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1Sliders
              key="step1"
              spheres={spheres}
              onScoreChange={handleScoreChange}
              onNext={goToStep2}
            />
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              {/* Провизорно (Стъпка 2 засега): точките/полигонът идват по-късно. */}
              <WheelSvg spheres={spheres} mode="draw" className="h-auto w-full" />
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-2.5 font-heading font-bold text-ink shadow-soft transition hover:brightness-105 active:scale-[.98]"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
                Назад
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
