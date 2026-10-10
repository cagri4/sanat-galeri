import Image from 'next/image'

interface ProjectCardProps {
  href: string
  no: string
  title: string
  image: string | null
  meta: (string | null | undefined)[]
}

/**
 * Kurumsal proje kartı: 4:3 sabit oran, numara + ad + mono künye satırı.
 * Galerideki kare/hover-altyazı kartın tersine bilgi HER ZAMAN görünür,
 * zoom yok (karar: ölçülü, teknik dil).
 */
export default function ProjectCard({ href, no, title, image, meta }: ProjectCardProps) {
  const line = meta.filter(Boolean).join(' · ')
  return (
    <a href={href} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e9e8]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-opacity duration-[var(--dur-micro)] group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-12 gap-2 border-t border-[var(--rule)] pt-3">
        <span className="col-span-2 font-mono text-[13px] text-[var(--accent)]">{no}</span>
        <div className="col-span-10">
          <h3 className="text-base leading-snug text-[var(--foreground)] group-hover:text-[var(--accent)]">{title}</h3>
          {line && <p className="mt-1 font-mono text-[12px] leading-relaxed text-[var(--muted)]">{line}</p>}
        </div>
      </div>
    </a>
  )
}
