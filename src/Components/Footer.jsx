import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { SiTiktok } from 'react-icons/si'
import { useLanguage } from '../Context/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()

  return (
    <div className='bg-surface w-full lg:grid lg:grid-cols-3 items-center justify-items-center py-5 mt-10'>
      <div>
        <p className='text-center text-strong py-5'>{t('footer', 'rights')}</p>
      </div>
      <div>
        <p className='text-center text-strong py-5'>
          {t('footer', 'privacy')} | {t('footer', 'terms')}
        </p>
      </div>
      <div>
        <p className='text-center text-strong py-5'>{t('footer', 'follow')}</p>
        <div className='flex justify-center gap-8'>
          <FaFacebook className='text-strong text-2xl transition-all duration-300 hover:text-[#1877F2] hover:scale-110' />
          <a href='https://x.com/agbayemaara?s=11' target='_blank' rel='noopener noreferrer'>
            <FaXTwitter className='text-strong text-2xl transition-all duration-300 hover:text-gray-300 hover:scale-110' />
          </a>
          <FaInstagram className='text-strong text-2xl transition-all duration-300 hover:text-[#E1306C] hover:scale-110' />
          <a href='https://www.tiktok.com/@agbayemaara?_r=1&_t=ZS-98PsTPNlDui' target='_blank' rel='noopener noreferrer'>
            <SiTiktok className='text-strong text-2xl transition-all duration-300 hover:text-[#00F2EA] hover:scale-110' />
          </a>
        </div>

        <div className='flex justify-center pt-6'>
          <a href='https://wa.me/' className='inline-flex items-center gap-2 rounded-full border-2 border-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-400/10 hover:text-strong'>
            <FaWhatsapp className='text-lg' />
            {t('footer', 'join')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer