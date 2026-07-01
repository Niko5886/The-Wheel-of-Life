import {
  N,
  CENTER,
  MAX_RADIUS,
  HALF_STEP,
  axisAngle,
  sectorBounds,
  pointOnAxis,
  axisEnd,
  scoreFromPoint,
} from './src/lib/geometry.ts'

const DEG = 180 / Math.PI
const dist = (p: { x: number; y: number }, q: { x: number; y: number }) =>
  Math.hypot(p.x - q.x, p.y - q.y)
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

let ok = true
const check = (name: string, cond: boolean, extra = '') => {
  if (!cond) ok = false
  console.log(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`)
}

console.log(`N = ${N}, HALF_STEP = ${(HALF_STEP * DEG).toFixed(3)}°  (очаквано ${(360 / N / 2).toFixed(3)}°)\n`)

// 1) Осите са равно раздалечени
const angles = Array.from({ length: N }, (_, i) => axisAngle(i) * DEG)
console.log('Ъгли на осите (°):', angles.map((a) => a.toFixed(2)).join(', '))
const diffs = angles.slice(1).map((a, i) => a - angles[i])
check('Осите са равно раздалечени (Δ = 360/7)', diffs.every((d) => near(d, 360 / N)), diffs.map((d) => d.toFixed(3)).join(', '))
check('Ос 0 сочи нагоре (−90°)', near(angles[0], -90))

// 2) 7 РАВНИ сектора, които тайлват без припокриване
const spans = Array.from({ length: N }, (_, i) => {
  const b = sectorBounds(i)
  return (b.end - b.start) * DEG
})
check('Всичките 7 сектора са с равен ъглов обхват', spans.every((s) => near(s, 360 / N)), `обхват = ${spans[0].toFixed(3)}°`)
const tiles = Array.from({ length: N }, (_, i) =>
  near(sectorBounds(i).end, sectorBounds((i + 1) % N).start + (i + 1 === N ? 2 * Math.PI : 0)),
)
check('Секторите тайлват (край на i = начало на i+1)', tiles.every(Boolean))
const sumSpans = spans.reduce((a, b) => a + b, 0)
check('Сумата на секторите = 360°', near(sumSpans, 360), `${sumSpans.toFixed(3)}°`)

// 3) Скала: 0 в центъра, 10 на външния ръб (MAX_RADIUS)
check('pointOnAxis(i, 0) === центъра за всяка ос', Array.from({ length: N }, (_, i) => pointOnAxis(i, 0)).every((p) => near(dist(p, CENTER), 0)))
check('axisEnd(i) е на разстояние MAX_RADIUS (оценка 10)', Array.from({ length: N }, (_, i) => axisEnd(i)).every((p) => near(dist(p, CENTER), MAX_RADIUS)))
check('pointOnAxis(0, 10) === (300, 60) — връх', near(pointOnAxis(0, 10).x, 300) && near(pointOnAxis(0, 10).y, 60))

// 4) Клик → snap: обхождане 0..10 по всяка ос връща същата цяла оценка
let roundTrip = true
for (let i = 0; i < N; i++) {
  for (let v = 0; v <= 10; v++) {
    const p = pointOnAxis(i, v)
    if (scoreFromPoint(i, p.x, p.y) !== v) roundTrip = false
  }
}
check('scoreFromPoint снапва точно 0..10 по всяка ос (round-trip)', roundTrip)

console.log(`\n${ok ? '🎉 Всички геометрични проверки минаха.' : '⚠️  Има провалени проверки.'}`)
process.exit(ok ? 0 : 1)
