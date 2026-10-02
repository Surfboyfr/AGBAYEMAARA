import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import BootFlow from './Components/BootFlow'
import CartDrawer from './Components/CartDrawer'
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
// boot gate (splash → role → sign-up) and cart drawer never touch it.
import { SellerProvider } from './Context/SellerContext'
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
  // NOTE: these routes are NOT authenticated — login is a visual mock until
  // real auth + backend authorization land.
  if (pathname === '/seller' || pathname.startsWith('/seller/')) {
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

  return (
    <BootFlow>
    <Routes>
      <Route path='/' element={<MainLayout />}>
        {/* Discovery feed is the home surface */}
        <Route index element={<DiscoveryFeed />} />
        <Route path='following' element={<FollowingFeed />} />
        {/* Former landing/marketing content moved to /about */}
        <Route
          path='about'
          element={
            <section className='bg-[#0A0B0F] w-full'>
              <LandingPage />
            </section>
          }
        />
        <Route path='brands' element={<Brands />} />
        <Route path='brands/:brandSlug' element={<BrandDetails />} />
        <Route path='brands/:brandSlug/story/:storyId' element={<BrandStory />} />
        {/* Brand-owner hub — boot gate routes brand owners here */}
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
