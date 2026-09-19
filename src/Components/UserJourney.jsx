import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Compass,
  Heart,
  Package,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react'
import { useFollow } from '../Context/FollowContext'
import { useLanguage } from '../Context/LanguageContext'

// ── Deep links ────────────────────────────────────────────────────────────────
// Each step points at the exact surface where it happens:
//   discover  → the discovery feed itself (the loop's starting point)
//   story     → a real story unit from the content set
//   explore   → a brand details page
//   follow    → the same brand page, where the Follow button lives
//   return    → the Following feed
//   drop      → the discovery feed, auto-scrolled to the newest drop card
//   buy       → the shop
//   fulfilment→ the orders page, where coordination status is tracked
//   receive   → back to discovery — the journey folds into a loop
const JOURNEY_STEPS = [
  { key: 'discover', icon: Compass, to: '/' },
  { key: 'story', icon: BookOpen, to: '/brands/lisa-folawiyo/story/c1' },
  { key: 'explore', icon: Store, to: '/brands/ashluxe' },
  { key: 'follow', icon: Heart, to: '/brands/ashluxe' },
  { key: 'return', icon: RotateCcw, to: '/following' },
  { key: 'drop', icon: Sparkles, to: '/', state: { journeyFocus: 'drop' } },
  { key: 'buy', icon: ShoppingBag, to: '/shop' },
  { key: 'fulfilment', icon: Package, to: '/orders' },
  { key: 'receive', icon: PackageCheck, to: '/' },
]

// One step card: icon, step number, title, description, and a deep-link CTA.
const JourneyCard = ({ step, stepNumber, ariaHidden }) => {
  const { t } = useLanguage()
  const { isFollowing } = useFollow()
  const Icon = step.icon
  const isFollowStep = step.key === 'follow'

  const ctaLabel = isFollowStep
    ? isFollowing('ashluxe')
      ? t('discovery', 'following')
      : t('discovery', 'follow')
    : t('journey', 'ctaLabel')

  return (
    <Link
      to={step.to}
      state={step.state}
      tabIndex={ariaHidden ? -1 : undefined}
      className='card-lift flex w-64 shrink-0 flex-col rounded-2xl border border-line bg-surface-alt p-5 shadow-card transition-colors hover:border-line-strong'
    >
      <div className='flex items-center justify-between'>
        <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ec5800]/15 text-[#ec5800]'>
          <Icon size={17} />
        </span>
        <span className='text-xs font-bold text-faint'>
          {String(stepNumber).padStart(2, '0')}
        </span>
      </div>
      <h3 className='mt-4 text-base font-bold text-strong'>
        {t('journey', `steps.${step.key}.title`)}
      </h3>
      <p className='mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted'>
        {t('journey', `steps.${step.key}.description`)}
      </p>
      <span className='mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#ec5800]'>
        {ctaLabel}
        <ChevronRight size={13} />
      </span>
    </Link>
  )
}

// ── User journey marquee ──────────────────────────────────────────────────────
// A continuously scrolling strip of journey steps; hover or keyboard focus
// pauses it (see .journey-marquee-* rules in App.css), and motion is disabled
// for prefers-reduced-motion users. The strip holds two copies of the step
// list for a seamless loop — the second copy is hidden from a11y tooling.
// "See a new drop" passes router state to the discovery feed, which scrolls
// to and briefly highlights the newest drop card on arrival.
const UserJourney = () => {
  const { t } = useLanguage()

  return (
    <section
      aria-label={t('journey', 'ariaLabel')}
      className='mt-16 border-t border-line pt-10'
    >
      <header className='mb-6'>
        <p className='mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]'>
          <RotateCcw size={14} />
          {t('journey', 'eyebrow')}
        </p>
        <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>
          {t('journey', 'title')}
        </h2>
        <p className='mt-2 max-w-xl text-sm text-muted'>
          {t('journey', 'subtitle')}
        </p>
      </header>

      <div className='journey-marquee-container rounded-3xl border border-line bg-raised py-6'>
        <div className='journey-marquee-track'>
          {[...JOURNEY_STEPS, ...JOURNEY_STEPS].map((step, index) => {
            const ariaHidden = index >= JOURNEY_STEPS.length
            const stepNumber = (index % JOURNEY_STEPS.length) + 1

            return (
              <div
                key={`${step.key}-${index}`}
                aria-hidden={ariaHidden || undefined}
                className='journey-marquee-card flex items-center pr-4'
              >
                <JourneyCard
                  step={step}
                  stepNumber={stepNumber}
                  ariaHidden={ariaHidden}
                />
                {/* Every card is followed by an arrow — including the last,
                    which points back to step 01 to read as a loop. */}
                <ChevronRight
                  size={18}
                  aria-hidden='true'
                  className='ml-4 shrink-0 text-faint'
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default UserJourney
