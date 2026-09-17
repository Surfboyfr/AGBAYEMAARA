import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useFollow } from '../../Context/FollowContext'
import { useLanguage } from '../../Context/LanguageContext'

// New-brand card — freshly onboarded labels with a sample product hook.
const NewBrandCard = ({ card }) => {
  const { isFollowing, toggleFollowBrand } = useFollow()
  const { t } = useLanguage()

  const following = isFollowing(card.slug)

  return (
    <article className="group relative flex h-full min-h-72 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12141A]">
      <div className="relative h-44 overflow-hidden">
        <img
          src={card.coverImage}
          alt={card.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#12141A] via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#ec5800] px-3 py-1 text-xs font-bold text-white">
          <Sparkles size={12} />
          {t('discovery', 'newBrandBadge')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white">{card.name}</h3>
        <p className="mt-1 text-xs text-white/50">
          {card.productCount != null
            ? `${card.productCount} ${t('discovery', 'productsLabel')}`
            : t('discovery', 'firstDropTeaser')}
        </p>

        {card.sampleProduct && (
          <Link
            to={`/shop/product/${card.sampleProduct.id}`}
            className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:border-white/25"
          >
            <img
              src={card.sampleProduct.productImage}
              alt={card.sampleProduct.productName}
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {card.sampleProduct.productName}
              </p>
              <p className="text-xs text-white/50">
                ${card.sampleProduct.productPrice.toFixed(2)}
              </p>
            </div>
          </Link>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <button
            onClick={() => toggleFollowBrand(card.slug)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              following
                ? 'border-white/30 bg-white/20 text-white'
                : 'border-[#ec5800] bg-[#ec5800]/10 text-[#ec5800] hover:bg-[#ec5800] hover:text-white'
            }`}
          >
            {following ? t('discovery', 'following') : t('discovery', 'follow')}
          </button>
          <Link
            to={`/brands/${card.slug}`}
            className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            {t('discovery', 'viewBrand')}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default NewBrandCard
