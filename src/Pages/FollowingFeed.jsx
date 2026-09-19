import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Heart, Sparkles, UserCheck } from 'lucide-react'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'
import DiscoveryNavbar from '../Components/Discovery/DiscoveryNavbar'
import FeedCardRenderer from '../Components/Discovery/FeedCardRenderer'
import {
  DiscoverySkeletonFeed,
  DiscoveryErrorState,
} from '../Components/Discovery/DiscoveryStates'
import {
  buildFollowingFeed,
  getCuratedFollowBrands,
} from '../data/discoveryFeed'

// ── Curated follow suggestion (zero-follow empty state) ──────────────────────
// Follows the brand inline, then flips to a "Following" confirmation.
const CuratedBrandRow = ({ brand }) => {
  const { isFollowing, toggleFollowBrand } = useFollow()
  const { t } = useLanguage()
  const following = isFollowing(brand.slug)

  return (
    <div className='flex items-center gap-4 rounded-2xl border border-line bg-surface-alt p-4'>
      <img
        src={brand.coverImage}
        alt={brand.name}
        className='h-14 w-14 shrink-0 rounded-xl object-cover'
      />
      <div className='min-w-0 flex-1'>
        <Link
          to={`/brands/${brand.slug}`}
          className='block truncate text-sm font-bold text-strong transition-colors hover:text-[#ec5800]'
        >
          {brand.name}
        </Link>
        <p className='truncate text-xs text-muted'>{brand.tagline}</p>
      </div>
      <button
        onClick={() => toggleFollowBrand(brand.slug)}
        aria-pressed={following}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
          following
            ? 'border border-line bg-raised-strong text-strong'
            : 'bg-[#ec5800] text-strong hover:bg-[#d04f00]'
        }`}
      >
        {following ? (
          <>
            <Check size={13} />
            {t('discovery', 'following')}
          </>
        ) : (
          <>
            <Heart size={13} />
            {t('discovery', 'follow')}
          </>
        )}
      </button>
    </div>
  )
}

// ── Following feed page ───────────────────────────────────────────────────────
const FollowingFeed = () => {
  const { followedBrands } = useFollow()
  const { t } = useLanguage()
  const [retryCount, setRetryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feed, setFeed] = useState([])

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
    setIsLoading(true)
    setError(null)
  }

  // Simulated async feed fetch, mirroring DiscoveryFeed — swap for a real API
  // call when the backend exists.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (cancelled) return
        setFeed(buildFollowingFeed(followedBrands))
      } catch {
        if (!cancelled) setError(t('discovery', 'errorBody'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [followedBrands, retryCount, t])

  const isEmpty = !isLoading && !error && feed.length === 0

  return (
    <div className='min-h-screen w-full bg-surface text-strong'>
      <DiscoveryNavbar />

      <main className='mx-auto max-w-7xl px-5 pb-20 pt-10'>
        <header className='mb-8'>
          <p className='mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]'>
            <UserCheck size={14} />
            {t('followingPage', 'eyebrow')}
          </p>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            {t('followingPage', 'title')}
          </h1>
          <p className='mt-2 max-w-xl text-sm text-muted'>
            {t('followingPage', 'subtitle')}
          </p>
        </header>

        {/* States */}
        {isLoading && <DiscoverySkeletonFeed />}
        {error && <DiscoveryErrorState onRetry={handleRetry} />}

        {/* Zero-follow empty state — redirect attention to Discovery with a
            prompt to follow three curated brands */}
        {isEmpty && (
          <section className='mx-auto max-w-2xl rounded-3xl border border-dashed border-line bg-white/[0.02] px-6 py-12 text-center'>
            <span className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ec5800]/15 text-[#ec5800]'>
              <Heart size={24} />
            </span>
            <h2 className='text-xl font-bold sm:text-2xl'>
              {t('followingPage', 'emptyTitle')}
            </h2>
            <p className='mx-auto mt-2 max-w-md text-sm text-muted'>
              {t('followingPage', 'emptyBody')}
            </p>

            <div className='mt-8 space-y-3 text-left'>
              {getCuratedFollowBrands().map((brand) => (
                <CuratedBrandRow key={brand.slug} brand={brand} />
              ))}
            </div>

            <Link
              to='/'
              className='mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-on-accent/85 active:scale-95'
            >
              <Sparkles size={15} />
              {t('followingPage', 'emptyCta')}
            </Link>
          </section>
        )}

        {/* Feed */}
        {!isLoading && !error && feed.length > 0 && (
          <>
            <p className='mb-5 text-sm text-muted'>
              {followedBrands.length}{' '}
              {t('followingPage', 'brandsFollowed')}
            </p>
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {feed.map((item) => (
                <FeedCardRenderer
                  key={item.id ?? item.unitId ?? item.slug ?? item.product?.id ?? item.productName}
                  item={item}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default FollowingFeed
