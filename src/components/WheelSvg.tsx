import { motion } from 'framer-motion'
import type { Sphere } from '../types'
import { SPHERES } from '../data/spheres'
import {
  CENTER,
  MAX_RADIUS,
  axisAngle,
  axisEnd,
  pointAt,
  radiusForValue,
  sectorPath,
} from '../lib/geometry'

export type WheelMode = 'draw' | 'interactive' | 'result'

interface WheelSvgProps {
  spheres: Sphere[]
  mode: WheelMode
  className?: string
}

// ── Оформление (в координатната система на viewBox 600×600) ──────────────
const VIEW = 600
/** Радиус, на който стоят етикетите на секторите (леко извън външния ринг). */
const LABEL_RADIUS = 258
/** Радиус, на който стои числото „10" (точно вътре в ринга, върху всяка ос). */
const TEN_RADIUS = MAX_RADIUS - 18
/** Стойности за фините концентрични водещи кръгове (10 съвпада с външния ринг). */
const GUIDE_VALUES = [2, 4, 6, 8]

/** Цвят на сектора по id (§6). Scaffold-ът е статичен; scores не му трябват. */
const COLOR_BY_ID = new Map(SPHERES.map((s) => [s.id, s.color]))

/**
 * Разделя дълъг етикет на макс. 2 балансирани реда, за да се събере около
 * колелото в рамките на 600×600 (иначе дългите български етикети преливат).
 */
function wrapLabel(label: string): string[] {
  if (label.length <= 13) return [label]
  const words = label.split(' ')
  if (words.length === 1) return [label]
  const mid = label.length / 2
  let splitAt = 1
  let bestDiff = Infinity
  let acc = 0
  for (let k = 0; k < words.length - 1; k++) {
    acc += words[k].length + 1 // +1 за интервала
    const diff = Math.abs(acc - mid)
    if (diff < bestDiff) {
      bestDiff = diff
      splitAt = k + 1
    }
  }
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')]
}

/**
 * SVG колелото (viewBox 600×600). Презентационен — приема сферите и режим.
 *
 * За СЕГА е имплементиран само scaffold-ът (режим 'draw' = Стъпка 2 от §4):
 * външен ринг, 7 равни сектора, радиални оси, скала 0 (център) → 10 (край),
 * етикети на секторите. Точките (Стъпка 3) и полигонът (Резултат) идват после.
 */
export default function WheelSvg({ spheres, mode, className }: WheelSvgProps) {
  // В режим 'draw' осите „израстват" от центъра; иначе колелото е вече готово.
  const animateGrow = mode === 'draw'

  // Ъгъл по индекс + етикет (от spheres) + цвят (от SPHERES) — без ъгли „на ръка".
  const axes = spheres.map((s, i) => ({
    i,
    label: s.label,
    color: COLOR_BY_ID.get(s.id) ?? '#9CA3AF',
    end: axisEnd(i),
    labelPos: pointAt(axisAngle(i), LABEL_RADIUS),
    tenPos: pointAt(axisAngle(i), TEN_RADIUS),
  }))

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      role="img"
      aria-label="Колело на живота — кръг, разделен на 7 равни сектора"
    >
      {/* 1) Оцветени клинове — 7-те РАВНИ сектора (фон) */}
      <motion.g
        initial={animateGrow ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {axes.map(({ i, color }) => (
          <path
            key={`wedge-${i}`}
            d={sectorPath(i)}
            fill={color}
            fillOpacity={0.15}
            stroke="#ffffff"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ))}
      </motion.g>

      {/* 2) Фини водещи кръгове + плътен външен ринг (при оценка 10) */}
      <motion.g
        initial={animateGrow ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {GUIDE_VALUES.map((v) => (
          <circle
            key={`guide-${v}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={radiusForValue(v)}
            fill="none"
            className="stroke-ink/10"
            strokeWidth={1}
          />
        ))}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={MAX_RADIUS}
          fill="none"
          className="stroke-ink/30"
          strokeWidth={2}
        />
      </motion.g>

      {/* 3) Радиалните оси — „израстват" от центъра навън (Framer Motion) */}
      {axes.map(({ i, color, end }) => (
        <motion.line
          key={`axis-${i}`}
          x1={CENTER.x}
          y1={CENTER.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={animateGrow ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{
            pathLength: { delay: 0.35 + i * 0.07, duration: 0.55, ease: 'easeOut' },
            opacity: { delay: 0.35 + i * 0.07, duration: 0.2 },
          }}
        />
      ))}

      {/* 4) Числото „10" на външния край на всяка ос */}
      {axes.map(({ i, tenPos }) => (
        <motion.text
          key={`ten-${i}`}
          x={tenPos.x}
          y={tenPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          className="fill-ink/55"
          initial={animateGrow ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 + i * 0.04, duration: 0.3 }}
        >
          10
        </motion.text>
      ))}

      {/* 5) Числото „0" в центъра (общ произход на всичките 7 оси) */}
      <motion.g
        initial={animateGrow ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.35 }}
      >
        <circle cx={CENTER.x} cy={CENTER.y} r={13} className="fill-softbg" />
        <text
          x={CENTER.x}
          y={CENTER.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          className="fill-ink/70"
        >
          0
        </text>
      </motion.g>

      {/* 6) Етикет с името на всяка сфера — извън сектора */}
      {axes.map(({ i, label, labelPos }) => {
        const lines = wrapLabel(label)
        return (
          <motion.text
            key={`label-${i}`}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            className="fill-ink font-heading"
            initial={animateGrow ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 + i * 0.05, duration: 0.4 }}
          >
            {lines.length === 1 ? (
              label
            ) : (
              lines.map((line, k) => (
                <tspan key={k} x={labelPos.x} dy={k === 0 ? '-0.55em' : '1.1em'}>
                  {line}
                </tspan>
              ))
            )}
          </motion.text>
        )
      })}
    </svg>
  )
}
