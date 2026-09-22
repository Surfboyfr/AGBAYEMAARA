import { Outlet } from 'react-router-dom'
import ShopNavbar from '../Components/ShopNavbar'
import Footer from '../Components/Footer'

const ShopLayout = () => {
  return (
    <>
      <div className="min-h-screen bg-surface">
        <ShopNavbar />
        <main>
             <Outlet />
        </main>
      </div>
      <Footer />
    </>
  )
}

export default ShopLayout