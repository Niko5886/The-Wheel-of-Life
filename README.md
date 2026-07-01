# Колелото на живота (Wheel of Life)

Интерактивно едностранично уеб приложение за самооценка в 7 сфери на живота.
Базирано на работния лист на Юли Тонкин / МАБИ ([tonkin.bg](https://www.tonkin.bg)).

> Пълната спецификация е в [`AGENT.md`](./AGENT.md) — единственият източник на истина за проекта.

## Технологичен стек

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Framer Motion 11 · нативен SVG · lucide-react

## Стартиране

```bash
npm install     # инсталира зависимостите
npm run dev     # dev сървър на http://localhost:5173
```

## Build

```bash
npm run build   # tsc --noEmit + vite build → статичен dist/
npm run preview # преглед на production build-а локално
```

## Структура

Виж §7 в [`AGENT.md`](./AGENT.md).
