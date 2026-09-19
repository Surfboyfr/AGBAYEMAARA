import { Link } from 'react-router-dom'
import { MapPin, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../../Context/LanguageContext'

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Full-width editorial lead card — the "story" content units.
const HeroEditorialCard = ({ card }) => {
  const { t } = useLanguage()

  return (
    <article className="card-lift group relative overflow-hidden rounded-3xl bg-[#12141A] shadow-card h-130">
      <img
        src={card.media}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />

      {card.brand && (
        <Link
          to={`/brands/${card.brand.slug}/story/${card.unitId}`}
          className="absolute inset-0 z-10"
          aria-label={card.title}
        />
      )}

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-10 max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-[#ec5800] px-3 py-1 font-bold tracking-wider text-white uppercase">
            {t('discovery', 'storyBadge')}
          </span>
          {card.publishDate && (
            <span className="text-white/50">{formatDate(card.publishDate)}</span>
          )}
        </div>

        <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
          {card.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm text-white/70 sm:text-base">
          {card.body}
        </p>

        <div className="relative z-20 mt-5 flex flex-wrap items-center gap-4">
          {card.brand && (
            <Link
              to={`/brands/${card.brand.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#ec5800] transition-colors"
            >
              <MapPin size={14} className="text-[#ec5800]" />
              {card.brand.name}
              {card.location ? ` — ${card.location}` : ''}
            </Link>
          )}
          {card.product && (
            <Link
              to={`/shop/product/${card.product.id}`}
              className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ec5800] hover:text-white"
            >
              {t('discovery', 'shopTheLook')}
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default HeroEditorialCard
