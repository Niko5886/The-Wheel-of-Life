// Модел на данните (§3 в AGENT.md)

/** Седемте сфери — точно както в PDF-а, в този ред (§3). */
export type SphereId =
  | 'health' // Здраве и тяло
  | 'mind' // Мислене и фокус (ум)
  | 'relationships' // Връзки и комуникация
  | 'time' // Управление на времето
  | 'mission' // Мисия и визия
  | 'finance' // Финанси и пари
  | 'joy' // Радост от живота

/**
 * Статична дефиниция на сфера: идентификатор + български етикет (§3)
 * + цвят на съответния сектор в колелото (§6).
 */
export interface SphereDef {
  id: SphereId
  label: string
  color: string
}

/** Сфера в текущото състояние на приложението (§3). */
export interface Sphere {
  id: SphereId
  label: string
  /** 0..10 — Стъпка 1 (слайдер). */
  score: number
  /** 0..10 — Стъпка 3 (позиция на точката, инициализирана = score). */
  point: number
}

/** Текуща стъпка в потока (§8): 1 → 2 → 3 → 'result'. */
export type Step = 1 | 2 | 3 | 'result'
