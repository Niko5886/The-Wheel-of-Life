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
  return pointAt(axisAngle(i), radiusForValue(value))
}

/** Крайната точка на ос `i` (при оценка 10) — за рисуване на радиалните линии. */
export function axisEnd(i: number): Point {
  return pointOnAxis(i, MAX_SCORE)
}

/** Радиус (px) за оценка `value` (0..10): value 0 → 0, value 10 → MAX_RADIUS. */
export function radiusForValue(value: number): number {
  return (value / MAX_SCORE) * MAX_RADIUS
}

/** Полярна → декартова точка около CENTER: `angle` в радиани, `radius` в px. */
export function pointAt(angle: number, radius: number): Point {
  return {
    x: CENTER.x + radius * Math.cos(angle),
    y: CENTER.y + radius * Math.sin(angle),
  }
}

/** Ъглови граници на сектор i: [center − HALF_STEP, center + HALF_STEP]. */
export function sectorBounds(i: number): { start: number; end: number } {
  const a = axisAngle(i)
  return { start: a - HALF_STEP, end: a + HALF_STEP }
}

/**
 * SVG path за пълния клин (pie-slice) на сектор i — от центъра до външния
 * ръб (радиус `radius`, по подразбиране MAX_RADIUS). Клиновете се редят без
 * припокриване: краят на сектор i съвпада с началото на i+1 → 7 РАВНИ сектора.
 */
export function sectorPath(i: number, radius: number = MAX_RADIUS): string {
  const { start, end } = sectorBounds(i)
  const p0 = pointAt(start, radius)
  const p1 = pointAt(end, radius)
  // large-arc-flag=0 (клинът е < 180°); sweep-flag=1 (по часовниковата стрелка).
  return `M ${round(CENTER.x)} ${round(CENTER.y)} L ${round(p0.x)} ${round(p0.y)} A ${radius} ${radius} 0 0 1 ${round(p1.x)} ${round(p1.y)} Z`
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

/**
 * SVG path за ГЛАДКА ЗАТВОРЕНА крива, минаваща ТОЧНО през всяка от точките.
 * Използва uniform Catmull-Rom spline, преобразуван към cubic Bézier (C),
 * със затваряне без ъгъл (тангентите съвпадат на връзката край→начало).
 * Кривината е умерена (коеф. 1/6) — органична форма без примки/изхвърляне.
 * Заменя правия polygon за резултатното колело; точките не се местят.
 */
export function smoothClosedPath(points: Point[]): string {
  const n = points.length
  if (n < 3) {
    return (
      points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${round(p.x)} ${round(p.y)}`)
        .join(' ') + ' Z'
    )
  }
  const at = (i: number) => points[((i % n) + n) % n]
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${round(cp1x)} ${round(cp1y)} ${round(cp2x)} ${round(cp2y)} ${round(p2.x)} ${round(p2.y)}`
  }
  return `${d} Z`
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
