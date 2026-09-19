import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  Heart,
  MapPin,
  ShoppingBag,
} from 'lucide-react'
import { getBrandBySlug } from '../data/brands'
import { getStoryById, getStoriesByBrandSlug } from '../data/content'
import { getProductById } from '../data/products'
import { useCart } from '../Context/CartContext'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// ── The "desire → buy bridge" ────────────────────────────────────────────────
// One product card set into the middle of the story: the reader has just met
// the piece in prose, so this is where the story hands it over to the shop.
const StoryProductBridge = ({ product, brand }) => {
  const { addToCart } = useCart()
  const { isFollowing, toggleFollowBrand } = useFollow()
  const { t } = useLanguage()
  const [added, setAdded] = useState(false)

  if (!product) return null

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart({
      id: product.id,
      name: product.productName,
      price: product.productPrice,
      image: product.productImage,
      brand: product.brand,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <aside className='my-10 lg:my-14'>
      <div className='overflow-hidden rounded-3xl border border-line bg-surface-alt shadow-2xl'>
        <div className={`h-1.5 w-full bg-linear-to-r ${brand.accent}`} />

        <div className='flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8'>
          <Link
            to={`/shop/product/${product.id}`}
            className='block shrink-0 overflow-hidden rounded-2xl'
            aria-label={product.productName}
          >
            <img
              src={product.productImage}
              alt={product.productName}
              className='h-56 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-44 sm:w-44'
            />
          </Link>

          <div className='min-w-0 flex-1'>
            <p className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]'>
              <BookOpen size={13} />
              {t('brandStory', 'featuredInStory')}
            </p>
            <h3 className='mt-2 text-xl font-bold text-strong sm:text-2xl'>
              {product.productName}
            </h3>
            <p className='mt-1 text-sm text-muted'>{product.brand}</p>
            <p className='mt-2 text-lg font-bold text-strong'>
              ${product.productPrice.toFixed(2)}
            </p>

            <div className='mt-5 flex flex-wrap items-center gap-3'>
              <Link
                to={`/shop/product/${product.id}`}
                className='inline-flex items-center gap-1.5 rounded-full bg-on-accent px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-on-accent/85 active:scale-95'
              >
                {t('brandStory', 'shopThisPiece')}
                <ArrowUpRight size={15} />
              </Link>
              <button
                onClick={handleAddToCart}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'border border-line bg-raised text-strong hover:border-line-strong hover:bg-raised-strong'
                }`}
              >
                {added ? (
                  <>
                    <Check size={15} />
                    {t('productCard', 'added')}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    {t('productCard', 'addToCart')}
                  </>
                )}
              </button>
              {/* Follow chip — converts story readers into brand followers
                  right at the desire→buy bridge */}
              <button
                onClick={() => toggleFollowBrand(brand.slug)}
                aria-pressed={isFollowing(brand.slug)}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isFollowing(brand.slug)
                    ? 'border-line-strong bg-raised-strong text-strong'
                    : 'border-line-strong bg-raised text-strong hover:border-line-strong hover:text-strong'
                }`}
              >
                {isFollowing(brand.slug) ? (
                  <>
                    <Check size={13} />
                    {t('discovery', 'following')}
                  </>
                ) : (
                  <>
                    <Heart size={13} />
                    {t('discovery', 'follow')} {brand.name}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── Story body helpers ───────────────────────────────────────────────────────
// Long-form copy set in two editorial columns; the story is split around its
// midpoint so the product bridge lands mid-story at full measure.

const Column = ({ paragraphs, withDropCap = false }) => (
  <div className='lg:columns-2 lg:gap-12'>
    {paragraphs.map((paragraph, index) => (
      <p
        key={index}
        className={`mb-6 text-[15px] leading-8 text-muted ${
          withDropCap && index === 0
            ? 'first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-black first-letter:leading-[0.85] first-letter:text-[#ec5800]'
            : ''
        }`}
      >
        {paragraph}
      </p>
    ))}
  </div>
)

// ── Brand Story page ─────────────────────────────────────────────────────────
const BrandStory = () => {
  const { brandSlug, storyId } = useParams()
  const brand = getBrandBySlug(brandSlug)
  const story = getStoryById(brandSlug, storyId)
  const { t } = useLanguage()

  // Fresh story, fresh scroll — long-form pages should always open at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [brandSlug, storyId])

  if (!brand) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-strong'>
        <p className='text-2xl font-bold'>{t('brandDetails', 'notFound')}</p>
        <Link
          to='/brands'
          className='text-sm font-medium text-[#f28500] hover:underline'
        >
          {t('brandDetails', 'backToBrands')}
        </Link>
      </div>
    )
  }

  if (!story) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-strong'>
        <p className='text-2xl font-bold'>{t('brandStory', 'notFound')}</p>
        <Link
          to={`/brands/${brand.slug}`}
          className='inline-flex items-center gap-2 text-sm font-medium text-[#f28500] hover:underline'
        >
          <ArrowLeft size={15} />
          {t('brandStory', 'backToBrand')}
        </Link>
      </div>
    )
  }

  const product = getProductById(story.productId)
  const paragraphs =
    Array.isArray(story.storyBody) && story.storyBody.length > 0
      ? story.storyBody
      : [story.body]
  const midpoint = Math.ceil(paragraphs.length / 2)
  const opening = paragraphs.slice(0, midpoint)
  const closing = paragraphs.slice(midpoint)

  const otherStories = getStoriesByBrandSlug(brand.slug).filter(
    (unit) => unit.id !== story.id
  )

  return (
    <article className='min-h-screen w-full bg-surface text-strong'>
      {/* Full-bleed hero */}
      <header className='relative flex min-h-[70vh] items-end overflow-hidden'>
        <img
          src={story.media}
          alt={story.title}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-t from-[#0A0B0F] via-black/55 to-black/20' />

        <div className='relative mx-auto w-full max-w-5xl px-5 pb-12 pt-28'>
          <Link
            to={`/brands/${brand.slug}`}
            className='mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white'
          >
            <ArrowLeft size={16} />
            {t('brandStory', 'backToBrand')}
          </Link>

          <p className='mb-4 inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.25em]'>
            <BookOpen size={13} />
            {t('brandStory', 'storyEyebrow')}
          </p>

          <h1 className='max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
            {story.title}
          </h1>

          <div className='mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted'>
            <Link
              to={`/brands/${brand.slug}`}
              className='inline-flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-[#ec5800]'
            >
              <MapPin size={14} className='text-[#ec5800]' />
              {brand.name}
            </Link>
            {story.publishDate && (
              <span>{formatDate(story.publishDate)}</span>
            )}
            <span>{brand.location}</span>
          </div>
        </div>
      </header>

      {/* Two-column body copy with the product bridge mid-story */}
      <div className='mx-auto max-w-5xl px-5 py-12 lg:py-16'>
        <Column paragraphs={opening} withDropCap />

        <StoryProductBridge product={product} brand={brand} />

        {closing.length > 0 && <Column paragraphs={closing} />}

        {/* Continue reading — other stories from the same brand */}
        {otherStories.length > 0 && (
          <section className='mt-16 border-t border-line pt-10'>
            <h2 className='mb-6 text-xl font-bold sm:text-2xl'>
              {t('brandStory', 'moreStories')}{' '}
              <span className='text-[#ec5800]'>{brand.name}</span>
            </h2>
            <div className='grid gap-5 sm:grid-cols-2'>
              {otherStories.map((unit) => (
                <Link
                  key={unit.id}
                  to={`/brands/${brand.slug}/story/${unit.id}`}
                  className='group flex gap-4 overflow-hidden rounded-2xl border border-line bg-surface-alt p-4 transition-colors hover:border-line-strong'
                >
                  <img
                    src={unit.media}
                    alt={unit.title}
                    className='h-24 w-24 shrink-0 rounded-xl object-cover'
                  />
                  <div className='min-w-0'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-[#ec5800]'>
                      {formatDate(unit.publishDate)}
                    </p>
                    <h3 className='mt-1 line-clamp-2 text-sm font-bold leading-snug text-strong group-hover:text-[#ec5800]'>
                      {unit.title}
                    </h3>
                    <span className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors group-hover:text-strong'>
                      {t('brandStory', 'readStory')}
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

export default BrandStory
