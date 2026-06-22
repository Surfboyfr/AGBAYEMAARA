import { Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './Pages/LandingPage'
import ShopHome from './Pages/ShopHome'
import ShopLayout from './Layouts/ShopLayout'
import Brands from './Pages/Brands'
import MainLayout from './Layouts/MainLayout'
import ProductDetails from './Pages/ProductDetails'
import BrandDetails from './Pages/BrandDetails'

function App() {

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
            <Route
              index
              element={
                <section className='bg-[#0A0B0F] w-full'>
                    <LandingPage />
                </section>
              }
            />
            <Route path="brands" element={<Brands />} />
            <Route path="brands/:brandSlug" element={<BrandDetails />} />
      </Route>
      


      <Route path="/shop" element={<ShopLayout />}>
            {/* Homepage inside shop */}
              <Route index element={<ShopHome />} />
              <Route path="product/:productId" element={<ProductDetails />} />
      </Route>
        
      </Routes>
  
  )
}
 
export default App

     
