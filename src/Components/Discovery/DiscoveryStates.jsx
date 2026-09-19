import { RefreshCw, Compass } from 'lucide-react'
import { useLanguage } from '../../Context/LanguageContext'

// Skeleton card placeholders shown while the feed "loads".
export const DiscoverySkeletonCard = ({ tall = false }) => (
  <div
    className={`animate-pulse overflow-hidden rounded-2xl border border-line bg-surface-alt ${
      tall ? 'h-130' : 'h-80'
    }`}
    aria-hidden="true"
  >
    <div className="h-3/5 w-full bg-raised" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-1/3 rounded bg-raised-strong" />
      <div className="h-4 w-3/4 rounded bg-raised-strong" />
      <div className="h-3 w-full rounded bg-raised" />
      <div className="h-3 w-5/6 rounded bg-raised" />
    </div>
  </div>
)

export const DiscoverySkeletonFeed = () => (
  <div className="space-y-5" role="status" aria-label="Loading feed">
    <DiscoverySkeletonCard tall />
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <DiscoverySkeletonCard />
      <DiscoverySkeletonCard />
      <DiscoverySkeletonCard />
    </div>
  </div>
)

// Error state with retry — used when feed assembly throws.
export const DiscoveryErrorState = ({ onRetry }) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl bg-surface-alt shadow-card px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <RefreshCw size={24} />
      </span>
      <div>
        <h3 className="text-lg font-bold text-strong">{t('discovery', 'errorTitle')}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">{t('discovery', 'errorBody')}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d04f00] active:scale-95"
      >
        <RefreshCw size={15} />
        {t('discovery', 'retry')}
      </button>
    </div>
  )
}

// Empty state — e.g. FOLLOWING tab before the user follows anyone.
export const DiscoveryEmptyState = ({ onBrowse }) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl bg-raised px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ec5800]/15 text-[#ec5800]">
        <Compass size={24} />
      </span>
      <div>
        <h3 className="text-lg font-bold text-strong">{t('discovery', 'emptyFollowingTitle')}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">{t('discovery', 'emptyFollowingBody')}</p>
      </div>
      <button
        onClick={onBrowse}
        className="inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-6 py-2.5 text-sm font-semibold text-strong transition hover:bg-[#d04f00] active:scale-95"
      >
        {t('discovery', 'emptyFollowingCta')}
      </button>
    </div>
  )
}
