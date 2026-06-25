import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import hero from '../assets/phone-ui.jfif'
import image1 from '../assets/brand1.jfif'
import image2 from '../assets/brand2.jfif'
import image3 from '../assets/brand3.jfif'
import image4 from '../assets/brand4.jfif'
import image5 from '../assets/brand5.jfif'
import image6 from '../assets/image6.jfif'
import image7 from '../assets/image7.jfif'
import image8 from '../assets/image8.jfif'
import { useLanguage } from '../Context/LanguageContext'

const slides = [
  { id: 1, productName: 'Ankara Wrap Dress', productPrice: 89.99, productImage: image1, brand: 'Lisa Folawiyo' },
  { id: 2, productName: 'Adire Print Blazer', productPrice: 129.99, productImage: image2, brand: 'ATAFO' },
  { id: 3, productName: 'Kente Maxi Skirt', productPrice: 74.99, productImage: image3, brand: 'Andrea Iyamah' },
  { id: 4, productName: 'Wax Print Jumpsuit', productPrice: 109.99, productImage: image4, brand: 'Orange Culture' },
  { id: 5, productName: 'Agbada Set', productPrice: 199.99, productImage: image5, brand: 'Yomi Casual' },
  { id: 6, productName: 'Dashiki Tee', productPrice: 44.99, productImage: image6, brand: 'Ashluxe' },
  { id: 7, productName: 'Beaded Kaftan', productPrice: 159.99, productImage: image7, brand: 'Deola Sagoe' },
  { id: 8, productName: 'Lace Overlay Gown', productPrice: 219.99, productImage: image8, brand: 'Wanni Fuga' },
]

const Hero = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <section className='w-full flex flex-col p-6 px-8 items-center justify-center gap-10 lg:py-10 lg:px-16 lg:h-150vh lg:flex-col'>
      <div className='flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 mt-30'>
        <div className='w-full lg:w-1/2 lg:px-8'>
          <h3 className='text-4xl leading-17 mb-7 font-bold text-white gap-7 tracking-normal lg:text-5xl'>
            {t('hero', 'heading')}
          </h3>
          <p className='text-white'>{t('hero', 'blurb')}</p>
          <div className='m-3 mt-9 flex justify-evenly lg:justify-start lg:flex lg:gap-4 lg:mt-6'>
            <button className='bg-white text-black lg:px-4 lg:py-2 rounded-3xl px-5 py-3 hover:bg-[#ec5800] hover:text-white' onClick={() => navigate('/shop')}>
              {t('hero', 'shopNow')}
            </button>
            <button className='bg-[#988558] text-white lg:px-4 lg:py-2 rounded-3xl px-5 py-3'>
              {t('hero', 'downloadApp')}
            </button>
          </div>
        </div>
        <div className='w-full lg:w-1/2 '>
          <img src={hero} alt='Hero Image' className='w-full h-80 rounded-xl mr-5' />
        </div>
      </div>
      <div className='w-full lg:mx-11'>
        <div className='mb-4 flex items-center justify-between px-1'>
          <h4 className='text-lg font-semibold text-white sm:text-xl'>{t('hero', 'featuredBrands')}</h4>
          <Link to='/brands' className='text-sm font-medium text-[#ec5800] transition hover:text-[#ff7f2a]'>{t('hero', 'viewAllBrands')}</Link>
        </div>

        <div className='hero-marquee-container rounded-[20px] border border-white/10 bg-black/20 p-3 shadow-2xl shadow-black/20'>
          <div className='hero-marquee-track'>
            {[...slides, ...slides].map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className='hero-marquee-card group relative h-56 w-52 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg sm:h-64 sm:w-60'
              >
                <img
                  src={slide.productImage}
                  alt={slide.brand}
                  className='h-full w-full object-cover transition duration-500 group-hover:brightness-50'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent' />
                <div className='absolute inset-0 flex flex-col justify-end p-4'>
                  <p className='text-sm font-semibold text-white'>{slide.brand}</p>
                  <p className='text-xs text-white/80'>{slide.productName}</p>
                  <div className='mt-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
                    <Link
                      to='/brands'
                      className='inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[#ec5800] hover:text-white'
                    >
                      {t('hero', 'exploreBrand')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero