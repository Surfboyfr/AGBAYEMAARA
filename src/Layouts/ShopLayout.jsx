import { Outlet } from 'react-router-dom'
import ShopNavbar from '../Components/ShopNavbar'
import CartDrawer from '../Components/CartDrawer'
import Footer from '../Components/Footer'

const ShopLayout = () => {
  return (
    <>
      <div className="min-h-screen bg-white">
        <ShopNavbar />
        <main>
             <Outlet />
        </main>
        <CartDrawer />
      </div>
      <Footer />
    </>
  )
}

export default ShopLayout