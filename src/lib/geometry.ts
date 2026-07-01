/**
 * ГЕОМЕТРИЯ НА КОЛЕЛОТО (§5 в AGENT.md)
 *
 * ─── ФИКСИРАНА ЪГЛОВА КОНВЕНЦИЯ (една за целия проект) ───────────────────
 *  • Всяка от N-те оси е ЦЕНТЪР на своя сектор (НЕ граница).
 *  • Ос 0 сочи право НАГОРЕ (−90° в екранни координати, където y расте надолу);
 *    индексът се увеличава ПО ЧАСОВНИКОВАТА СТРЕЛКА.
 *  • Сектор i заема ъгловия интервал
 *        [ axisAngle(i) − HALF_STEP ,  axisAngle(i) + HALF_STEP ].
 *  • Радиусът е линеен: оценка 0 → центъра, оценка 10 → MAX_RADIUS.
 *
 *  Осите, етикетите, точките и клик-детекцията ПРЕИЗПОЛЗВАТ функциите тук —
 *  никъде другаде не се смятат ъгли „на ръка".
 * ────────────────────────────────────────────────────────────────────────
 */

export interface Point {
  x: number
  y: number
}

/** Център на колелото за viewBox 600×600 (§5). */
export const CENTER: Point = { x: 300, y: 300 }

/** Радиус при оценка 10 (§5). */
export const MAX_RADIUS = 240

/** Брой сектори/оси (§5). */
export const N = 7

/** Диапазон на оценките. */
export const MIN_SCORE = 0
export const MAX_SCORE = 10

/** Половин сектор в радиани — оста е в средата на сектора (= (360/N/2)°). */
export const HALF_STEP = Math.PI / N

/**
 * Ъгъл (в радиани) на i-тата ос = център на сектор i.
 * Ос 0 = −90° (върха); индексът расте по часовниковата стрелка. (§5)
 */
export function axisAngle(i: number): number {
  return (-90 + (360 / N) * i) * (Math.PI / 180)
}

/**
 * Позиция на точка при оценка `value` (0..10) по ос `i`. (§5)
 * value = 0 → центъра; value = 10 → външния край (MAX_RADIUS).
 */
export function pointOnAxis(i: number, value: number): Point {
  const r = (value / MAX_SCORE) * MAX_RADIUS
  const a = axisAngle(i)
  return {
    x: CENTER.x + r * Math.cos(a),
    y: CENTER.y + r * Math.sin(a),
  }
}

/** Крайната точка на ос `i` (при оценка 10) — за рисуване на радиалните линии. */
export function axisEnd(i: number): Point {
  return pointOnAxis(i, MAX_SCORE)
}

/**
 * SVG path string за ЗАТВОРЕНИЯ полигон, свързващ точките на всичките оси.
 * `values[i]` е оценката (0..10) по ос i; очаква се `values.length === N`.
 * Резултат: "M x0 y0 L x1 y1 … L x6 y6 Z".
 */
export function polygonPath(values: number[]): string {
  const cmds = values.map((value, i) => {
    const p = pointOnAxis(i, value)
    return `${i === 0 ? 'M' : 'L'} ${round(p.x)} ${round(p.y)}`
  })
  return `${cmds.join(' ')} Z`
}

/** Ограничава число в интервала [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * От кликната екранна координата (x, y) връща най-близката ЦЯЛА оценка
 * 0..10 ПО ЗАДАДЕНАТА ос `i` (Стъпка 3 — snap към цяло число).
 *
 * Клик-точката се проектира върху посоката на оста (скаларно произведение
 * с единичния вектор на оста); получената радиална дистанция се мащабира
 * към 0..10, закръгля се към най-близкото цяло и се ограничава в [0, 10].
 */
export function scoreFromPoint(i: number, x: number, y: number): number {
  const a = axisAngle(i)
  const dx = x - CENTER.x
  const dy = y - CENTER.y
  // Проекция на (dx, dy) върху единичния вектор на оста (cos a, sin a):
  const r = dx * Math.cos(a) + dy * Math.sin(a)
  const value = (r / MAX_RADIUS) * MAX_SCORE
  return clamp(Math.round(value), MIN_SCORE, MAX_SCORE)
}

/**
 * Индексът на оста, чиято ПОСОКА е ъглово най-близо до кликнатата точка
 * (x, y) спрямо центъра. Полезно за Стъпка 3, когато не знаем предварително
 * коя ос е таргетирал потребителят (клик → най-близка ос → snap с scoreFromPoint).
 */
export function nearestAxisIndex(x: number, y: number): number {
  const clickAngle = Math.atan2(y - CENTER.y, x - CENTER.x)
  let best = 0
  let bestDiff = Infinity
  for (let i = 0; i < N; i++) {
    const diff = angularDistance(clickAngle, axisAngle(i))
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best
}

/** Най-малката разлика между два ъгъла (в радиани), в интервала [0, π]. */
function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI)
  return d > Math.PI ? 2 * Math.PI - d : d
}

/** Закръгляне до 2 знака — компактен и стабилен SVG path. */
function round(n: number): number {
  return Math.round(n * 100) / 100
}
