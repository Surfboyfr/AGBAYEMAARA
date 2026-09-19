import { Routes, Route } from 'react-router-dom'
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

function App() {
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
