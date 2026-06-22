import React from 'react'
import Image from '../assets/About-img.jfif'

const About = () => {
  return (
     <div id="about" className='px-9 mt-11 lg:flex lg:p-3 lg:gap-5 md:flex  lg:items-center lg:px-25 lg:flex-row lg:mb-20'>
        <div className="flex flex-col gap-5 lg:w-2/3 mb-15 lg:mb-0 lg:pr-10 ">
        <h1 className='font-bold text-2xl text-white'>About Us</h1>
        <p className='text-gray-300'>Agbayemaara is a fashion e-commerce platform that celebrates African talent and culture. We are dedicated to showcasing the best of African fashion, connecting customers with unique and stylish pieces from across the continent. Our mission is to empower African designers and artisans while providing our customers with an exceptional shopping experience.</p>
        <p className='text-gray-300'>At Agbayemaara, we believe in the power of fashion to tell stories and express individuality. We curate a diverse collection of clothing, accessories, and footwear that reflects the rich tapestry of African culture and creativity. Whether you're looking for traditional prints, contemporary designs, or statement pieces, you'll find it all here.</p>
        
        </div>
        <div className="lg:w-1/3 lg:h-100 mt-5 lg:mt-10">
           <img src={Image} alt="About-image" className="w-full object-top object-cover h-full " />
        </div>



    </div>
  )
}

export default About