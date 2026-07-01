# Колелото на живота (Wheel of Life)

Интерактивно едностранично уеб приложение за самооценка в **7 сфери на живота**.
Базирано на работния лист на Юли Тонкин / МАБИ ([tonkin.bg](https://www.tonkin.bg)).

Потребителят преминава през 3 стъпки + резултат:

1. **Оценяване** — слайдери 0–10 за всяка от 7-те сфери.
2. **Колело** — автоматично изчертаване на кръг със 7 равни сектора и скала 0→10.
3. **Точки** — клик/drag по всяка ос за поставяне на точка (snap към 0–10).
4. **Резултат** — точките се свързват в полигон + рефлексивни въпроси и export като PNG.

## Технологичен стек

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · нативен SVG · lucide-react

## Стартиране

```bash
npm install     # инсталира зависимостите
npm run dev     # dev сървър → http://localhost:5173
```

## Build / преглед

```bash
npm run build   # tsc --noEmit + vite build → статичен dist/
npm run preview # локален преглед на production build-а
```

## Структура

```
src/
├── App.tsx                  # state machine на стъпките (1 → 2 → 3 → result)
├── main.tsx                 # входна точка
├── index.css                # Tailwind + design tokens (§6)
├── types.ts                 # SphereId, Sphere, Step
├── data/
│   └── spheres.ts           # 7-те сфери (етикети + цветове) + начално състояние
├── lib/
│   ├── geometry.ts          # чиста геометрия: оси, точки, полигон, snap
│   └── exportImage.ts       # export на SVG → PNG (без външни библиотеки)
└── components/
    ├── StepIndicator.tsx    # индикатор 1/2/3 отгоре
    ├── Step1Sliders.tsx     # Стъпка 1 — слайдери
    ├── WheelSvg.tsx         # SVG колелото (режими: draw | interactive | result)
    ├── Step3Points.tsx      # Стъпка 3 — поставяне на точки
    ├── ResultPanel.tsx      # рефлексивни въпроси + export/reset
    └── Footer.tsx           # авторство + линк към tonkin.bg
```

Пълната спецификация е в [`AGENT.md`](./AGENT.md).

## Deploy (Vercel)

Проектът е статичен (frontend-only). На Vercel: **Framework Preset: Vite**,
Build Command `npm run build`, Output Directory `dist`. Работи и с `vercel` CLI
или `git push` към свързано repo — без допълнителна конфигурация.
