import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Compass, ShoppingBag } from 'lucide-react'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'
import DiscoveryNavbar from '../Components/Discovery/DiscoveryNavbar'
import FeedCardRenderer from '../Components/Discovery/FeedCardRenderer'
import {
  DiscoverySkeletonFeed,
  DiscoveryErrorState,
  DiscoveryEmptyState,
} from '../Components/Discovery/DiscoveryStates'
import {
  FEED_FILTERS,
  buildForYouFeed,
  buildFollowingFeed,
  buildNewBrandsFeed,
} from '../data/discoveryFeed'
import UserJourney from '../Components/UserJourney'

// ── Discovery feed page ────────────────────────────────────────────────────────
const FilterPills = ({ active, onChange }) => {
  const { t } = useLanguage()

  const pills = [
    { label: t('discovery', 'forYou'), value: FEED_FILTERS.FOR_YOU },
    { label: t('discovery', 'followingTab'), value: FEED_FILTERS.FOLLOWING },
    { label: t('discovery', 'newBrands'), value: FEED_FILTERS.NEW_BRANDS },
    // Navigation pill, not a filter — routes straight to the shop surface.
    { label: t('nav', 'shop'), to: '/shop' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {pills.map((pill) => {
        // Shop pill: outlined + bag icon so it reads as "go shopping" rather
        // than one of the feed filters, and fills orange on hover.
        if (pill.to) {
          return (
            <Link
              key={pill.to}
              to={pill.to}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-raised px-5 py-2 text-sm font-semibold text-strong transition-all duration-200 hover:border-[#ec5800] hover:bg-[#ec5800] hover:text-white active:scale-95"
            >
              <ShoppingBag size={15} />
              {pill.label}
            </Link>
          )
        }

        const isActive = active === pill.value
        return (
          <button
            key={pill.value}
            onClick={() => onChange(pill.value)}
            aria-pressed={isActive}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[#ec5800] text-white shadow-[0_6px_20px_-6px_rgba(236,88,0,0.55)]'
                : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
            }`}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Discovery feed page ────────────────────────────────────────────────────────
const DiscoveryFeed = () => {
  const { followedBrands } = useFollow()
  const { t } = useLanguage()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState(FEED_FILTERS.FOR_YOU)
  const [retryCount, setRetryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feed, setFeed] = useState([])

  // Loading/error resets live in event handlers; the effect only sets state
  // asynchronously so it never triggers cascading renders.
  const handleFilterChange = (value) => {
    setActiveFilter(value)
    setIsLoading(true)
    setError(null)
  }

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
    setIsLoading(true)
    setError(null)
  }

  // "See a new drop" deep link: once the feed has rendered, scroll to and
  // pulse the newest drop card. Guarded by location.key so each navigation
  // carrying the flag triggers exactly one pulse — same-page navigations get
  // a fresh key too. Refs are only touched inside the effect (never render).
  const consumedFocusKey = useRef(null)

  useEffect(() => {
    if (location.state?.journeyFocus !== 'drop' || isLoading || error) return
    if (consumedFocusKey.current === location.key) return
    consumedFocusKey.current = location.key

    const dropCard = document.querySelector('[data-feed-card="drop"]')
    if (!dropCard) return

    dropCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
    dropCard.classList.add('journey-focus-pulse')
    const pulseTimer = setTimeout(
      () => dropCard.classList.remove('journey-focus-pulse'),
      2200
    )
    return () => {
      clearTimeout(pulseTimer)
      dropCard.classList.remove('journey-focus-pulse')
    }
  }, [location, isLoading, error])

  // Simulated async feed fetch — swap for a real API call when the backend
  // exists. A bad data shape surfaces as the error state with retry.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        // Artificial latency so the skeleton state is visible in dev.
        await new Promise((resolve) => setTimeout(resolve, 600))
        if (cancelled) return

        let items = []
        switch (activeFilter) {
          case FEED_FILTERS.FOLLOWING:
            items = buildFollowingFeed(followedBrands)
            break
          case FEED_FILTERS.NEW_BRANDS:
            items = buildNewBrandsFeed()
            break
          case FEED_FILTERS.FOR_YOU:
          default:
            items = buildForYouFeed()
        }
        setFeed(items)
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
  }, [activeFilter, followedBrands, retryCount, t])

  const heroItem = useMemo(
    () => feed.find((item) => item.kind === 'hero') ?? null,
    [feed]
  )
  const gridItems = useMemo(
    () => feed.filter((item) => item !== heroItem),
    [feed, heroItem]
  )

  const isEmpty = !isLoading && !error && feed.length === 0

  return (
    <div className="min-h-screen w-full bg-surface text-strong">
      <DiscoveryNavbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10">
        {/* Masthead */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]">
              <Compass size={14} />
              {t('discovery', 'eyebrow')}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('discovery', 'title')}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              {t('discovery', 'subtitle')}
            </p>
          </div>
          <FilterPills active={activeFilter} onChange={handleFilterChange} />
        </header>

        {/* States */}
        {isLoading && <DiscoverySkeletonFeed />}
        {error && <DiscoveryErrorState onRetry={handleRetry} />}

        {isEmpty &&
          (activeFilter === FEED_FILTERS.FOLLOWING ? (
            <DiscoveryEmptyState onBrowse={() => handleFilterChange(FEED_FILTERS.FOR_YOU)} />
          ) : (
            <div className="rounded-3xl bg-raised px-6 py-20 text-center text-sm text-muted">
              {t('discovery', 'emptyFeed')}
            </div>
          ))}

        {/* Feed */}
        {!isLoading && !error && feed.length > 0 && (
          <div className="space-y-5">
            {heroItem && <FeedCardRenderer item={heroItem} />}

             {/* User journey — the loop from first scroll to delivery, deep-linked */}
        <UserJourney />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <div
                  key={item.id ?? item.unitId ?? item.slug ?? item.product?.id}
                  {...(item.type === 'drop' ? { 'data-feed-card': 'drop' } : {})}
                  className="h-full rounded-2xl"
                >

                  
                  <FeedCardRenderer
                    item={item}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

       

      </main>
    </div>
  )
}

export default DiscoveryFeed
