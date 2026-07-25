import { Fragment } from 'react'

/**
 * Sanatcinin kendi metinlerini oldugu gibi basar.
 *
 * Eser aciklamalari sanatcinin dokumanindan ALINTI ve KISALTILMADAN girilir
 * (bkz. SANATCI-ESER-ACIKLAMALARI.md). Metinde `**Ikonografik cozumleme:**`
 * gibi vurgular var; bunlar sanatcinin kendi bolumlemesi oldugu icin
 * korunuyor. Burada yalnizca iki bicimlendirme taninir:
 *   - bos satir (\n\n) -> paragraf
 *   - **...**          -> kalin
 * Baska HTML uretilmez; icerik metin olarak basilir (XSS yuzeyi yok).
 */
export default function RichText({
  text,
  className = '',
  paragraphClassName = '',
}: {
  text: string
  className?: string
  paragraphClassName?: string
}) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p key={i} className={paragraphClassName}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
            chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4 ? (
              <strong key={j} className="font-medium text-[#2C2C2C]">
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={j}>{chunk}</Fragment>
            )
          )}
        </p>
      ))}
    </div>
  )
}
