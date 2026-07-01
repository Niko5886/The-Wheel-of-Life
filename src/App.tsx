import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AssessScreen from './components/AssessScreen'
import ResultPanel from './components/ResultPanel'
import StepIndicator from './components/StepIndicator'
import Footer from './components/Footer'
import WheelSvg from './components/WheelSvg'
import { createInitialSpheres } from './data/spheres'
import { downloadSvgAsPng } from './lib/exportImage'
import type { SphereId, Step } from './types'

export default function App() {
  // Споделеният state на приложението (§8, обновен поток: assess → result).
  const [spheres, setSpheres] = useState(createInitialSpheres)
  const [step, setStep] = useState<Step>('assess')
  // Обвивка около колелото в резултата — за export като PNG.
  const wheelRef = useRef<HTMLDivElement>(null)

  // На екрана 'assess' слайдерът и точката са ЕДНА стойност (двупосочна връзка):
  // и слайдерът, и клик по ос викат това → score и point се движат заедно.
  const handleValueChange = (id: SphereId, value: number) => {
    setSpheres((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: value, point: value } : s)),
    )
  }

  const goToResult = () => setStep('result')
  const reset = () => {
    setSpheres(createInitialSpheres())
    setStep('assess')
  }
  const downloadWheel = () => {
    const svg = wheelRef.current?.querySelector('svg')
    if (svg) void downloadSvgAsPng(svg, 'kolelo-na-jivota.png')
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-brand-yellow/50 via-softbg to-brand-green/10 px-4 py-4">
      <header className="mb-2 text-center md:mb-3">
        <h1 className="bg-gradient-to-r from-brand-red via-brand-orange to-brand-green bg-clip-text font-heading text-2xl font-extrabold uppercase leading-tight tracking-tight text-transparent sm:text-3xl">
          Колелото на живота
        </h1>
      </header>

      <StepIndicator step={step} />

      <main className="flex w-full flex-1 flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 'assess' && (
            <AssessScreen
              key="assess"
              spheres={spheres}
              onValueChange={handleValueChange}
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
              className="flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-12"
            >
              <div ref={wheelRef} className="w-full max-w-[30rem] lg:shrink-0">
                <WheelSvg spheres={spheres} mode="result" className="h-auto w-full" />
              </div>
              <ResultPanel onReset={reset} onDownload={downloadWheel} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
