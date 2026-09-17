import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, User } from 'lucide-react'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'
import LanguageSwitcher from '../Components/LanguageSwitcher'
import AuthModal from '../Components/AuthModal'
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

// ── Discovery navbar (per the hi-fi mock: logo + SIGN IN) ─────────────────────
const DiscoveryNavbar = () => {
  const { t } = useLanguage()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#0A0B0F]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link
            to="/"
            className="text-xl font-bold tracking-wide text-white transition-colors hover:text-white/80"
          >
            Àgbáyémáarà
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/brands"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('nav', 'brands')}
            </Link>
            <Link
              to="/shop"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('nav', 'shop')}
            </Link>
            <Link
              to="/about"
              className="relative text-sm font-medium text-white/60 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#ec5800] after:transition-all after:duration-300 hover:after:w-full"
            >
              {t('landingNav', 'about')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher
              buttonClassName="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white/70 hover:text-white"
              dropdownWidth="w-32"
            />
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden rounded-full bg-white px-5 py-2 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:bg-white/85 active:scale-95 md:block"
            >
              {t('auth', 'signInAction')}
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-lg p-2 text-white/70 transition-all hover:bg-white/10 hover:text-white md:hidden"
              aria-label={t('auth', 'signInAction')}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

// ── Filter pills ───────────────────────────────────────────────────────────────
const FilterPills = ({ active, onChange }) => {
  const { t } = useLanguage()

  const pills = [
    { label: t('discovery', 'forYou'), value: FEED_FILTERS.FOR_YOU },
    { label: t('discovery', 'followingTab'), value: FEED_FILTERS.FOLLOWING },
    { label: t('discovery', 'newBrands'), value: FEED_FILTERS.NEW_BRANDS },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {pills.map((pill) => {
        const isActive = active === pill.value
        return (
          <button
            key={pill.value}
            onClick={() => onChange(pill.value)}
            aria-pressed={isActive}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-white text-black shadow'
                : 'border border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
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
    <div className="min-h-screen w-full bg-[#0A0B0F] text-white">
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
            <p className="mt-2 max-w-xl text-sm text-white/50">
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
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center text-sm text-white/50">
              {t('discovery', 'emptyFeed')}
            </div>
          ))}

        {/* Feed */}
        {!isLoading && !error && feed.length > 0 && (
          <div className="space-y-5">
            {heroItem && <FeedCardRenderer item={heroItem} />}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <FeedCardRenderer
                  key={item.id ?? item.unitId ?? item.slug ?? item.product?.id}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DiscoveryFeed
