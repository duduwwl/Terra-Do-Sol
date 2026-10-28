import { MotionConfig } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AddedToast } from './components/AddedToast'
import { CartDrawer } from './components/CartDrawer'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { CartProvider } from './state/cart'
import { HomePage } from './pages/Home'
import { CatalogPage } from './pages/Catalog'

const ProductPage = lazy(() => import('./pages/Product'))
const CartPage = lazy(() => import('./pages/Cart'))
const CheckoutPage = lazy(() => import('./pages/Checkout'))
const OrderPage = lazy(() => import('./pages/Order'))
const AboutDemoPage = lazy(() => import('./pages/AboutDemo'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function PageFallback() {
  return (
    <div className="wrap flex min-h-[50vh] items-center justify-center" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-palmeira/20 border-t-palmeira" />
      <span className="sr-only">Carregando página</span>
    </div>
  )
}

// pré-carrega as páginas mais usadas quando o navegador estiver ocioso
function usePrefetchRoutes() {
  useEffect(() => {
    const run = () => {
      import('./pages/Product')
      import('./pages/Checkout')
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(run)
    else window.setTimeout(run, 2000)
  }, [])
}

export function App() {
  usePrefetchRoutes()
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <a href="#conteudo" className="sr-only z-[60] rounded-full bg-palmeira px-4 py-2 text-nuvem focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Pular para o conteúdo
        </a>
        <ScrollReset />
        <Header />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<CatalogPage />} />
              <Route path="/produto/:slug" element={<ProductPage />} />
              <Route path="/sacola" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedido/:id" element={<OrderPage />} />
              <Route path="/sobre-a-demonstracao" element={<AboutDemoPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CartDrawer />
        <AddedToast />
      </CartProvider>
    </MotionConfig>
  )
}
