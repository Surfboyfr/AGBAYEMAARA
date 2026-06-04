import React from 'react'
import { Link } from 'react-router-dom'
import { User} from "lucide-react"

const ShopNavbar = () => {
  return (
     <div>
        <nav className='bg-[#0A0B0F] w-full flex items-center justify-between gap-5 py-5 mx-auto px-5'>
           <div>
              
              <Link to="/shop" className='text-white hover:text-gray-400 transition-colors duration-300'>
                 <h3 className='text-white text-xl font-bold'>Agbayemaara</h3>
              </Link>
           </div>
        <div className='flex gap-7 lg:mr-5'>
        <Link to="/shop" className='text-white hover:text-gray-400 transition-colors duration-300'>Shop</Link>
        <Link to="/" className='text-white hover:text-gray-400 transition-colors duration-300'>Home</Link>
        <Link to="/shop/cart" className='text-white hover:text-gray-400 transition-colors duration-300'>Cart</Link>
              <Link to="/shop/profile" className='text-white hover:text-gray-400 transition-colors duration-300'>
                 <User />
              </Link>
              </div>
      </nav>
    </div>
  )
}

export default ShopNavbar