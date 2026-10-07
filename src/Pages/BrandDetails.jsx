import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  Check,
  Heart,
  MapPin,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
} from 'lucide-react'
import { getBrandBySlug, getProductsByBrandSlug } from '../data/brands'
import { getContentByBrandSlug } from '../data/content'
import ProductCard from '../Components/ProductCard'
import Footer from '../Components/Footer'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'

const BrandDetails = () => {
  const { brandSlug } = useParams()
  const brand = getBrandBySlug(brandSlug)
  const brandProducts = getProductsByBrandSlug(brandSlug)
  const allBrandContent = getContentByBrandSlug(brandSlug)
  const { t } = useLanguage()
  const { isFollowing, toggleFollowBrand } = useFollow()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'collection' | 'story' | 'milestones' | 'stories' | 'craft'
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [toastMessage, setToastMessage] = useState(null)

  const following = brand ? isFollowing(brand.slug) : false

  const handleShare = () => {
    if (!brand) return
    const url = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setToastMessage(`✓ Copied link for ${brand.name}!`)
        setTimeout(() => setToastMessage(null), 2500)
      }).catch(() => {
        setToastMessage(`✓ Link ready to share!`)
        setTimeout(() => setToastMessage(null), 2500)
      })
    } else {
      setToastMessage(`✓ Link ready to share!`)
      setTimeout(() => setToastMessage(null), 2500)
    }
  }

  // Filtered & sorted products
  const displayedProducts = useMemo(() => {
    let list = [...brandProducts]

    if (productCategoryFilter === 'sale') {
      list = list.filter((p) => p.onSale)
    } else if (productCategoryFilter === 'female') {
      list = list.filter((p) => p.gender === 'female' || p.category === 'Women')
    } else if (productCategoryFilter === 'male') {
      list = list.filter((p) => p.gender === 'male' || p.category === 'Men')
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.productPrice || 0) - (b.productPrice || 0))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.productPrice || 0) - (a.productPrice || 0))
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return list
  }, [brandProducts, productCategoryFilter, sortBy])

  if (!brand) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center bg-surface text-strong">
        <p className="text-2xl font-bold">{t('brandDetails', 'notFound')}</p>
        <Link to="/following" className="text-sm font-semibold text-[#ec5800] hover:underline">
          ← Back to Following Feed
        </Link>
      </div>
    )
  }

  const establishedYears = brand.foundedDate
    ? new Date().getFullYear() - parseInt(brand.foundedDate, 10)
    : null

  return (
    <div className="min-h-screen w-full bg-surface text-strong">
      {/* Toast alert */}
      {toastMessage && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-surface-alt px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-md animate-pop-in"
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* ── Social Profile Hero Banner ──────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-line bg-surface-alt">
        {/* Cover image banner */}
        <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
          <img
            src={brand.coverImage}
            alt={brand.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0A0B0F] via-black/60 to-black/30" />
          <div className={`absolute top-0 inset-x-0 h-2 bg-linear-to-r ${brand.accent}`} />

          {/* Top navigation row */}
          <div className="absolute top-5 inset-x-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10">
            <Link
              to="/following"
              className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/15 transition-all hover:bg-black/75 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Following Feed</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/brands"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur-md border border-white/10 hover:bg-black/60 hover:text-white"
              >
                <span>All Brands Directory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Info Header Bar (Overlapping Cover) */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-16 sm:-mt-20 z-20 relative">
            {/* Avatar & Title info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className={`h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-3xl p-1 bg-linear-to-tr ${brand.accent} shadow-2xl ring-4 ring-surface-alt shrink-0`}>
                <img
                  src={brand.coverImage}
                  alt={brand.name}
                  className="h-full w-full rounded-[22px] object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {brand.name}
                  </h1>
                  <BadgeCheck size={24} className="text-[#ec5800] shrink-0" />
                  <span className="rounded-full bg-[#ec5800]/20 px-3 py-1 text-xs font-bold text-[#ec5800] border border-[#ec5800]/30">
                    Official Atelier
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80">
                  <span className="font-bold text-white">{brand.handle || `@${brand.slug}`}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-white/90">
                    <MapPin size={13} className="text-[#ec5800]" />
                    {brand.location}
                  </span>
                  {brand.foundedDate && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-muted" />
                        Est. {brand.foundedDate} ({establishedYears} years)
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/90">
                    {brand.category || 'Luxury Fashion'}
                  </span>
                </div>

                <p className="max-w-2xl text-sm sm:text-base text-white/75 leading-relaxed pt-1">
                  {brand.tagline}
                </p>
              </div>
            </div>

            {/* Social Profile Actions */}
            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => toggleFollowBrand(brand.slug)}
                aria-pressed={following}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 ${
                  following
                    ? 'border border-line bg-raised-strong text-strong hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#ec5800] text-white hover:bg-[#d04f00]'
                }`}
              >
                {following ? (
                  <>
                    <Check size={16} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    <span>Follow Brand</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:bg-raised-strong hover:text-strong"
                title="Share Brand"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>

          {/* ── Social Stats Grid Bar ───────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-2xl border border-line bg-raised p-4">
            <div className="text-center sm:text-left sm:pl-2">
              <p className="text-xs uppercase tracking-wider text-muted">Followers</p>
              <p className="mt-1 text-2xl font-black text-strong">{brand.followersCount || '48.6K'}</p>
            </div>
            <div className="text-center sm:text-left sm:border-l sm:border-line sm:pl-4">
              <p className="text-xs uppercase tracking-wider text-muted">Collection</p>
              <p className="mt-1 text-2xl font-black text-strong">{brand.productCount} Pieces</p>
            </div>
            <div className="text-center sm:text-left sm:border-l sm:border-line sm:pl-4">
              <p className="text-xs uppercase tracking-wider text-muted">Stories & Drops</p>
              <p className="mt-1 text-2xl font-black text-strong">{allBrandContent.length} Published</p>
            </div>
            <div className="text-center sm:text-left sm:border-l sm:border-line sm:pl-4">
              <p className="text-xs uppercase tracking-wider text-muted">Community Score</p>
              <p className="mt-1 text-2xl font-black text-strong flex items-center justify-center sm:justify-start gap-1">
                <Star size={16} className="fill-[#ec5800] text-[#ec5800]" />
                {brand.rating || 4.9}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 text-center sm:text-left sm:border-l sm:border-line sm:pl-4">
              <p className="text-xs uppercase tracking-wider text-muted">Heritage</p>
              <p className="mt-1 text-2xl font-black text-strong">{establishedYears} Years</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ───────────────────────────────────────────────────
          In normal document flow (no sticky): the bar scrolls away with the
          page instead of parking itself under the top navbar. */}
      <nav aria-label="Brand sections" className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none [scrollbar-width:none]">
            {[
              { id: 'overview', label: 'Overview & Highlights', count: null },
              { id: 'collection', label: 'Full Collection', count: brand.productCount },
              { id: 'story', label: 'Atelier Story', count: null },
              { id: 'milestones', label: 'Milestones & History', count: brand.milestones?.length },
              { id: 'stories', label: 'Editorials & Drops', count: allBrandContent.length },
              { id: 'craft', label: 'Craft & Standards', count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#ec5800] text-white shadow-md'
                    : 'text-muted hover:bg-raised hover:text-strong'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-raised text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main Content Grid Sections ───────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        {/* ── SECTION 1: "At a Glance" Spec Grid (Shown on overview & craft) ─── */}
        {(activeTab === 'overview' || activeTab === 'craft') && (
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
              <h2 className="text-xl sm:text-2xl font-bold">Atelier At a Glance</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-3xl border border-line bg-surface-alt p-6 space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ec5800]/15 text-[#ec5800]">
                  <MapPin size={20} />
                </div>
                <h3 className="text-base font-bold">Headquarters & Studio</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {brand.headquarters || `${brand.location}, West Africa`}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#ec5800]">
                    Permanent Atelier
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-surface-alt p-6 space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <Scissors size={20} />
                </div>
                <h3 className="text-base font-bold">Signature Craft</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {brand.craftHighlights?.[0] || 'Handcrafted tailoring with indigenous West African textile traditions.'}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                    Bespoke & Couture
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-surface-alt p-6 space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold">Ethical Small-Batch</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Slow fashion production supporting local master artisans, fair wages, and sustainable textiles.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                    Slow Fashion Certified
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-surface-alt p-6 space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
                  <Truck size={20} />
                </div>
                <h3 className="text-base font-bold">Global Fulfilment</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Direct dispatch from Lagos atelier to 120+ countries worldwide with full tracking and insurance.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500">
                    3–7 Days Worldwide
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 2: Collection & Products Grid ─────────────────────────── */}
        {(activeTab === 'overview' || activeTab === 'collection') && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {brand.name} Collection ({displayedProducts.length})
                  </h2>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Handcrafted pieces available for immediate order or bespoke tailoring
                </p>
              </div>

              {/* Filters & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-line bg-raised p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setProductCategoryFilter('all')}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      productCategoryFilter === 'all'
                        ? 'bg-[#ec5800] text-white'
                        : 'text-muted hover:text-strong'
                    }`}
                  >
                    All
                  </button>
                  {brand.hasSale && (
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('sale')}
                      className={`rounded-full px-3 py-1 transition-colors flex items-center gap-1 ${
                        productCategoryFilter === 'sale'
                          ? 'bg-[#ec5800] text-white'
                          : 'text-[#ec5800] hover:text-strong'
                      }`}
                    >
                      <Tag size={11} />
                      Sale
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setProductCategoryFilter('female')}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      productCategoryFilter === 'female'
                        ? 'bg-[#ec5800] text-white'
                        : 'text-muted hover:text-strong'
                    }`}
                  >
                    Women
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductCategoryFilter('male')}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      productCategoryFilter === 'male'
                        ? 'bg-[#ec5800] text-white'
                        : 'text-muted hover:text-strong'
                    }`}
                  >
                    Men
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-line bg-raised px-3.5 py-1.5 text-xs font-semibold text-strong focus:outline-hidden"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="rounded-3xl border border-line bg-surface-alt p-12 text-center text-muted">
                <p className="text-base font-semibold text-strong">No products match current filters.</p>
                <button
                  type="button"
                  onClick={() => setProductCategoryFilter('all')}
                  className="mt-3 text-xs font-semibold text-[#ec5800] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── SECTION 3: Brand Heritage & Story Grid ────────────────────────── */}
        {(activeTab === 'overview' || activeTab === 'story') && brand.story && (
          <section className="rounded-3xl border border-line bg-surface-alt/70 p-6 sm:p-10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">The Atelier Narrative</h2>
                <p className="text-xs sm:text-sm text-muted">The craftsmanship, origins, and cultural vision</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {brand.story.map((paragraph, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-raised p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#ec5800]/15 text-xs font-black text-[#ec5800]">
                      0{index + 1}
                    </span>
                    <p className="text-sm text-muted leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-line/60">
                    <p className="text-[11px] font-bold text-strong/80 uppercase tracking-wider">
                      {index === 0 ? 'The Origin' : index === 1 ? 'The Craft' : 'The Legacy'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pull Quote */}
            <div className="mt-8 rounded-2xl border border-[#ec5800]/30 bg-[#ec5800]/5 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ec5800]/20 text-[#ec5800]">
                <Sparkles size={30} />
              </div>
              <div className="space-y-1">
                <blockquote className="text-base sm:text-lg font-bold text-strong italic">
                  "{brand.tagline}"
                </blockquote>
                <p className="text-xs text-muted">
                  — {brand.name} Studio Manifesto, Lagos
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 4: Milestones & Historical Journey Grid ───────────────── */}
        {(activeTab === 'overview' || activeTab === 'milestones') && brand.milestones && (
          <section>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Historical Journey & Milestones</h2>
                <p className="text-xs sm:text-sm text-muted">Key chapters that shaped the house</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {brand.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-3xl border border-line bg-surface-alt p-6 transition-all duration-300 hover:border-[#ec5800]/50 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="rounded-full bg-[#ec5800] px-3 py-1 text-xs font-black text-white shadow-md">
                      {m.year}
                    </span>
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Chapter {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-strong group-hover:text-[#ec5800] transition-colors">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 5: Editorial Stories & Lookbooks Grid ─────────────────── */}
        {(activeTab === 'overview' || activeTab === 'stories') && allBrandContent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-1 rounded-full bg-[#ec5800]" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Editorial Stories & Features ({allBrandContent.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-muted">
                    Behind-the-scenes articles, styling guides, and collection drops
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBrandContent.map((unit) => (
                <article
                  key={unit.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface-alt transition-all duration-300 hover:border-line-strong hover:-translate-y-1 shadow-card"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={unit.media}
                      alt={unit.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {unit.type}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#ec5800]">
                        {unit.publishDate
                          ? new Date(unit.publishDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Feature'}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-strong group-hover:text-[#ec5800] transition-colors leading-snug">
                        {unit.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted line-clamp-3 leading-relaxed">
                        {unit.body}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-line/60">
                      {unit.type === 'story' ? (
                        <Link
                          to={`/brands/${brand.slug}/story/${unit.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ec5800] hover:underline"
                        >
                          <BookOpen size={13} />
                          <span>Read Full Story</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                          <Sparkles size={13} />
                          <span>Editorial Feature</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 6: Customer Assurances & Atelier Standards ────────────── */}
        {(activeTab === 'overview' || activeTab === 'craft') && (
          <section className="rounded-3xl border border-line bg-surface-alt p-6 sm:p-10">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ec5800]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#ec5800]">
                <Award size={13} />
                Àgbáyémáarà Atelier Guarantee
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Purchasing Directly From {brand.name}
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Every order placed on Àgbáyémáarà is coordinated directly with {brand.name}'s studio in Nigeria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-line bg-raised p-5 space-y-2 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-strong">
                  1
                </span>
                <h3 className="text-sm font-bold">100% Authenticity</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Direct from the designer's hands. Includes certificate of origin and designer care label.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-raised p-5 space-y-2 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-strong">
                  2
                </span>
                <h3 className="text-sm font-bold">Custom Alterations</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Made-to-order pieces can be customized according to your exact measurements at checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-raised p-5 space-y-2 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-strong">
                  3
                </span>
                <h3 className="text-sm font-bold">Secure Delivery & Returns</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Complimentary luxury packaging with tracked DHL courier delivery to your doorstep.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default BrandDetails