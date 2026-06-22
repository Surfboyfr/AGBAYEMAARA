import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroImg from '../assets/HeroImg.jfif'
import image1 from '../assets/brand1.jfif'
import image2 from '../assets/brand2.jfif'
import image3 from '../assets/brand3.jfif'
import image4 from '../assets/brand4.jfif'
import image5 from '../assets/brand5.jfif'
import image6 from '../assets/image6.jfif'
import image7 from '../assets/image7.jfif'
import image8 from '../assets/image8.jfif'

const INITIAL_DELAY = 100;
const TRANSITION_DELAY = 500;
const SLIDE_DURATION = 4500;


const slides = [
   {
      id: 1,
      productName: "Ankara Wrap Dress",
      productPrice: 89.99,
      productImage: image1, brand: "Lisa Folawiyo"
   },
   {
      id: 2,
      productName: "Adire Print Blazer",
      productPrice: 129.99,
      productImage: image2, brand: "ATAFO"
   },
   {
      id: 3,
      productName: "Kente Maxi Skirt",
      productPrice: 74.99,
      productImage: image3, brand: "Andrea Iyamah"
   },
   {
      id: 4,
      productName: "Wax Print Jumpsuit",
      productPrice: 109.99,
      productImage: image4, brand: "Orange Culture"
   },
   {
      id: 5,
      productName: "Agbada Set",
      productPrice: 199.99,
      productImage: image5, brand: "Yomi Casual"
   },
   {
      id: 6,
      productName: "Dashiki Tee",
      productPrice: 44.99,
      productImage: image6, brand: "Ashluxe"
   },
   {
      id: 7,
      productName: "Beaded Kaftan",
      productPrice: 159.99,
      productImage: image7, brand: "Deola Sagoe"
   },
   {
      id: 8,
      productName: "Lace Overlay Gown",
      productPrice: 219.99,
      productImage: image8, brand: "Wanni Fuga"
   },
]




const Hero = () => {
   const navigate = useNavigate()
   
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
  const visibilityTimeout = setTimeout(() => {
    setIsVisible(true);
  }, INITIAL_DELAY);

  const slideInterval = setInterval(() => {
    setIsVisible(false);

    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsVisible(true);
    }, TRANSITION_DELAY);
  }, SLIDE_DURATION);

  return () => {
    clearTimeout(visibilityTimeout);
    clearInterval(slideInterval);
  };
}, []);
   
  return (
     <>
        <section className='w-full flex flex-col p-6 px-8 items-center justify-center gap-10 lg:py-10 lg:px-12 lg:h-150vh lg:flex-col'>
           <div className='flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 mt-15'>
           <div className=' w-full   lg:w-1/2 lg:px-8'>
              <h3 className=" text-4xl leading-17 mb-7 font-bold text-white gap-7 tracking-normal lg:text-5xl "> Discover The Best African Talent</h3>
              <p className='text-white'>From their feed to your closet. Own the pieces your favorites are rocking. Shop the looks you love.</p>
              <div className='m-3 mt-9 flex justify-evenly lg:justify-start lg:flex lg:gap-4 lg:mt-6'>
                <button className='bg-white text-black lg:px-4 lg:py-2 rounded-3xl px-5 py-3 hover:bg-[#ec5800] hover:text-white' onClick={() => navigate('/shop')}>Shop Now</button>
                <button className='bg-[#988558] text-white lg:px-4 lg:py-2 rounded-3xl px-5 py-3'>Download App</button>
              </div>
           </div>
           <div className='w-full lg:w-1/2'>
              <img src={HeroImg} alt="Hero Image" className='w-full h-80 rounded-xl' />
           </div>
           </div>
           <div className={`w-full lg:block lg:mx-11  transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{
              backgroundImage: `url(${slides[currentSlide].productImage})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              height: '400px',
              borderRadius: '10px',
              transition: `opacity ${TRANSITION_DELAY}ms`
           }}>
              
           </div>

        </section>
     </>
  )
}

export default Hero