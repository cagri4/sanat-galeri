/**
 * Eserlerin 3B modelleri (GLB, public/3d/). Eser sayfası, slug burada varsa
 * fotoğraf galerisinin altına model-viewer + AR ekler. Yalnız GERÇEK çekimden
 * (fotogrametri) üretilen modeller girer; yapay zekâ ile uydurulmuş model girmez.
 */
export interface Model3D {
  src: string
  /** Kaynak ve yöntem notu — ziyaretçiye gösterilir. */
  noteTr: string
  noteEn: string
}

export const MODELS_3D: Record<string, Model3D> = {
  // Anka V (fotogrametri) 21 Eki'de sayfadan KALDIRILDI (GERI-ALMA-ISTEGI, Çağrı). GLB: arsiv/3d/anka-v-yeniden-varolus.glb
}
