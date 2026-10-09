import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Compass, ShoppingBag, Store } from 'lucide-react'
import WelcomeNavBar from '../Components/WelcomeNavBar'
import BrandImageMarquee from '../Components/BrandImageMarquee'
import { useLanguage } from '../Context/LanguageContext'
import welcomeBackground from '../assets/imgFolder/welcome-background-image.jfif'

// The Welcome page — the page that follows the loading screen. BootFlow
// renders it as its own boot step (phase 'welcome'), so it mounts alone with
// no app behind it: it states what the site is in a few lines, and "Get
// Started" hands control back to the boot flow via `onGetStarted`, which
// runs the currency / sign-up steps and then mounts the app — shoppers land
// on the discovery feed, brand owners on their hub.
//
// Design: a crisp white gallery surface (independent of the light/dark
// theme tokens — the welcome screen is always white) with warm brand-orange
// accents: tinted eyebrow pill, oversized editorial headline, stacked CTAs,
// and three feature cards that lift on hover. The white surface also carries
// a very faint (~7%) full-page brand photograph behind the content: the root
// is `isolate` so the image sits at -z-10 — above the page's white paint,
// below every piece of content — and `pointer-events-none`/`aria-hidden` keep
// it decorative.
const Welcome = ({ onGetStarted }) => {
  const { t } = useLanguage()

  const features = [
    {
      icon: Compass,
      title: t('welcome', 'featureDiscoverTitle'),
      body: t('welcome', 'featureDiscoverBody'),
    },
    {
      icon: BookOpen,
      title: t('welcome', 'featureStoryTitle'),
      body: t('welcome', 'featureStoryBody'),
    },
    {
      icon: ShoppingBag,
      title: t('welcome', 'featureShopTitle'),
      body: t('welcome', 'featureShopBody'),
    },
  ]

  return (
    <div
      data-welcome='page'
      className='relative isolate flex min-h-screen flex-col overflow-x-hidden bg-white text-neutral-900'
    >
      {/* ── Faint full-page backdrop photo — decorative, sits behind all
          content (negative z-index inside the root's isolation context). ── */}
      <img
        src={welcomeBackground}
        alt=''
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover object-center opacity-[0.3]'
      />

      <WelcomeNavBar />

      <main className='relative flex flex-1 items-center justify-center overflow-hidden px-5 py-14 w-full'>
        {/* ── Decorative backdrop — warm brand glow + two soft orbs + a faint
            dot grid, all pointer-free and clipped by main's overflow. ────── */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,88,0,0.12),transparent_52%)]'
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl'
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-amber-100 blur-3xl'
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(236,88,0,0.12)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_75%)]'
        />

        <div className='animate-pop-in relative z-10 w-full text-center'>
          <span className='inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600'>
            {t('welcome', 'eyebrow')}
          </span>

          <h1 className='mt-6 text-balance text-4xl font-black tracking-tight text-neutral-900 sm:text-6xl'>
            {t('welcome', 'title')}
          </h1>

          <p className='mx-auto mt-4 max-w-2xl text-balance text-lg leading-relaxed text-neutral-600 sm:text-xs sm:leading-relaxed md:text-lg md:leading-relaxed lg:text-2xl'>
            {t('welcome', 'subtitle')}
          </p>

          {/* <p className='mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500'>
            {t('welcome', 'body')}
          </p> */}

          {/* Central action buttons: Get Started (shopper boot) + Become a seller (/seller/login).
              Stacked so Get Started stays centred on the page. */}
          <div className='mt-8 flex flex-col items-center justify-center gap-3.5'>
            <div>
              <button
                data-welcome='get-started'
                onClick={onGetStarted}
                className='group inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-9 py-4 text-base font-bold tracking-wide text-white shadow-[0_16px_36px_-14px_rgba(236,88,0,0.85)] transition-all duration-200 hover:bg-[#d04f00] hover:shadow-[0_20px_44px_-14px_rgba(236,88,0,0.95)] active:scale-[0.98]'
              >
                {t('welcome', 'getStarted')}
                <ArrowRight
                  size={18}
                  aria-hidden='true'
                  className='transition-transform duration-200 group-hover:translate-x-1'
                />
              </button>
            </div>

            <div className='mb-7'>
              <Link
                to='/seller/login'
                className='group inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-7 py-3 text-sm font-bold tracking-wide text-neutral-800 shadow-sm transition-all duration-200 hover:border-neutral-900 hover:text-[#ec5800] active:scale-[0.98]'
              >
                <Store size={16} className='text-[#ec5800]' />
                <span>Become a seller</span>
              </Link>
            </div>
          </div>

          {/* ── Brand Images Marquee — directly under the Become a seller CTA ── */}
          <BrandImageMarquee />

          <ul className='mx-auto mt-9 grid max-w-3xl gap-4 sm:grid-cols-3'>
            {features.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className='group rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_36px_-18px_rgba(15,23,42,0.25)]'
              >
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-colors duration-300 group-hover:bg-[#ec5800] group-hover:text-white'>
                  <Icon size={18} aria-hidden='true' />
                </span>
                <p className='mt-3.5 text-sm font-bold text-neutral-900'>{title}</p>
                <p className='mt-1 text-xs leading-relaxed text-neutral-500'>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className='border-t border-neutral-200 bg-white px-5 py-5 text-center text-xs text-neutral-400'>
        {t('footer', 'rights')}
      </footer>
    </div>
  )
}

export default Welcome
