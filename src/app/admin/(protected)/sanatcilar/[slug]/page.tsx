import { notFound } from 'next/navigation'
import { getArtistBySlug } from '@/lib/queries/admin'
import ArtistForm from '@/components/admin/artist-form'
import ExhibitionForm from '@/components/admin/exhibition-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SanatciDuzenlePage({ params }: PageProps) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug)

  if (!artist) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
        Sanatci Duzenle: {artist.nameTr}
      </h1>

      <div className="space-y-6">
        <ArtistForm artist={artist} />
        <ExhibitionForm artistId={artist.id} exhibitions={artist.exhibitions} />
      </div>
    </div>
  )
}
