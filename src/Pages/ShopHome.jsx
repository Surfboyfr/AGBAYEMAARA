import ProductCard from '../Components/ProductCard'
import { useState } from 'react'
import { products } from '../data/products'
import { useLanguage } from '../Context/LanguageContext'

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

  return (
    <section>
      <div className='flex flex-col gap-5 lg:w-full mb-6 lg:mb-0 p-5'>
        <h3 className='font-bold text-2xl text-black'>{t('shopHome', 'title')}</h3>
        <div className='lg:w-full ml-2 p-3'>
          <input
            type='search'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('shopHome', 'searchPlaceholder')}
            aria-label={t('shopHome', 'searchAriaLabel')}
            className='border border-gray-200 rounded-md py-2 px-2  focus:ring-2  lg:w-3/4 w-full focus:outline-orange-500 shadow-sm'
          />
        </div>

        <div className='ml-2 px-3 space-y-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => {
              const isActive = activeCategory === category.value
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#0A0B0F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
          </div>

          <div className='flex flex-wrap gap-2'>
            {genderFilters.map((filter) => {
              const isActive = activeGender === filter.value
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveGender(filter.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'border-[#0A0B0F] bg-[#0A0B0F] text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div id='product-grid' className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 m-5'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className='col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600'>
            {t('shopHome', 'noProductsMessage')}
          </div>
        )}
      </div>
    </section>
  )
}

export default ShopHome