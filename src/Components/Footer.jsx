import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
     <div className="bg-[#0A0B0F] w-full lg:grid lg:grid-cols-3 items-center justify-items-center py-5">
        <div>
        <p className='text-center text-white py-5'>© 2026 Agbayemaara. All rights reserved.</p>
        </div>
        <div>
           <p className='text-center text-white py-5'>Privacy Policy | Terms of Service</p>
        </div>
        <div>
           <p className='text-center text-white py-5'>Follow us on social media</p>
           <div className='flex justify-center gap-8'>
              <FaFacebook className='text-white text-2xl' />
              <FaTwitter className='text-white text-2xl' />
              <FaInstagram className='text-white text-2xl' />
             </div>

        </div>
        
    </div>
  )
}

export default Footer