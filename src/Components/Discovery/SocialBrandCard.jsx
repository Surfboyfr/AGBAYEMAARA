import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  Tag,
  Clock,
} from 'lucide-react'
import { useFollow } from '../../Context/FollowContext'
import { useLanguage } from '../../Context/LanguageContext'

const SocialBrandCard = ({ brand, onShare, onStoryClick }) => {
  const navigate = useNavigate()
  const { isFollowing, toggleFollowBrand } = useFollow()
  const { t } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const following = isFollowing(brand.slug)

  const handleCardClick = () => {
    navigate(`/brands/${brand.slug}`)
  }

  const handleFollowClick = (e) => {
    e.stopPropagation()
    toggleFollowBrand(brand.slug)
  }

  const handleShareClick = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/brands/${brand.slug}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        if (onShare) onShare(brand.name)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {
        if (onShare) onShare(brand.name)
      })
    } else if (onShare) {
      onShare(brand.name)
    }
  }

  const establishedYears = brand.foundedDate
    ? new Date().getFullYear() - parseInt(brand.foundedDate, 10)
    : null

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface-alt shadow-card transition-all duration-300 hover:border-line-strong hover:shadow-card-hover cursor-pointer"
    >
      {/* ── Top Cover Banner ──────────────────────────────────────────────── */}
      <div className="relative h-44 w-full overflow-hidden sm:h-48">
        <img
          src={brand.coverImage}
          alt={brand.name}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-108' : 'scale-100'
          }`}
        />
        {/* Gradients for depth and legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
        <div className={`absolute top-0 inset-x-0 h-1.5 bg-linear-to-r ${brand.accent}`} />

        {/* Top-left Badges */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/10 shadow-sm">
            {brand.category || 'Fashion Atelier'}
          </span>
          {brand.hasSale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ec5800] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              <Tag size={10} />
              -25% Off
            </span>
          )}
        </div>

        {/* Top-right Social Follow Button */}
        <button
          type="button"
          onClick={handleFollowClick}
          aria-pressed={following}
          className={`absolute top-3.5 right-3.5 z-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 active:scale-95 shadow-md ${
            following
              ? 'border border-white/20 bg-white/20 text-white hover:bg-red-500/80 hover:border-red-400'
              : 'border border-white/30 bg-[#ec5800] text-white hover:bg-[#d04f00]'
          }`}
          title={following ? 'Unfollow' : 'Follow'}
        >
          {following ? (
            <>
              <Check size={13} className="text-white" />
              <span>{t('discovery', 'following')}</span>
            </>
          ) : (
            <>
              <Heart size={13} className="text-white" />
              <span>{t('discovery', 'follow')}</span>
            </>
          )}
        </button>
      </div>

      {/* ── Profile Identity & Details Body ───────────────────────────────── */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-3">
        {/* Overlapping Avatar Header */}
        <div className="flex items-end justify-between gap-3 -mt-12 mb-3">
          <div className="relative">
            <div className={`h-18 w-18 overflow-hidden rounded-2xl p-0.5 bg-linear-to-tr ${brand.accent} shadow-xl ring-4 ring-surface-alt`}>
              <img
                src={brand.coverImage}
                alt={brand.name}
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            {/* Live activity indicator pulse */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface-alt ring-2 ring-surface-alt">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>

          {/* Share & Quick Action Buttons */}
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line bg-raised text-muted transition-colors hover:border-line-strong hover:bg-raised-strong hover:text-strong"
              title="Share Brand Profile"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            </button>
          </div>
        </div>

        {/* Name, Verified Badge & Handle */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-strong transition-colors group-hover:text-[#ec5800] sm:text-xl">
              {brand.name}
            </h3>
            <BadgeCheck size={18} className="text-[#ec5800] shrink-0" />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-strong/80">{brand.handle || `@${brand.slug}`}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} className="text-muted" />
              {brand.location}
            </span>
            {brand.foundedDate && (
              <>
                <span>•</span>
                <span>Est. {brand.foundedDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Bio / Tagline */}
        <p className="mt-2.5 text-xs text-muted leading-relaxed line-clamp-2">
          {brand.tagline}
        </p>

        {/* Hashtags */}
        {brand.tags && brand.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {brand.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-raised px-2 py-0.5 text-[10px] font-medium text-muted hover:text-strong"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Social Stats Counter Bar ──────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-line/60 bg-raised/70 p-2.5 text-center">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-strong">{brand.followersCount || '24.5K'}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted">Followers</p>
          </div>
          <div className="space-y-0.5 border-l border-line/60">
            <p className="text-[11px] font-bold text-strong">{brand.productCount || 0}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted">Pieces</p>
          </div>
          <div className="space-y-0.5 border-l border-line/60">
            <p className="text-[11px] font-bold text-strong flex items-center justify-center gap-0.5">
              <Star size={10} className="fill-[#ec5800] text-[#ec5800]" />
              {brand.rating || 4.9}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted">Rating</p>
          </div>
          <div className="space-y-0.5 border-l border-line/60">
            <p className="text-[11px] font-bold text-strong">
              {establishedYears ? `${establishedYears}y` : 'Atelier'}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted">Heritage</p>
          </div>
        </div>

        {/* ── Media Gallery Preview Grid (Social Media Post Previews) ─────── */}
        {brand.previewImages && brand.previewImages.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-muted">
                Collection Preview
              </span>
              <span className="text-[10px] text-[#ec5800] group-hover:underline">
                View all ({brand.productCount})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 overflow-hidden rounded-xl">
              {brand.previewImages.slice(0, 4).map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="group/img relative aspect-square overflow-hidden rounded-lg bg-surface border border-line"
                >
                  <img
                    src={imgSrc}
                    alt={`${brand.name} preview ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-115"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover/img:bg-black/30" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Card Footer CTA ──────────────────────────────────────────────── */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-line/60 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <ShoppingBag size={13} className="text-[#ec5800]" />
            <span className="truncate max-w-[140px] sm:max-w-[170px]">
              {brand.headquarters || brand.location}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-[#ec5800] transition-transform duration-200 group-hover:translate-x-1">
            <span>{t('discovery', 'viewBrand')}</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  )
}

export default SocialBrandCard
