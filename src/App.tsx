import { HashRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Header } from './components/Header'
import { DemoBanner } from './components/DemoBanner'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { useI18n } from './i18n/I18nContext'

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <div className="container">
        <p>{t('footer')}</p>
        <p className="muted">
          <a href="https://github.com/companysibex-png/KamCo-App" target="_blank" rel="noreferrer">GitHub</a>
          {' · '}
          <a href="https://github.com/companysibex-png/KamCo" target="_blank" rel="noreferrer">KamCo API</a>
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          {/* HashRouter: works unchanged on GitHub Pages, Capacitor webviews and TWAs */}
          <HashRouter>
            <div className="app-shell">
              <DemoBanner />
              <Header />
              <Routes>
                <Route path="/" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="*" element={<ProductsPage />} />
              </Routes>
              <Footer />
            </div>
          </HashRouter>
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
