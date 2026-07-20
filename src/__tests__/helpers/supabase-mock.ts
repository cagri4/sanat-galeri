/**
 * Supabase (PostgREST) istemcisi için test yardımcısı.
 *
 * Sorgular zincirlenebilir ve "thenable" bir kurucu üzerinden yürür:
 *   supabase.from('products').select('*').eq('slug', x).single()
 * Buradaki sahte kurucu her çağrıyı kaydeder ve verilen sonucu döndürür,
 * böylece testler HANGİ filtrelerin uygulandığını ve dönen verinin nasıl
 * eşlendiğini doğrulayabilir.
 */

export interface QueryResult {
  data: unknown
  error: unknown
}

export interface RecordedCall {
  method: string
  args: unknown[]
}

const CHAIN_METHODS = [
  'select', 'insert', 'update', 'delete', 'upsert',
  'eq', 'neq', 'gt', 'lt', 'is', 'not', 'like', 'ilike', 'in',
  'order', 'limit', 'range',
] as const

export interface MockBuilder {
  calls: RecordedCall[]
  /** Belirtilen zincir metodunun çağrıldığı argümanlar (yoksa undefined). */
  argsOf(method: string): unknown[] | undefined
  [key: string]: any
}

export function makeBuilder(result: QueryResult): MockBuilder {
  const calls: RecordedCall[] = []
  const builder: any = {
    calls,
    argsOf: (method: string) => calls.find((c) => c.method === method)?.args,
  }

  for (const method of CHAIN_METHODS) {
    builder[method] = jest.fn((...args: unknown[]) => {
      calls.push({ method, args })
      return builder
    })
  }

  // `.single()` ve doğrudan `await` edilen zincir aynı sonucu verir.
  builder.single = jest.fn(() => {
    calls.push({ method: 'single', args: [] })
    return Promise.resolve(result)
  })
  builder.maybeSingle = builder.single
  builder.then = (onOk: any, onErr: any) => Promise.resolve(result).then(onOk, onErr)

  return builder as MockBuilder
}

/**
 * `supabase.from()` sahtesini kurar. Dönen nesneden son kullanılan kurucuya
 * ve hangi tablonun sorgulandığına erişilebilir.
 *
 * Tek bir sonuç verilirse her `from()` çağrısı onu döndürür. Dizi verilirse
 * sonuçlar SIRAYLA tüketilir — bir action birden çok sorgu yapıyorsa
 * (ör. createProduct önce slug çakışmasına bakar, sonra ekler) gerekir.
 */
export function mockFrom(supabase: { from: unknown }, result: QueryResult | QueryResult[]) {
  const queue = Array.isArray(result) ? [...result] : null
  const builders: MockBuilder[] = []
  const from = supabase.from as jest.Mock
  from.mockReset()
  from.mockImplementation(() => {
    const next = queue ? (queue.shift() ?? { data: null, error: null }) : (result as QueryResult)
    const b = makeBuilder(next)
    builders.push(b)
    return b
  })

  // `const { builder } = mockFrom(...)` sorgudan ÖNCE yazılıyor; o yüzden
  // burada canlı bir vekil dönüyoruz — her erişim en son kurucuyu gösterir.
  const liveBuilder = new Proxy({} as MockBuilder, {
    get: (_t, prop) => {
      const b = builders.at(-1)
      if (!b) throw new Error('Henüz supabase.from() çağrılmadı')
      return (b as any)[prop]
    },
  })

  return {
    /** Son kullanılan kurucu (tek sorgulu testlerde beklenen davranış). */
    builder: liveBuilder,
    /** Sıradaki kurucular — çok sorgulu action'lar için. */
    builders,
    /** En son sorgulanan tablo adı. */
    lastTable: () => from.mock.calls.at(-1)?.[0] as string | undefined,
    from,
  }
}
