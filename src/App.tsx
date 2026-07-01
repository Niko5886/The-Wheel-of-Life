import WheelSvg from './components/WheelSvg'
import { createInitialSpheres } from './data/spheres'

export default function App() {
  // Временно (Стъпка 4): статично начално състояние само за визуална проверка.
  const spheres = createInitialSpheres()

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-brand-yellow/50 via-softbg to-brand-green/10 px-4 py-10">
      <header className="text-center mb-6">
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-orange to-brand-green">
          Колелото на живота
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Стъпка 2 — автоматично изчертаване (визуална проверка)
        </p>
      </header>

      <div className="w-full max-w-xl">
        <WheelSvg spheres={spheres} mode="draw" className="w-full h-auto" />
      </div>
    </div>
  )
}
