import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useLanguage } from '../../Context/LanguageContext'

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Milestone card — brand announcements (atelier openings, awards, expansions).
const MilestoneCard = ({ card }) => {
  const { t } = useLanguage()

  return (
    <article className="card-lift group relative flex h-full min-h-64 flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-[#ec5800]/15 via-[#12141A] to-[#12141A] shadow-card p-6">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ec5800]/20 text-[#ec5800]">
            <CalendarDays size={17} />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ec5800]">
            {t('discovery', 'milestoneBadge')}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug text-white">{card.title}</h3>
        <p className="mt-2 line-clamp-4 text-sm text-white/60">{card.body}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {card.brand ? (
          <Link
            to={`/brands/${card.brand.slug}`}
            className="text-xs font-semibold text-white/70 hover:text-[#ec5800] transition-colors"
          >
            {card.brand.name}
          </Link>
        ) : (
          <span />
        )}
        {card.publishDate && (
          <span className="text-xs text-white/40">{formatDate(card.publishDate)}</span>
        )}
      </div>
    </article>
  )
}

export default MilestoneCard
