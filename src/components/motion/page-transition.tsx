/**
 * Sayfa gecisi: saf CSS keyframe (bkz. globals.css .page-in).
 *
 * Sunucu bileseni — istemci JS'i beklemez, JS hic yuklenmese bile animasyon
 * calisir ve icerik her kosulda gorunurdur. `animation-fill-mode: both` +
 * prefers-reduced-motion kuralı sayesinde hareket kapaliyken oge dogrudan
 * son (gorunur) durumda kalir.
 *
 * Bilincli olarak neredeyse gorunmez: yalnizca opacity + 4px kayma.
 * Slayt/kaydirma efekti yok — galeride gosterisli gecis dikkat dagitir.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>
}
