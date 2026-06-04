import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='flex justify-between items-center lg:py-3 px-6 bg-[#0A0B0F] text-white font-bold lg:fixed lg:w-full  '>
      
      <div className='w-full py-5 lg:py-3 font-semibold text-center text-white text-xl'>
       <p> Agbayemaara</p>
      </div>
      <div className='hidden md:flex gap-6'>

        <Link to="/" className='hover:text-gray-400 transition-colors duration-300'>Home</Link>
       
        <Link to="#about" className='hover:text-gray-400 transition-colors duration-300'>About</Link>

        <Link to="/contact" className='hover:text-gray-400 transition-colors duration-300'>Contact</Link>

      </div>
    </div>
  )
}

export default NavBar