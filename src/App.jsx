import { Routes, Route } from 'react-router-dom'
import './App.css'
import CartDrawer from './Components/CartDrawer'
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
    <>
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
    </>
  )
}

export default App
