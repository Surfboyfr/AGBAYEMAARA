import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useFollow } from '../../Context/FollowContext'
import { useLanguage } from '../../Context/LanguageContext'

// Brand card for the discovery feed — follows are scoped through FollowContext.
const BrandCard = ({ card }) => {
  const { isFollowing, toggleFollowBrand } = useFollow()
  const { t } = useLanguage()

  const following = isFollowing(card.slug)

  return (
    <article className="card-lift group relative overflow-hidden rounded-2xl bg-[#12141A] shadow-card h-105">
      <img
        src={card.coverImage}
        alt={card.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

      {card.hasSale && (
        <span className="absolute top-4 left-4 rounded-full bg-[#ec5800] px-3 py-1 text-xs font-bold text-white">
          {t('discovery', 'saleBadge')}
        </span>
      )}

      <button
        onClick={() => toggleFollowBrand(card.slug)}
        className={`absolute top-4 right-4 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all duration-200 ${
          following
            ? 'border-white/30 bg-white/20 text-white'
            : 'border-white/40 bg-black/30 text-white hover:bg-white hover:text-black'
        }`}
      >
        {following ? t('discovery', 'following') : t('discovery', 'follow')}
      </button>

      <div className="relative flex h-full flex-col justify-end p-5">
        <p className="text-xs font-medium tracking-wide text-white/60">
          {card.productCount} {t('discovery', 'productsLabel')}
        </p>
        <h3 className="mt-1 text-xl font-bold text-white">{card.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/60">{card.tagline}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-white/50">
            <MapPin size={12} />
            {card.location}
          </span>
          <Link
            to={`/brands/${card.slug}`}
            className="text-xs font-semibold text-[#ec5800] hover:text-[#ff7f2a] transition-colors"
          >
            {t('discovery', 'viewBrand')}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BrandCard
