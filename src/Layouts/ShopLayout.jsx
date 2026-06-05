import { Outlet } from 'react-router-dom'
import ShopNavbar from '../Components/ShopNavbar'
import CartDrawer from '../Components/CartDrawer'
import { CartProvider } from '../context/CartContext'
import Footer from '../Components/Footer'

const ShopLayout = () => {
  return (
    <>
    <CartProvider>
      <div className="min-h-screen bg-white">
        <ShopNavbar />
        <main>
          <Outlet />
        </main>
        <CartDrawer />
        </div>
        <Footer />
    </CartProvider>
      

  </>
  )
}

export default ShopLayout