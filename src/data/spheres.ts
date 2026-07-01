import type { Sphere, SphereDef } from '../types'

/**
 * Седемте сфери в ТОЧНИЯ ред от PDF-а (§3), с етикети (§3) и цветове на
 * секторите (§6) — топла → студена ротация, като корицата.
 *
 * Редът тук определя реда на осите в колелото (индекс 0 = първата сфера,
 * позиционирана на върха — виж axisAngle в lib/geometry.ts).
 */
export const SPHERES: readonly SphereDef[] = [
  { id: 'health', label: 'Здраве и тяло', color: '#E94F37' }, // червено
  { id: 'mind', label: 'Мислене и фокус (ум)', color: '#F5731F' }, // тъмно оранжево
  { id: 'relationships', label: 'Връзки и комуникация', color: '#F5A623' }, // оранжево
  { id: 'time', label: 'Управление на времето', color: '#F7E463' }, // жълто
  { id: 'mission', label: 'Мисия и визия', color: '#C6E063' }, // жълто-зелено
  { id: 'finance', label: 'Финанси и пари', color: '#7FC241' }, // зелено
  { id: 'joy', label: 'Радост от живота', color: '#43A047' }, // тъмно зелено
]

/** Оценка по подразбиране за всеки слайдер в Стъпка 1 (§4 — слайдерите имат default). */
export const DEFAULT_SCORE = 5

/**
 * Създава началното състояние на приложението: за всяка сфера
 * `score = point = DEFAULT_SCORE`. Използва се при първо зареждане и при
 * „Начертай отново" (reset към Стъпка 1, §8).
 */
export function createInitialSpheres(): Sphere[] {
  return SPHERES.map(({ id, label }) => ({
    id,
    label,
    score: DEFAULT_SCORE,
    point: DEFAULT_SCORE,
  }))
}
