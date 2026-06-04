import React from 'react'
import {useNavigate} from 'react-router-dom'
import phoneUi from '../assets/phone-ui.jfif'
const Hero = () => {
  const navigate = useNavigate()
  return (
     <>
        <section className='w-full flex flex-col p-6 px-8 items-center justify-center gap-10 lg:py-10 lg:px-12 lg:h-screen lg:flex-row'>
           <div className=' w-full   lg:w-1/2 lg:px-8'>
              <h3 className=" text-4xl leading-17 mb-7 font-bold text-white gap-7 tracking-normal lg:text-5xl "> Discover The Best African Talent</h3>
              <p className='text-white'>From their feed to your closet. Own the pieces your favorites are rocking. Shop the looks you love.</p>
              <div className='m-3 mt-9 flex justify-evenly lg:justify-start lg:flex lg:gap-4 lg:mt-6'>
                <button className='bg-white text-black lg:px-4 lg:py-2 rounded-3xl px-5 py-3' onClick={() => navigate('/shop')}>Shop Now</button>
                <button className='bg-white text-black lg:px-4 lg:py-2 rounded-3xl px-5 py-3'>Download App</button>
              </div>
           </div>
           <div className='w-full lg:w-1/2'>
              <img src={phoneUi} alt="Phone UI" className='w-full h-auto rounded-xl' />
           </div>
        </section>
     </>
  )
}

export default Hero