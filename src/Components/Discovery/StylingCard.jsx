import { Link } from 'react-router-dom'
import { useLanguage } from '../../Context/LanguageContext'

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Styling card — "how to wear it" content units with a shop-the-look hook.
const StylingCard = ({ card }) => {
  const { t } = useLanguage()

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12141A]">
      <div className="relative h-56 overflow-hidden">
        <img
          src={card.media}
          alt={card.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          {card.type === 'drop'
            ? t('discovery', 'dropBadge')
            : t('discovery', 'stylingBadge')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-white">{card.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-white/60">{card.body}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 pt-1">
          {card.brand && (
            <Link
              to={`/brands/${card.brand.slug}`}
              className="text-xs font-semibold text-white/70 hover:text-[#ec5800] transition-colors"
            >
              {card.brand.name}
            </Link>
          )}
          {card.product && (
            <Link
              to={`/shop/product/${card.product.id}`}
              className="mt-auto inline-flex items-center gap-1 self-start rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-[#ec5800] hover:text-white"
            >
              {t('discovery', 'shopTheLook')}
            </Link>
          )}
        </div>
        {card.publishDate && (
          <p className="mt-3 text-xs text-white/40">{formatDate(card.publishDate)}</p>
        )}
      </div>
    </article>
  )
}

export default StylingCard
