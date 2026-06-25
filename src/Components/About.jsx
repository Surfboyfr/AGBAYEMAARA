import React from 'react'
import Image from '../assets/About-img.jfif'
import { useLanguage } from '../Context/LanguageContext'

const About = () => {
  const { t } = useLanguage()

  return (
    <div id='about' className='px-9 mt-11 lg:flex lg:p-3 lg:gap-5 md:flex lg:items-center lg:px-25 lg:flex-row lg:mb-20'>
      <div className='flex flex-col gap-5 lg:w-2/3 mb-15 lg:mb-0 lg:pr-10'>
        <h1 className='font-bold text-2xl text-white'>{t('about', 'heading')}</h1>
        <p className='text-gray-300'>{t('about', 'body1')}</p>
        <p className='text-gray-300'>{t('about', 'body2')}</p>
      </div>
      <div className='lg:w-1/3 lg:h-100 mt-5 lg:mt-10'>
        <img src={Image} alt='About-image' className='w-full object-top object-cover h-full' />
      </div>
    </div>
  )
}

export default About