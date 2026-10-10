import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import BootFlow from './Components/BootFlow'
import CartDrawer from './Components/CartDrawer'
import AdminDashboard from './Pages/AdminDashboard'
import BrandOwner from './Pages/BrandOwner'
import DiscoveryFeed from './Pages/DiscoveryFeed'
import FollowingFeed from './Pages/FollowingFeed'
import LandingPage from './Pages/LandingPage'
import ShopHome from './Pages/ShopHome'
import ShopLayout from './Layouts/ShopLayout'
import Checkout from './Pages/Checkout'
import Orders from './Pages/Orders'
import OrderStatus from './Pages/OrderStatus'
import Brands from './Pages/Brands'
import MainLayout from './Layouts/MainLayout'
import ProductDetails from './Pages/ProductDetails'
import BrandDetails from './Pages/BrandDetails'
import BrandStory from './Pages/BrandStory'
// Seller portal (frontend-only) — lives in its own route tree so the shopper
// boot flow (splash → sign-up) and cart drawer never touch it.
import { SellerProvider } from './Context/SellerContext'
import { getToken } from './lib/api'
import SellerLayout from './Layouts/SellerLayout'
import SellerLogin from './Pages/seller/SellerLogin'
import SellerDashboard from './Pages/seller/SellerDashboard'
import SellerInventory from './Pages/seller/SellerInventory'
import SellerProducts from './Pages/seller/SellerProducts'
import SellerOrders from './Pages/seller/SellerOrders'
import SellerProfile from './Pages/seller/SellerProfile'

function App() {
  const { pathname } = useLocation()

  // ── Seller portal routes ──────────────────────────────────────────────────
  // Mounted outside BootFlow: onboarding is for shoppers/brand owners, and
  // /seller/* must be directly reachable (e.g. refreshing /seller/dashboard).
  // Auth: /seller/login performs a real POST /auth/login (plus a vendor-profile
  // probe), and every other /seller/* URL requires a stored session token —
  // tokenless loads bounce to the login screen.
  if (pathname === '/seller' || pathname.startsWith('/seller/')) {
    if (pathname !== '/seller/login' && !getToken()) {
      return <Navigate to='/seller/login' replace />
    }
    return (
      <SellerProvider>
        <Routes>
          <Route path='/seller/login' element={<SellerLogin />} />
          <Route path='/seller' element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path='dashboard' element={<SellerDashboard />} />
            <Route path='inventory' element={<SellerInventory />} />
            <Route path='products' element={<SellerProducts />} />
            <Route path='orders' element={<SellerOrders />} />
            <Route path='profile' element={<SellerProfile />} />
            <Route path='*' element={<Navigate to='/seller/dashboard' replace />} />
          </Route>
        </Routes>
      </SellerProvider>
    )
  }

  // ── Admin console ──────────────────────────────────────────────────────────
  // Mounted outside BootFlow (like the seller portal): /admin is a direct
  // entry point that watches both surfaces instead of onboarding into one of
  // them. SellerProvider wraps it so the seller catalogue/order state it
  // reports on is readable here. NOTE: like /seller/*, this route is NOT
  // authenticated yet — real admin auth arrives with the backend.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <SellerProvider>
        <Routes>
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='*' element={<Navigate to='/admin' replace />} />
        </Routes>
      </SellerProvider>
    )
  }

  // ── Legacy /welcome URL ──────────────────────────────────────────────────
  // The Welcome page is now part of the boot sequence — BootFlow renders it
  // right after the loading splash — so old /welcome links rejoin the flow
  // at /: splash → Welcome → Get Started → the discovery feed.
  if (pathname === '/welcome' || pathname.startsWith('/welcome/')) {
    return <Navigate to='/' replace />
  }

  // ── Present landing page (/about) — outside BootFlow ──────────────────────
  // The former landing/marketing content (Marquee, About, Contact, Footer).
  // It sits OUTSIDE the gate so it loads directly: no splash, no sign-up step
  // — it behaves like the public marketing page it is. (Get Started on the
  // Welcome screen leads to the discovery feed; this page is reached by URL.)
  if (pathname === '/about') {
    return (
      <>
        <Routes>
          <Route
            path='/about'
            element={
              <section className='bg-[#0A0B0F] w-full'>
                <LandingPage />
              </section>
            }
          />
        </Routes>
        {/* App-wide drawer stays reachable from the landing navbar's Cart. */}
        <CartDrawer />
      </>
    )
  }

  return (
    <BootFlow>
    <Routes>
      <Route path='/' element={<MainLayout />}>
        {/* Discovery feed is the home surface */}
        <Route index element={<DiscoveryFeed />} />
        <Route path='following' element={<FollowingFeed />} />
        {/* The landing content lives at /about OUTSIDE BootFlow (see the
            branch above) so it loads directly by URL. */}
        <Route path='brands' element={<Brands />} />
        <Route path='brands/:brandSlug' element={<BrandDetails />} />
        <Route path='brands/:brandSlug/story/:storyId' element={<BrandStory />} />
        {/* Brand-owner hub — a stored brand role still routes owners here */}
        <Route path='brand-owner' element={<BrandOwner />} />
      </Route>
      <Route path='/shop' element={<ShopLayout />}>
        <Route index element={<ShopHome />} />
        <Route path='product/:productId' element={<ProductDetails />} />
      </Route>
      <Route path='/checkout' element={<Checkout />} />
      <Route path='/orders' element={<Orders />} />
      <Route path='/orders/:orderId' element={<OrderStatus />} />
      </Routes>
      {/* App-wide cart drawer — mounted once so the seven-surface IA puts Cart
          within reach from every navbar (shop, discovery, landing). */}
      <CartDrawer />
    </BootFlow>
  )
}

export default App
