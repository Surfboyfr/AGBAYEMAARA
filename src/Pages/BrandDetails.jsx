import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, BookOpen, Check, Heart, ShoppingBag, Star, Tag } from 'lucide-react'
import { getBrandBySlug, getProductsByBrandSlug } from '../data/brands'
import { getStoriesByBrandSlug } from '../data/content'
import ProductCard from '../Components/ProductCard'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'

const BrandDetails = () => {
  const { brandSlug } = useParams()
  const brand = getBrandBySlug(brandSlug)
  const brandProducts = getProductsByBrandSlug(brandSlug)
  const brandStories = getStoriesByBrandSlug(brandSlug)
  const { t } = useLanguage()
  const { isFollowing, toggleFollowBrand } = useFollow()

  const saleProducts = brandProducts.filter((p) => p.onSale)
  const nonSaleProducts = brandProducts.filter((p) => !p.onSale)

  if (!brand) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className='text-2xl font-bold text-strong'>{t('brandDetails', 'notFound')}</p>
        <Link to='/brands' className='text-sm font-medium text-[#f28500] hover:underline'>
          {t('brandDetails', 'backToBrands')}
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-surface text-strong min-h-screen">
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
                {/* Follow button — same FollowContext state as the feed cards */}
                <button
                  onClick={() => toggleFollowBrand(brand.slug)}
                  aria-pressed={isFollowing(brand.slug)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold backdrop-blur-sm transition-all duration-200 active:scale-95 ${
                    isFollowing(brand.slug)
                      ? 'border border-white/40 bg-white text-black hover:bg-on-accent/85'
                      : 'border border-white/40 bg-black/25 text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {isFollowing(brand.slug) ? (
                    <>
                      <Check size={15} />
                      {t('discovery', 'following')}
                    </>
                  ) : (
                    <>
                      <Heart size={15} />
                      {t('discovery', 'follow')}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-line bg-black/20 shadow-2xl">
              {brand.featuredProduct ? (
                <>
                  <img
                    src={brand.featuredProduct.productImage}
                    alt={brand.name}
                    className="h-64 w-full object-cover transition duration-500 hover:scale-105 lg:h-72"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
                    <p className='text-sm font-semibold text-white/90'>{t('brandDetails', 'featuredProduct')}</p>
                    <p className='text-xs text-muted mt-1'>{brand.featuredProduct.productName}</p>
                  </div>
                </>
              ) : (
                <div className="flex h-64 items-center justify-center lg:h-72">
                  <span className="text-6xl font-black tracking-tight text-faint">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stories tab — long-form brand narratives, deep-linkable */}
      {brandStories.length > 0 && (
        <section className='mb-10'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-6 w-1 bg-[#ec5800] rounded-full'></div>
            <h3 className='text-lg font-bold flex items-center gap-2'>
              <BookOpen size={16} className='text-[#ec5800]' />
              {t('brandStory', 'tabHeading')}
            </h3>
            <span className='bg-[#ec5800]/10 text-[#ec5800] text-xs font-semibold px-3 py-1 rounded-full'>
              {brandStories.length}
            </span>
          </div>
          <div className='grid gap-5 sm:grid-cols-2'>
            {brandStories.map((storyUnit) => (
              <Link
                key={storyUnit.id}
                to={`/brands/${brand.slug}/story/${storyUnit.id}`}
                className='group relative overflow-hidden rounded-2xl border border-line bg-surface-alt p-5 transition-colors hover:border-line-strong'
              >
                <p className='text-xs font-semibold uppercase tracking-wider text-[#ec5800]'>
                  {new Date(storyUnit.publishDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <h4 className='mt-2 text-base font-bold leading-snug text-strong group-hover:text-[#ec5800] transition-colors'>
                  {storyUnit.title}
                </h4>
                <p className='mt-2 line-clamp-2 text-sm text-muted'>
                  {storyUnit.body}
                </p>
                <span className='mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors group-hover:text-strong'>
                  <BookOpen size={13} />
                  {t('brandStory', 'readStory')}
                  <ArrowUpRight size={13} className='text-[#ec5800]' />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-5 py-10 lg:py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className='text-xs uppercase tracking-[0.3em] text-muted mb-2'>{t('brandDetails', 'productsLabel')}</p>
            <h2 className='text-2xl sm:text-3xl font-bold'>{brand.name} {t('brandDetails', 'collectionLabel')}</h2>
          </div>
          {brand.hasSale && (
            <span className="rounded-full bg-[#ec5800]/10 text-[#ec5800] text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
              <Tag size={13} />
              {brand.saleProductCount} {t('brandDetails', 'onSaleProducts')}
            </span>
          )}
          <p className='text-sm text-muted hidden sm:block'>{brandProducts.length} {t('brandDetails', 'productsFound')}</p>
        </div>

        {/* Sale products section */}
        {saleProducts.length > 0 && (
          <div className='mb-10'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='h-6 w-1 bg-[#ec5800] rounded-full'></div>
              <h3 className='text-lg font-bold flex items-center gap-2'>
                <Tag size={16} className='text-[#ec5800]' />
                {t('brandDetails', 'onSaleHeading')}
              </h3>
              <span className='bg-[#ec5800]/10 text-[#ec5800] text-xs font-semibold px-3 py-1 rounded-full'>{saleProducts.length}</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {saleProducts.map((product) => (
                <div key={product.id} className='relative'>
                  <div className='absolute top-3 left-3 z-10 bg-[#ec5800] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1'>
                    <Tag size={10} />
                    -25%
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {(nonSaleProducts.length === 0 && saleProducts.length === 0) ? (
          <div className="rounded-3xl border border-line bg-raised p-8 text-center text-muted">
            {t('brandDetails', 'noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {nonSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BrandDetails