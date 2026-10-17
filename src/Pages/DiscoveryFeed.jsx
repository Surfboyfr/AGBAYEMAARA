import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Compass, Search, X } from 'lucide-react'
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
import { products } from '../data/products'

// ── Filter pills ───────────────────────────────────────
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

// ── Search ─────────────────────────────────────────────────────────
// Keyword search over the product catalogue, sitting above the category
// pills. Typing swaps the page into "search mode": results render where the
// masthead/feed would, and clearing the input brings everything back.
const ShopSearch = ({ value, onChange }) => {
  const { t } = useLanguage()

  return (
    <div className='relative mb-4 w-full max-w-xl'>
      <Search
        size={16}
        className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted'
      />
      <input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('discovery', 'searchPlaceholder')}
        aria-label={t('discovery', 'searchAriaLabel')}
        className='w-full rounded-full border border-line bg-raised py-2.5 pl-10 pr-9 text-sm text-strong placeholder-muted transition-colors focus:border-[#ec5800] focus:outline-hidden'
      />
      {value && (
        <button
          type='button'
          onClick={() => onChange('')}
          aria-label={t('discovery', 'searchClear')}
          className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition-colors hover:text-strong'
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

// Case-insensitive keyword match across the fields a shopper would type.
const searchCatalogue = (query, category) => {
  const q = query.trim().toLowerCase()
  if (!q) return null

  return products.filter((product) => {
    if (category !== 'all' && product.category !== category) return false
    const haystack = [
      product.productName,
      product.brand,
      product.category,
      product.gender,
      product.description,
      product.overview,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

// Results grid rendered below the search bar while a keyword is active.
const SearchResults = ({ query, results, onClear }) => {
  const { t } = useLanguage()

  return (
    <section aria-label={t('discovery', 'searchResultsLabel')} className='mb-10'>
      <div className='mb-5 flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-lg font-bold sm:text-xl'>
          {t('discovery', 'searchResultsTitle')} “{query.trim()}”
        </h2>
        <p className='text-sm text-muted'>
          {results.length} {t('discovery', 'productsLabel')}
        </p>
      </div>

      {results.length === 0 ? (
        <div className='rounded-3xl bg-raised px-6 py-16 text-center'>
          <p className='text-sm font-semibold text-strong'>
            {t('discovery', 'searchEmptyTitle')}
          </p>
          <p className='mt-1 text-sm text-muted'>{t('discovery', 'searchEmptyBody')}</p>
          <button
            type='button'
            onClick={onClear}
            className='mt-5 rounded-full border border-line-strong bg-raised px-6 py-2.5 text-sm font-bold text-strong transition-all duration-200 hover:border-[#ec5800] hover:text-[#ec5800] active:scale-[0.98]'
          >
            {t('discovery', 'searchClear')}
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3'>
          {results.map((product) => (
            <div key={product.id} className='h-full rounded-2xl'>
              <FeedCardRenderer item={{ kind: 'product', ...product }} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Discovery feed page ────────────────────────────────────────────────────────
// ── Shop: search bar + category navbar (top) + capped product grid (page bottom) ──
// The shop is split in two so the feed reads first: the category navbar stays
// at the top of the feed page, while the product grid — three rows (6/9
// cards across the breakpoints) with the rest behind a "Show more" button —
// sits at the very bottom, after the feed and the journey strip. Category
// state is lifted to the page: clicking a pill up top filters the grid and
// scrolls down to it.
const SHOP_CATEGORIES = ['all', 'Shoes', 'Bags', 'Wigs', 'Jewelries', 'Hats', 'Accessories', 'Clothing', 'Beauty', 'Home', 'Other']

// Top half: the category navbar. Purely controlled — the page owns the state.
const ShopCategories = ({ active, onSelect }) => {
  const { t } = useLanguage()

  const categoryLabels = {
    all: t('discovery', 'All'),
    Shoes: t('discovery', 'Shoes'),
    Bags: t('discovery', 'Bags'),
    Wigs: t('discovery', 'Wigs'),
    Jewelries: t('discovery', 'Jewelries'),
    Hats: t('discovery', 'Hats'),
    Accessories: t('discovery', 'Accessories'),
    Clothing: t('discovery', 'Clothing'),
    Beauty: t('discovery', 'Beauty'),
    Home: t('discovery', 'Home'),
    Other: t('discovery', 'Other'),
  }

  return (
    <nav
      aria-label='Shop categories'
      className='mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none'
    >
      {SHOP_CATEGORIES.map((value) => {
        const isActive = active === value
        return (
          <button
            key={value}
            type='button'
            onClick={() => onSelect(value)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'border-[#ec5800] bg-[#ec5800]/10 text-[#ec5800] shadow-[0_6px_20px_-8px_rgba(236,88,0,0.7)]'
                : 'border-line text-muted hover:border-line-strong hover:text-strong'
            }`}
          >
            {categoryLabels[value]}
          </button>
        )
      })}
    </nav>
  )
}

// Bottom half: the grid itself, mounted once at the very end of the page.
// Keyed by category on the page so a new category remounts it — the grid
// starts back at three rows without a reset effect.
const ShopGrid = ({ category }) => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [columns, setColumns] = useState(3)

  // Three visible rows at every breakpoint: 2/3 columns → 6/9 cards. Two
  // columns even on phones so the shop mirrors the feed's mobile layout.
  useEffect(() => {
    const lg = window.matchMedia('(min-width: 1024px)')
    const update = () => setColumns(lg.matches ? 3 : 2)
    update()
    lg.addEventListener('change', update)
    return () => lg.removeEventListener('change', update)
  }, [])

  const filtered = useMemo(
    () => (category === 'all' ? products : products.filter((p) => p.category === category)),
    [category],
  )

  const ROWS = 3
  const perView = columns * ROWS
  const canToggle = filtered.length > perView
  const visible = expanded ? filtered : filtered.slice(0, perView)

  return (
    <section id='shop' aria-label='Shop' className='mt-16 scroll-mt-24'>
      {visible.length === 0 ? (
        <div className='rounded-3xl bg-raised px-6 py-16 text-center text-sm text-muted'>
          {t('discovery', 'shopEmpty')}
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3'>
          {visible.map((product) => (
            <div key={product.id} className='h-full rounded-2xl'>
              <FeedCardRenderer item={{ kind: 'product', ...product }} />
            </div>
          ))}
        </div>
      )}

      {/* Three rows are shown; the rest wait behind Show more. */}
      {canToggle && (
        <div className='mt-7 flex justify-center'>
          <button
            type='button'
            onClick={() => setExpanded((value) => !value)}
            data-shop='show-more'
            className='rounded-full border border-line-strong bg-raised px-7 py-3 text-sm font-bold text-strong transition-all duration-200 hover:border-[#ec5800] hover:text-[#ec5800] active:scale-[0.98]'
          >
            {expanded ? t('discovery', 'showLess') : t('discovery', 'showMore')}
          </button>
        </div>
      )}
    </section>
  )
}

const DiscoveryFeed = () => {
  const { followedBrands } = useFollow()
  const { t } = useLanguage()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState(FEED_FILTERS.FOR_YOU)
  // Shop category, shared by the navbar at the top and the grid at the bottom.
  const [shopCategory, setShopCategory] = useState('all')
  // Keyword typed into the search bar above the categories.
  const [searchQuery, setSearchQuery] = useState('')
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

  // A category pill was clicked up top: filter the grid, then take the user
  // to it at the bottom of the page. The scroll runs on the next frame — the
  // grid remounts under a new key, and scrolling the node that is about to be
  // detached would abort the smooth scroll. Honours prefers-reduced-motion,
  // like the rest of the app's scroll-into-view behaviour.
  const handleShopCategory = (value) => {
    setShopCategory(value)
    // In search mode the results sit right below the pills — stay put.
    if (searchQuery.trim()) return
    requestAnimationFrame(() => {
      const shop = document.getElementById('shop')
      if (!shop) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      shop.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    })
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

  // Non-empty query → search mode: results replace the masthead/feed below.
  const searchResults = searchCatalogue(searchQuery, shopCategory)
  const isSearching = searchResults !== null

  return (
    <div className="min-h-screen w-full bg-surface text-strong">
      <DiscoveryNavbar />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10">
        {/* Search sits above the categories */}
        <ShopSearch value={searchQuery} onChange={setSearchQuery} />
        {/* Categories stay at the top: a click filters the grid and scrolls to it */}
        <ShopCategories active={shopCategory} onSelect={handleShopCategory} />

        {/* Search results — shown below the bar while a keyword is active */}
        {isSearching && (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            onClear={() => setSearchQuery('')}
          />
        )}

        {/* Masthead — hidden while searching */}
        {!isSearching && (
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
        )}

        {/* States */}
        {!isSearching && isLoading && <DiscoverySkeletonFeed />}
        {!isSearching && error && <DiscoveryErrorState onRetry={handleRetry} />}

        {!isSearching && isEmpty &&
          (activeFilter === FEED_FILTERS.FOLLOWING ? (
            <DiscoveryEmptyState onBrowse={() => handleFilterChange(FEED_FILTERS.FOR_YOU)} />
          ) : (
            <div className="rounded-3xl bg-raised px-6 py-20 text-center text-sm text-muted">
              {t('discovery', 'emptyFeed')}
            </div>
          ))}

        {/* Feed */}
        {!isSearching && !isLoading && !error && feed.length > 0 && (
          <div className="space-y-5">
            {heroItem && <FeedCardRenderer item={heroItem} />}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item) => (
                <div
                  key={item.id ?? item.unitId ?? item.slug ?? item.product?.id}
                  {...(item.type === 'drop' ? { 'data-feed-card': 'drop' } : {})}
                  className="h-full rounded-2xl"
                >
                  <FeedCardRenderer item={item} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* User journey — the loop from first scroll to delivery, deep-linked */}
        {!isSearching && <UserJourney />}

        {/* Shop grid — the very bottom of the page; the navbar up top scrolls
            here. The key remounts it per category so Show more resets. */}
        {!isSearching && <ShopGrid key={shopCategory} category={shopCategory} />}
      </main>
    </div>
  )
}

export default DiscoveryFeed
