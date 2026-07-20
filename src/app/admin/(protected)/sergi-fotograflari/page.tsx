import { EXHIBITIONS, getExhibitionPhotos } from '@/lib/queries/exhibition-photos'
import ExhibitionPhotoManager from '@/components/admin/exhibition-photo-manager'

export default async function SergiFotograflariPage() {
  // Su an tek sergi var; liste `EXHIBITIONS` uzerinden geliyor, yenisi
  // eklendiginde bu sayfa kendiliginden onu da gosterir.
  const groups = await Promise.all(
    EXHIBITIONS.map(async (ex) => ({ ...ex, photos: await getExhibitionPhotos(ex.slug) }))
  )

  return (
    <div>
      <h1 className="mb-2 text-2xl font-light tracking-tight text-neutral-900">
        Sergi Fotoğrafları
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        Sergi sayfasındaki fotoğraflar ve foto altı açıklamaları. Açıklaması boş
        bırakılan fotoğrafta sitede yalnızca başlık görünür — tahmin yazmayın.
      </p>

      {groups.map((group) => (
        <section key={group.slug} className="mb-12">
          <h2 className="mb-4 text-lg font-medium text-neutral-900">
            {group.label}{' '}
            <span className="text-sm font-normal text-neutral-500">
              ({group.photos.length} fotoğraf)
            </span>
          </h2>
          <ExhibitionPhotoManager exhibitionSlug={group.slug} photos={group.photos} />
        </section>
      ))}
    </div>
  )
}
