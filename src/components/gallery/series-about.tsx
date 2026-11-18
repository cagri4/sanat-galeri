/**
 * "Seri hakkında" bloğu — sanatçının seri açıklaması (lib/categories COLLECTIONS.about).
 * Şiirden ayrı, sade blok. \n\n paragraf, \n satır sonu (ör. "yok" satırları alt alta).
 */
export default function SeriesAbout({ text, locale, className = '' }: { text: string; locale: string; className?: string }) {
  return (
    <section className={`border-l border-[var(--rule)] pl-5 ${className}`}>
      <h2 className="text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--faint)]">
        {locale === 'tr' ? 'Seri hakkında' : 'About the series'}
      </h2>
      <div className="mt-3 space-y-4">
        {text.split('\n\n').map((para, i) => (
          <p key={i} className="max-w-[68ch] whitespace-pre-line text-[length:var(--text-body)] leading-[1.8] text-[#4a4a4a]">
            {para}
          </p>
        ))}
      </div>
    </section>
  )
}
