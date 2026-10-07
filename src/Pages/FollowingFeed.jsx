import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  Grid2X2,
  Heart,
  List,
  MapPin,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Store,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'
import DiscoveryNavbar from '../Components/Discovery/DiscoveryNavbar'
import SocialBrandCard from '../Components/Discovery/SocialBrandCard'
import { brands } from '../data/brands'
import { getContentFeed } from '../data/content'

// ── Top Stories / Reel Row ───────────────────────────────────────────────────
// Instagram/TikTok style circular story tray showcasing followed & premier brands
const StoriesTray = ({ followedBrandsList, onSelectBrand, activeBrandSlug }) => {
  const navigate = useNavigate()

  // Prioritize followed brands first, then others
  const displayBrands = useMemo(() => {
    const followed = brands.filter((b) => followedBrandsList.includes(b.slug))
    const unfollowed = brands.filter((b) => !followedBrandsList.includes(b.slug))
    return [...followed, ...unfollowed]
  }, [followedBrandsList])

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-surface-alt/70 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#ec5800] animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-strong">
            Brand Stories & Drops
          </p>
        </div>
        <p className="text-[11px] text-muted">
          Tap to view brand
        </p>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-1 pt-1 scrollbar-none [scrollbar-width:none]">
        {displayBrands.map((brand) => {
          const isFollowed = followedBrandsList.includes(brand.slug)
          const isSelected = activeBrandSlug === brand.slug

          return (
            <button
              key={brand.slug}
              type="button"
              onClick={() => navigate(`/brands/${brand.slug}`)}
              className="group flex shrink-0 flex-col items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-hidden"
              title={`View ${brand.name}`}
            >
              <div
                className={`relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full p-0.5 transition-all duration-300 ${
                  isFollowed
                    ? `bg-linear-to-tr ${brand.accent} ring-2 ring-[#ec5800]/40 shadow-lg`
                    : 'bg-raised-strong ring-1 ring-line hover:ring-white/30'
                } ${isSelected ? 'ring-3 ring-[#ec5800]' : ''}`}
              >
                <img
                  src={brand.coverImage}
                  alt={brand.name}
                  className="h-full w-full rounded-full object-cover ring-2 ring-surface-alt"
                />
                {isFollowed && (
                  <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ec5800] ring-2 ring-surface-alt">
                    <Check size={9} className="text-white" />
                  </span>
                )}
              </div>
              <span className="max-w-[70px] truncate text-[11px] font-medium text-strong/90 group-hover:text-[#ec5800]">
                {brand.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Following Feed Page ────────────────────────────────────────────────
const FollowingFeed = () => {
  const { followedBrands, followBrand } = useFollow()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all' | 'suggestions' | 'sale' | 'couture' | 'street'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'feed'
  const [toastMessage, setToastMessage] = useState(null)

  // Trigger toast notification
  const handleShare = (brandName) => {
    setToastMessage(`✓ Link copied for ${brandName}!`)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Follow all curated brands in 1 click
  const handleFollowCurated = () => {
    const curated = ['lisa-folawiyo', 'atafo', 'andrea-iyamah']
    curated.forEach((slug) => {
      if (!followedBrands.includes(slug)) {
        followBrand(slug)
      }
    })
    setToastMessage('✓ Followed top African fashion houses!')
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Followed brands list
  const followedList = useMemo(() => {
    return brands.filter((brand) => followedBrands.includes(brand.slug))
  }, [followedBrands])

  // Unfollowed suggested brands
  const suggestedList = useMemo(() => {
    return brands.filter((brand) => !followedBrands.includes(brand.slug))
  }, [followedBrands])

  // Filtered followed brands
  const filteredFollowed = useMemo(() => {
    return followedList.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (selectedFilter === 'sale') return brand.hasSale
      if (selectedFilter === 'couture')
        return (
          brand.category?.toLowerCase().includes('couture') ||
          brand.category?.toLowerCase().includes('tailoring')
        )
      if (selectedFilter === 'street')
        return (
          brand.category?.toLowerCase().includes('street') ||
          brand.category?.toLowerCase().includes('contemporary')
        )
      return true
    })
  }, [followedList, searchQuery, selectedFilter])

  // Filtered suggested brands
  const filteredSuggested = useMemo(() => {
    return suggestedList.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (selectedFilter === 'sale') return brand.hasSale
      if (selectedFilter === 'couture')
        return (
          brand.category?.toLowerCase().includes('couture') ||
          brand.category?.toLowerCase().includes('tailoring')
        )
      if (selectedFilter === 'street')
        return (
          brand.category?.toLowerCase().includes('street') ||
          brand.category?.toLowerCase().includes('contemporary')
        )
      return true
    })
  }, [suggestedList, searchQuery, selectedFilter])

  const hasFollows = followedBrands.length > 0

  return (
    <div className="min-h-screen w-full bg-surface text-strong">
      <DiscoveryNavbar />

      {/* Floating Share Toast Notification */}
      {toastMessage && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-surface-alt px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-md animate-pop-in"
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </aside>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-8 sm:pt-10">
        {/* ── Stories & Active Drops Tray (Social Media Style) ─────────────── */}
        <StoriesTray followedBrandsList={followedBrands} />

        {/* ── Feed Header ──────────────────────────────────────────────────── */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-line bg-raised px-3.5 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]">
              <Users size={13} />
              {t('followingPage', 'eyebrow')}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              {t('followingPage', 'title')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted leading-relaxed">
              Your personalized social feed of Africa's leading fashion houses. Explore collections, discover drops, and tap any card to view everything about the brand.
            </p>
          </div>

          {/* Social Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-line bg-raised px-4 py-2.5 text-right">
              <p className="text-xs text-muted">Following</p>
              <p className="text-xl font-black text-strong">
                {followedBrands.length}{' '}
                <span className="text-xs font-normal text-muted">Brands</span>
              </p>
            </div>
          </div>
        </header>

        {/* ── Search & Filter Controls Toolbar ─────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-line bg-surface-alt/60 p-4 sm:p-5 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands by name, city, aesthetic..."
              className="w-full rounded-full border border-line bg-raised pl-10 pr-9 py-2.5 text-sm text-strong placeholder-muted transition-colors focus:border-[#ec5800] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-strong"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filter Pills & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#ec5800] text-white shadow-md'
                  : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
              }`}
            >
              All {hasFollows ? `(${followedList.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('couture')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedFilter === 'couture'
                  ? 'bg-[#ec5800] text-white shadow-md'
                  : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
              }`}
            >
              Couture & Tailoring
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('street')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedFilter === 'street'
                  ? 'bg-[#ec5800] text-white shadow-md'
                  : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
              }`}
            >
              Streetwear
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('sale')}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedFilter === 'sale'
                  ? 'bg-[#ec5800] text-white shadow-md'
                  : 'bg-raised text-muted hover:bg-raised-strong hover:text-strong'
              }`}
            >
              On Sale
            </button>

            {/* Layout switch */}
            <div className="ml-auto hidden sm:flex items-center gap-1 rounded-full border border-line bg-raised p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#ec5800] text-white' : 'text-muted hover:text-strong'
                }`}
                title="Grid View"
              >
                <Grid2X2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`rounded-full p-1.5 transition-colors ${
                  viewMode === 'feed' ? 'bg-[#ec5800] text-white' : 'text-muted hover:text-strong'
                }`}
                title="Feed View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Zero-Follow Social Onboarding State ───────────────────────────── */}
        {!hasFollows && (
          <section className="mb-14 rounded-3xl border border-dashed border-[#ec5800]/30 bg-[#ec5800]/5 p-6 sm:p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ec5800]/15 text-[#ec5800]">
              <Sparkles size={26} />
            </div>
            <h2 className="text-2xl font-black text-strong sm:text-3xl">
              Build Your African Fashion Feed
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted leading-relaxed">
              You are not following any brands yet. Follow the premier labels below to receive their new collections, lookbooks, and atelier stories directly in your feed.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFollowCurated}
                className="inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#d04f00] active:scale-95 shadow-lg"
              >
                <Heart size={15} />
                Follow All Curated Labels
              </button>
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-raised px-5 py-2.5 text-sm font-semibold text-strong transition hover:bg-raised-strong active:scale-95"
              >
                <Store size={15} />
                Browse Directory
              </Link>
            </div>
          </section>
        )}

        {/* ── Followed Brands Section ──────────────────────────────────────── */}
        {hasFollows && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
                <h2 className="text-xl sm:text-2xl font-bold">
                  Followed Labels ({filteredFollowed.length})
                </h2>
              </div>
              <span className="text-xs text-muted">
                Tap card to open brand page
              </span>
            </div>

            {filteredFollowed.length === 0 ? (
              <div className="rounded-3xl border border-line bg-surface-alt p-10 text-center text-muted">
                <p className="text-base font-semibold text-strong">No followed brands match your search.</p>
                <p className="mt-1 text-xs">Try clearing your search query or changing filters.</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedFilter('all') }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-raised px-4 py-2 text-xs font-semibold text-strong hover:bg-raised-strong"
                >
                  <X size={13} />
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 max-w-3xl mx-auto'
                }`}
              >
                {filteredFollowed.map((brand) => (
                  <SocialBrandCard
                    key={brand.slug}
                    brand={brand}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Suggested / Explore More Brands Section ──────────────────────── */}
        {filteredSuggested.length > 0 && (
          <section className="mt-12 border-t border-line/80 pt-10">
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#ec5800]" />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {hasFollows ? 'Discover More African Labels' : 'Curated Premier Labels'}
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Follow more designers to customize and expand your personal feed
                </p>
              </div>
              <Link
                to="/brands"
                className="text-xs font-bold text-[#ec5800] hover:underline"
              >
                View all in directory →
              </Link>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 max-w-3xl mx-auto'
              }`}
            >
              {filteredSuggested.map((brand) => (
                <SocialBrandCard
                  key={brand.slug}
                  brand={brand}
                  onShare={handleShare}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default FollowingFeed
