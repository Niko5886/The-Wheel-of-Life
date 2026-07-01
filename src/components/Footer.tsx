/**
 * Footer (§6) — авторство + линк към сайта на Юли Тонкин.
 */
export default function Footer() {
  return (
    <footer className="mt-4 pb-2 text-center text-sm text-ink/60">
      <p>
        Създадено по идеи на <span className="font-semibold text-ink/80">Юли Тонкин</span>.
      </p>
      <a
        href="https://www.tonkin.bg"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block font-heading font-bold text-brand-red transition-colors hover:text-brand-orange"
      >
        www.tonkin.bg
      </a>
    </footer>
  )
}
