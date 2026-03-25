import Link from 'next/link'
import Image from 'next/image'
import { getAllArtists } from '@/lib/queries/admin'

export default async function SanatcilarPage() {
  const artists = await getAllArtists()

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-neutral-900 mb-6">
        Sanatcilar
      </h1>

      {artists.length === 0 ? (
        <p className="text-neutral-500">Hic sanatci bulunamadi.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/admin/sanatcilar/${artist.slug}`}
              className="group flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:shadow-sm transition-all duration-150"
            >
              <div className="relative h-14 w-14 flex-shrink-0 rounded-full overflow-hidden bg-neutral-100">
                {artist.photoUrl ? (
                  <Image
                    src={artist.photoUrl}
                    alt={artist.nameTr}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-neutral-400 text-xl font-light">
                    {artist.nameTr.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 group-hover:text-neutral-700 truncate">
                  {artist.nameTr}
                </p>
                <p className="text-sm text-neutral-500 truncate">{artist.slug}</p>
              </div>
              <svg
                className="h-4 w-4 text-neutral-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
