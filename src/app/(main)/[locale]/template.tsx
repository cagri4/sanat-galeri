import PageTransition from '@/components/motion/page-transition'

/**
 * template.tsx (layout.tsx degil): her navigasyonda yeniden mount edilir,
 * bu yuzden sayfa gecis animasyonu her rota degisiminde tetiklenir.
 */
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
