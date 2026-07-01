import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw } from 'lucide-react'

interface ResultPanelProps {
  onReset: () => void
  onDownload: () => void
}

/**
 * РЕЗУЛТАТ — рефлексивен панел (§4). Появява се под колелото с плавен вход
 * отдолу. Съдържа точния текст на въпросите от PDF-а; вторият има textarea
 * (само локален state, без backend). Долу — „Начертай отново".
 */
export default function ResultPanel({ onReset, onDownload }: ResultPanelProps) {
  const [answer, setAnswer] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.5, ease: 'easeOut' }}
      className="mt-6 w-full max-w-xl rounded-3xl bg-white/70 p-6 shadow-soft backdrop-blur-sm md:p-8"
    >
      <h2 className="font-heading text-xl font-extrabold text-ink md:text-2xl">
        Време за размисъл
      </h2>

      <div className="mt-4 space-y-4">
        <div className="flex gap-3 rounded-2xl bg-softbg/70 p-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange font-heading text-sm font-bold text-white">
            1
          </span>
          <p className="pt-0.5 font-medium text-ink">
            Помисли как изглежда твоето колело. Би ли се търкаляло плавно?
          </p>
        </div>

        <div className="rounded-2xl bg-softbg/70 p-4">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green font-heading text-sm font-bold text-white">
              2
            </span>
            <label htmlFor="reflection" className="pt-0.5 font-medium text-ink">
              Кое е първото нещо, което искаш да подобриш тази седмица?
            </label>
          </div>
          <textarea
            id="reflection"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder="Запиши мисълта си тук…"
            className="mt-3 w-full resize-y rounded-xl border border-ink/15 bg-white/80 p-3 text-ink outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-green to-brand-orange px-6 py-3 font-heading font-bold text-white shadow-soft transition hover:brightness-105 active:scale-[.98]"
        >
          <Download size={20} strokeWidth={2.5} />
          Изтегли като изображение
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-6 py-3 font-heading font-bold text-ink shadow-soft transition hover:brightness-105 active:scale-[.98]"
        >
          <RotateCcw size={20} strokeWidth={2.5} />
          Начертай отново
        </button>
      </div>
    </motion.div>
  )
}
