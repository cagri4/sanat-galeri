import data from '../../scripts/data/drive-import-2026-10.json'
import { SERGI_KUNYE, yeniIcerikAcik } from '@/lib/yeni-icerik'

describe('gizli içerik bayrağı', () => {
  const ENV = process.env.UART_YENI_ICERIK
  afterAll(() => { process.env.UART_YENI_ICERIK = ENV })
  it('varsayılan KAPALI — sergi/yapım fotoğrafları kendiliğinden açılmaz', () => {
    delete process.env.UART_YENI_ICERIK
    expect(yeniIcerikAcik()).toBe(false)
    process.env.UART_YENI_ICERIK = 'evet'
    expect(yeniIcerikAcik()).toBe(false)
    process.env.UART_YENI_ICERIK = 'true'
    expect(yeniIcerikAcik()).toBe(true)
  })
  it('sergi künyesi anahtarları içe aktarılan sergi anahtarlarıyla birebir', () => {
    expect(Object.keys(SERGI_KUNYE).sort()).toEqual(Object.values(data.sergiler).sort())
  })
})
