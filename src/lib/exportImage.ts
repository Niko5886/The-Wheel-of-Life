/**
 * Експорт на <svg> като PNG файл — изцяло клиентски, без външни библиотеки.
 *
 * Външният CSS (Tailwind класове като fill-ink, fill-softbg, stroke-ink/…)
 * не важи в самостоятелен SVG, зареден като изображение. Затова клонираме
 * SVG-то и инлайнваме изчислените стилове (getComputedStyle) на всеки елемент.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const INLINE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'font-family',
  'font-size',
  'font-weight',
  'opacity',
]

export async function downloadSvgAsPng(
  svg: SVGSVGElement,
  fileName = 'kolelo-na-jivota.png',
  size = 1000,
  background = '#FBFAD1',
): Promise<void> {
  const viewBox = svg.viewBox.baseVal
  const vbW = viewBox.width || 600
  const vbH = viewBox.height || 600

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NS)
  clone.setAttribute('width', String(vbW))
  clone.setAttribute('height', String(vbH))

  // Инлайн на изчислените стилове (оригинал → клонинг, в един и същ ред).
  const originals = svg.querySelectorAll<SVGElement>('*')
  const clones = clone.querySelectorAll<SVGElement>('*')
  originals.forEach((el, i) => {
    const target = clones[i]
    if (!target) return
    const cs = getComputedStyle(el)
    let style = target.getAttribute('style') ?? ''
    for (const prop of INLINE_PROPS) {
      const value = cs.getPropertyValue(prop)
      if (value) style += `${prop}:${value};`
    }
    target.setAttribute('style', style)
  })

  // Плътен фон (SVG-то само по себе си е прозрачно).
  const bg = document.createElementNS(SVG_NS, 'rect')
  bg.setAttribute('x', '0')
  bg.setAttribute('y', '0')
  bg.setAttribute('width', String(vbW))
  bg.setAttribute('height', String(vbH))
  bg.setAttribute('fill', background)
  clone.insertBefore(bg, clone.firstChild)

  const svgString = new XMLSerializer().serializeToString(clone)
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

  const img = new Image()
  img.decoding = 'sync'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Неуспешно зареждане на SVG за експорт'))
    img.src = svgUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = Math.round((size * vbH) / vbW)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2D контекст е недостъпен')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) throw new Error('Неуспешно създаване на PNG')

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
