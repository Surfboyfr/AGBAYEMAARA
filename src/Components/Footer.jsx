import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { SiTiktok } from 'react-icons/si'

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
              <SiTiktok className='text-white text-2xl' />
             </div>

                <div className='flex justify-center pt-6'>
                     <a
                        href='https://wa.me/'
                        className='inline-flex items-center gap-2 rounded-full border-2 border-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-400/10 hover:text-white'
                     >
                        <FaWhatsapp className='text-lg' />
                        Join our community
                     </a>
                </div>

        </div>
        
    </div>
  )
}

export default Footer