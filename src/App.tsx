import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Step1Sliders from './components/Step1Sliders'
import Step3Points from './components/Step3Points'
import ResultPanel from './components/ResultPanel'
import WheelSvg from './components/WheelSvg'
import { createInitialSpheres } from './data/spheres'
import type { SphereId, Step } from './types'

export default function App() {
  // Споделеният state на приложението (§8).
  const [spheres, setSpheres] = useState(createInitialSpheres)
  const [step, setStep] = useState<Step>(1)

  const handleScoreChange = (id: SphereId, score: number) => {
    setSpheres((prev) => prev.map((s) => (s.id === id ? { ...s, score } : s)))
  }

  const handlePointChange = (id: SphereId, value: number) => {
    setSpheres((prev) => prev.map((s) => (s.id === id ? { ...s, point: value } : s)))
  }

  // Преходи (§8)
  const goToStep2 = () => {
    // 1 → 2: инициализираме точката = оценката за всяка сфера.
    setSpheres((prev) => prev.map((s) => ({ ...s, point: s.score })))
    setStep(2)
  }
  const goToStep3 = () => setStep(3)
  const goToResult = () => setStep('result')
  const reset = () => {
    setSpheres(createInitialSpheres())
    setStep(1)
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
            <motion.section
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              <p className="mb-3 max-w-md text-center text-ink/70">
                Колелото ти е изчертано. Продължи, за да поставиш точките си.
              </p>
              <WheelSvg spheres={spheres} mode="draw" className="h-auto w-full" />
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white/70 px-5 py-2.5 font-heading font-bold text-ink shadow-soft transition hover:brightness-105 active:scale-[.98]"
                >
                  <ArrowLeft size={20} strokeWidth={2.5} />
                  Назад
                </button>
                <button
                  type="button"
                  onClick={goToStep3}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-green px-6 py-3 font-heading font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[.98]"
                >
                  Продължи
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <Step3Points
              key="step3"
              spheres={spheres}
              onPointChange={handlePointChange}
              onCalculate={goToResult}
            />
          )}

          {step === 'result' && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex w-full max-w-xl flex-col items-center"
            >
              <WheelSvg spheres={spheres} mode="result" className="h-auto w-full" />
              <ResultPanel onReset={reset} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
