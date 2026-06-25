import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Package, ShoppingBag, Star } from 'lucide-react'
import { getBrandBySlug, getProductsByBrandSlug } from '../data/brands'
import ProductCard from '../Components/ProductCard'
import { useLanguage } from '../Context/LanguageContext'

const BrandDetails = () => {
  const { brandSlug } = useParams()
  const brand = getBrandBySlug(brandSlug)
  const brandProducts = getProductsByBrandSlug(brandSlug)
  const { t } = useLanguage()

  if (!brand) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className='text-2xl font-bold text-black'>{t('brandDetails', 'notFound')}</p>
        <Link to='/brands' className='text-sm font-medium text-[#f28500] hover:underline'>
          {t('brandDetails', 'backToBrands')}
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-[#0A0B0F] text-white min-h-screen">
      <div className={`bg-linear-to-br ${brand.accent} px-5 py-14 lg:py-18`}>
        <div className="max-w-7xl mx-auto">
          <Link to="/brands" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white mb-8">
            <ArrowLeft size={16} />
            {t('brandDetails', 'backToBrands')}
          </Link>

          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-end">
            <div className="space-y-5 max-w-3xl">
              <p className='text-xs font-semibold uppercase tracking-[0.35em] text-white/75'>{t('brandDetails', 'featuredBrand')}</p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight">{brand.name}</h1>
              <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-8">{brand.tagline}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <ShoppingBag size={15} />
                  {brand.productCount} {t('brandDetails', 'products')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <Star size={15} className="fill-white" />
                  {t('brandDetails', 'curatedCollection')}
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-black/20 border border-white/15 p-6 backdrop-blur-md shadow-2xl">
              <p className='text-sm text-white/70 mb-4'>{t('brandDetails', 'quickOverview')}</p>
              <div className="space-y-4 text-white">
                <div className="flex items-start gap-3">
                  <Package size={18} className="mt-0.5 text-white/80" />
                  <div>
                    <p className='font-semibold'>{t('brandDetails', 'selectedProducts')}</p>
                    <p className='text-sm text-white/70'>{brand.productCount} {t('brandDetails', 'selectedProductsText')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight size={18} className="mt-0.5 text-white/80" />
                  <div>
                    <p className='font-semibold'>{t('brandDetails', 'browseByBrand')}</p>
                    <p className='text-sm text-white/70'>{t('brandDetails', 'browseByBrandText')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-10 lg:py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-white/40 mb-2'>{t('brandDetails', 'productsLabel')}</p>
            <h2 className='text-2xl sm:text-3xl font-bold'>{brand.name} {t('brandDetails', 'collectionLabel')}</h2>
          </div>
          <p className='text-sm text-white/50 hidden sm:block'>{brandProducts.length} {t('brandDetails', 'productsFound')}</p>
        </div>

        {brandProducts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            {t('brandDetails', 'noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BrandDetails