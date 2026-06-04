import {Outlet} from 'react-router-dom'
import Footer from '../Components/Footer'
import ShopNavbar from '../Components/ShopNavbar'




const ShopLayout = () => {
  return (
    <div>
    
      <ShopNavbar />
      <main>
        <Outlet />
      </main> 
    </div>
  )
}

export default ShopLayout