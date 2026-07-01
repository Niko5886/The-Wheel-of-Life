import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'
import type { Sphere, SphereId } from '../types'
import { SPHERES } from '../data/spheres'
import {
  CENTER,
  MAX_RADIUS,
  axisAngle,
  axisEnd,
  nearestAxisIndex,
  pointAt,
  pointOnAxis,
  polygonPath,
  radiusForValue,
  scoreFromPoint,
  sectorPath,
} from '../lib/geometry'

export type WheelMode = 'draw' | 'interactive' | 'result'

interface WheelSvgProps {
  spheres: Sphere[]
  mode: WheelMode
  /** Извиква се в режим 'interactive' при клик/drag по ос (нова стойност 0..10). */
  onPointChange?: (id: SphereId, value: number) => void
  /** Показва полигона на живо и в 'interactive' (за обединения екран 'assess'). */
  withPolygon?: boolean
  className?: string
}

// ── Оформление (в координатната система на viewBox 600×600) ──────────────
const VIEW = 600
/** Радиус, на който стоят етикетите на секторите (леко извън външния ринг). */
const LABEL_RADIUS = 258
/** Радиус, на който стои числото „10" (в горния край на оста, под етикета). */
const TEN_RADIUS = MAX_RADIUS - 40
/** Стойности за фините концентрични водещи кръгове (10 съвпада с външния ринг). */
const GUIDE_VALUES = [2, 4, 6, 8]

/** Цвят на сектора по id (§6). */
const COLOR_BY_ID = new Map(SPHERES.map((s) => [s.id, s.color]))

/** Преобразува екранни (client) координати в координати на viewBox-а. */
function clientToSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
  return { x: p.x, y: p.y }
}

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
 *  • 'draw'        — Стъпка 2: scaffold, осите „израстват" от центъра.
 *  • 'interactive' — Стъпка 3: точки по point-стойностите; клик/drag по ос
 *                    → snap към 0..10 (чрез geometry.ts) → onPointChange.
 *  • 'result'      — точките се свързват в затворен полигон с fill.
 */
export default function WheelSvg({
  spheres,
  mode,
  onPointChange,
  withPolygon = false,
  className,
}: WheelSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  // Оста, която в момента се влачи (фиксира се при pointerdown, за да не „скача").
  const draggingAxis = useRef<number | null>(null)

  const animateGrow = mode === 'draw'
  const isInteractive = mode === 'interactive'
  const showPoints = mode !== 'draw'
  const drawPolygon = mode === 'result' // с анимирано очертаване
  const showPolygon = drawPolygon || (isInteractive && withPolygon)

  // Ъгъл по индекс + етикет/цвят/point — без ъгли „на ръка".
  const axes = spheres.map((s, i) => ({
    i,
    id: s.id,
    label: s.label,
    point: s.point,
    color: COLOR_BY_ID.get(s.id) ?? '#9CA3AF',
    end: axisEnd(i),
    labelPos: pointAt(axisAngle(i), LABEL_RADIUS),
    tenPos: pointAt(axisAngle(i), TEN_RADIUS),
  }))

  // Клик/drag: определя оста (най-близката при клик; фиксираната при drag),
  // snap-ва радиуса към 0..10 и вдига onPointChange.
  const applyAt = (
    clientX: number,
    clientY: number,
    forcedAxis: number | null,
  ): number | null => {
    const svg = svgRef.current
    if (!svg || !onPointChange) return null
    const p = clientToSvgPoint(svg, clientX, clientY)
    if (!p) return null
    const i = forcedAxis ?? nearestAxisIndex(p.x, p.y)
    onPointChange(spheres[i].id, scoreFromPoint(i, p.x, p.y))
    return i
  }

  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isInteractive) return
    e.preventDefault()
    const i = applyAt(e.clientX, e.clientY, null)
    if (i != null) {
      draggingAxis.current = i
      try {
        svgRef.current?.setPointerCapture(e.pointerId)
      } catch {
        /* недостъпен/синтетичен pointer — drag ще работи и без capture */
      }
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isInteractive || draggingAxis.current == null) return
    e.preventDefault()
    applyAt(e.clientX, e.clientY, draggingAxis.current)
  }

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (draggingAxis.current == null) return
    draggingAxis.current = null
    try {
      svgRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer вече е освободен */
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className={className}
      role="img"
      aria-label="Колело на живота — кръг, разделен на 7 равни сектора"
      style={isInteractive ? { touchAction: 'none' } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {showPolygon && (
        <defs>
          <linearGradient id="wol-wheel-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E94F37" />
            <stop offset="45%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#43A047" />
          </linearGradient>
        </defs>
      )}

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

      {/* 3) Радиалните оси — в 'draw' „израстват" от центъра навън */}
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

      {/* 4) Полигон — свързва точките. В 'result' с анимирано очертаване;
          на екрана 'assess' (interactive + withPolygon) се обновява на живо. */}
      {showPolygon &&
        (drawPolygon ? (
          <motion.path
            d={polygonPath(spheres.map((s) => s.point))}
            fill="url(#wol-wheel-fill)"
            stroke="#2E2E2E"
            strokeOpacity={0.55}
            strokeWidth={2.5}
            strokeLinejoin="round"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 0.28 }}
            transition={{
              pathLength: { duration: 0.9, ease: 'easeInOut' },
              fillOpacity: { delay: 0.7, duration: 0.5 },
            }}
          />
        ) : (
          <motion.path
            d={polygonPath(spheres.map((s) => s.point))}
            fill="url(#wol-wheel-fill)"
            fillOpacity={0.22}
            stroke="#2E2E2E"
            strokeOpacity={0.5}
            strokeWidth={2.5}
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}

      {/* 5) Точки — винаги видими в 'interactive'/'result'; позиция по point.
          В 'interactive' се преместват ПЛАВНО (~150ms) при промяна на стойността
          (напр. при движение на слайдер). */}
      {showPoints &&
        axes.map(({ i, id, color, point }) => {
          const p = pointOnAxis(i, point)
          return isInteractive ? (
            <motion.circle
              key={`point-${i}`}
              data-testid={`point-${id}`}
              r={9}
              fill={color}
              stroke="#ffffff"
              strokeWidth={2.5}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                cursor: 'grab',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.28))',
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.92 }}
              initial={{ cx: p.x, cy: p.y }}
              animate={{ cx: p.x, cy: p.y }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            />
          ) : (
            <motion.circle
              key={`point-${i}`}
              data-testid={`point-${id}`}
              cx={p.x}
              cy={p.y}
              r={9}
              fill={color}
              stroke="#ffffff"
              strokeWidth={2.5}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.28))',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
            />
          )
        })}

      {/* 6) Числото „10" на всяка ос — само в 'draw' (Стъпка 2). В
          'interactive'/'result' точките заемат това място; скалата се
          подсказва от водещите кръгове + „0" в центъра. */}
      {animateGrow &&
        axes.map(({ i, tenPos }) => (
          <motion.g
            key={`ten-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 + i * 0.04, duration: 0.3 }}
          >
            <circle cx={tenPos.x} cy={tenPos.y} r={10} className="fill-softbg" />
            <text
              x={tenPos.x}
              y={tenPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              className="fill-ink/70"
            >
              10
            </text>
          </motion.g>
        ))}

      {/* 7) Числото „0" в центъра (общ произход на всичките 7 оси) */}
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

      {/* 8) Етикет с името на всяка сфера — извън сектора */}
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
