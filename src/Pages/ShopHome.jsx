import ProductCard from '../Components/ProductCard'
import DiscountPopup from '../Components/DiscountPopup'
import { useState } from 'react'
import { products } from '../data/products'
import { useLanguage } from '../Context/LanguageContext'
import { Tag } from 'lucide-react'

const ShopHome = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeGender, setActiveGender] = useState('All')
  const { t } = useLanguage()

  const categories = [
    { label: t('shopHome', 'categories.all'), value: 'All' },
    { label: t('shopHome', 'categories.clothes'), value: 'Clothes' },
    { label: t('shopHome', 'categories.shoes'), value: 'Shoes' },
    { label: t('shopHome', 'categories.bags'), value: 'Bags' },
    { label: t('shopHome', 'categories.jewelries'), value: 'Jewelries' },
    { label: t('shopHome', 'categories.hats'), value: 'Hats' },
  ]

  const genderFilters = [
    { label: t('shopHome', 'genderFilters.all'), value: 'All' },
    { label: t('shopHome', 'genderFilters.female'), value: 'female' },
    { label: t('shopHome', 'genderFilters.male'), value: 'male' },
  ]

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    const searchableText = [
      product.productName,
      product.brand,
      product.category,
      product.description,
      product.overview,
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      normalizedSearchTerm === '' || searchableText.includes(normalizedSearchTerm)

    const matchesCategory =
      activeCategory === 'All' ||
      product.category === activeCategory ||
      (activeCategory === 'Clothes' && ['Women', 'Men', 'Unisex'].includes(product.category))

    const matchesGender =
      activeGender === 'All' ||
      product.gender === activeGender

    return matchesSearch && matchesCategory && matchesGender
  })

  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false)

  const newInProducts = products.filter((product) => product.isNew)
  const onSaleProducts = products.filter((product) => product.onSale)

  return (
    <>
      <DiscountPopup />

      {/* Search & Filters Section — always at top */}
      <section className='flex flex-col gap-5 w-full p-5 pt-8'>
        <div className='w-full ml-2 p-3'>
          <input
            type='search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('shopHome', 'searchPlaceholder')}
            aria-label={t('shopHome', 'searchAriaLabel')}
            className='border border-orange-300 rounded-full py-2 px-4 focus:ring-2 focus:ring-[#ec5800]/30 lg:w-3/4 w-full outline-none focus:outline-[#ec5800] shadow-sm'
          />
        </div>

        <div className='w-full flex items-center justify-center gap-3 sm:gap-4 flex-wrap'>
          {categories.map((category) => {
            const isActive = activeCategory === category.value
            return (
              <button
                key={category.value}
                onClick={() => { setActiveCategory(category.value); setShowOnSaleOnly(false) }}
                className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive && !showOnSaleOnly
                    ? 'bg-[#0A0B0F] text-white'
                    : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
                }`}
              >
                {category.label}
              </button>
            )
          })}
          <span className='hidden sm:inline text-faint text-sm'>|</span>
          {genderFilters.map((filter) => {
            const isActive = activeGender === filter.value
            return (
              <button
                key={filter.value}
                onClick={() => { setActiveGender(filter.value); setShowOnSaleOnly(false) }}
                className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive && !showOnSaleOnly
                    ? 'bg-[#0A0B0F] text-white'
                    : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
          <span className='hidden sm:inline text-faint text-sm'>|</span>
          <button
            onClick={() => setShowOnSaleOnly(!showOnSaleOnly)}
            className={`rounded-full px-5 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              showOnSaleOnly
                ? 'bg-[#ec5800] text-white shadow-md'
                : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
            }`}
          >
            <Tag size={14} />
            {t('shopHome', 'onSale')}
          </button>
        </div>
      </section>

      {/* On Sale Section (when toggled) */}
      {showOnSaleOnly && onSaleProducts.length > 0 && (
        <section className='px-5 py-4'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-8 w-1 bg-[#ec5800] rounded-full'></div>
            <h2 className='font-bold text-2xl text-strong tracking-tight'>{t('shopHome', 'onSale')}</h2>
            <span className='bg-[#ec5800]/10 text-[#ec5800] text-xs font-semibold px-3 py-1 rounded-full'>{onSaleProducts.length}</span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {onSaleProducts.map((product) => (
              <div key={product.id} className='relative'>
                <div className='absolute top-3 left-3 z-10 bg-[#ec5800] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1'>
                  <Tag size={10} />
                  -25%
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New In Section */}
      {newInProducts.length > 0 && (
        <section className='px-5 py-4'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-8 w-1 bg-[#ec5800] rounded-full'></div>
            <h2 className='font-bold text-2xl text-strong tracking-tight'>{t('shopHome', 'newIn')}</h2>
            <span className='bg-[#ec5800]/10 text-[#ec5800] text-xs font-semibold px-3 py-1 rounded-full'>{newInProducts.length}</span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {newInProducts.map((product) => (
              <div key={product.id} className='relative'>
                <div className='absolute top-3 left-3 z-10 bg-[#ec5800] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md'>
                  NEW
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Separator + All Products Grid */}
      {!showOnSaleOnly && (
        <>
          <div className='px-5'>
            <div className='flex items-center gap-3 py-4'>
              <div className='h-8 w-1 bg-[#ec5800] rounded-full'></div>
              <h2 className='font-bold text-2xl text-strong tracking-tight'>{t('shopHome', 'title')}</h2>
            </div>
          </div>
          <div id='product-grid' className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 m-5'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className='col-span-full rounded-xl border border-dashed border-line-strong bg-raised p-8 text-center text-muted'>
            {t('shopHome', 'noProductsMessage')}
          </div>
        )}
      </div>
        </>
      )}
    </>
  )
}

export default ShopHome