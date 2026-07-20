import { getAllProducts } from '@/lib/queries/admin'
import HomepageSlotsForm, { type SlotProduct } from '@/components/admin/homepage-slots-form'

export default async function AnaSayfaPage() {
  const products = await getAllProducts()

  const rows: SlotProduct[] = products.map((p: any) => ({
    id: p.id,
    titleTr: p.titleTr,
    isVisible: p.isVisible,
    imageUrl: p.images?.[0]?.url ?? null,
    heroOrder: p.heroOrder ?? null,
    instagramOrder: p.instagramOrder ?? null,
  }))

  return (
    <div>
      <h1 className="mb-2 text-2xl font-light tracking-tight text-neutral-900">Ana Sayfa</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        Ana sayfadaki hero slaytları ve Instagram bölümünde hangi eserlerin,
        hangi sırayla görüneceğini buradan seçin.
      </p>
      <HomepageSlotsForm products={rows} />
    </div>
  )
}
