import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Package,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import { brands } from '../data/brands'
import { useLanguage } from '../Context/LanguageContext'

// ── Brand-owner hub ───────────────────────────────────────────────────────────
// The surface brand owners land on after choosing "brand" at the boot gate.
// V1 is a showcase of the platform's brands plus a coming-soon toolkit; it
// will grow into real owner tooling as the product progresses.
const BrandOwner = () => {
  const { t } = useLanguage()

  const stats = [
    { icon: Store, label: t('brandOwner', 'statBrands'), value: `${brands.length}` },
    { icon: Package, label: t('brandOwner', 'statDrops'), value: '—' },
    { icon: Users, label: t('brandOwner', 'statOwners'), value: '—' },
    { icon: BarChart3, label: t('brandOwner', 'statRevenue'), value: '—' }
  ]

  return (
    <div className='min-h-screen w-full bg-surface text-strong'>
      <main className='mx-auto max-w-7xl px-5 pb-24 pt-10'>
        {/* Header */}
        <header className='mb-10 text-center'>
          <p className='mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#ec5800]'>
            <Store size={14} />
            {t('brandOwner', 'eyebrow')}
          </p>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            {t('brandOwner', 'title')}
          </h1>
          <p className='mx-auto mt-3 max-w-2xl text-sm text-muted'>
            {t('brandOwner', 'subtitle')}
          </p>
        </header>

        {/* Platform stats (live count + coming-soon slots) */}
        <section
          aria-label={t('brandOwner', 'statsAria')}
          className='mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4'
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className='rounded-2xl border border-line bg-raised p-5 text-center'
            >
              <Icon size={18} className='mx-auto text-[#ec5800]' aria-hidden='true' />
              <p className='mt-2 text-2xl font-bold tracking-tight'>{value}</p>
              <p className='mt-1 text-xs font-medium uppercase tracking-wider text-muted'>
                {label}
              </p>
            </div>
          ))}
        </section>

        {/* Toolkit — real tooling arrives later; be honest about that */}
        <section aria-label={t('brandOwner', 'toolkitAria')} className='mb-12'>
          <h2 className='mb-4 text-xl font-bold tracking-tight'>
            {t('brandOwner', 'toolkitTitle')}
          </h2>
          <div className='grid gap-4 sm:grid-cols-3'>
            {['toolOnboarding', 'toolAnalytics', 'toolFulfilment'].map((key) => (
              <div
                key={key}
                className='rounded-2xl border border-dashed border-line bg-raised p-5'
              >
                <Sparkles size={18} className='text-[#ec5800]' aria-hidden='true' />
                <h3 className='mt-3 text-sm font-bold'>{t('brandOwner', key)}</h3>
                <p className='mt-1 text-xs leading-relaxed text-muted'>
                  {t('brandOwner', `${key}Desc`)}
                </p>
                <span className='mt-3 inline-block rounded-full bg-raised-strong px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted'>
                  {t('brandOwner', 'soonBadge')}
                  </span>
              </div>
            ))}
          </div>
        </section>

        {/* Brand showcase — the hub's main content for now */}
        <section aria-label={t('brandOwner', 'showcaseAria')}>
          <div className='mb-4 flex items-end justify-between gap-4'>
            <h2 className='text-xl font-bold tracking-tight'>
              {t('brandOwner', 'showcaseTitle')}
            </h2>
            <Link
              to='/brands'
              className='inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#ec5800] transition hover:text-[#ff7f2a]'
            >
              {t('brandOwner', 'viewAll')}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/brands/${brand.slug}`}
                className='card-lift group relative overflow-hidden rounded-2xl border border-line shadow-card'
              >
                <img
                  src={brand.coverImage}
                  alt={brand.name}
                  className='h-44 w-full object-cover transition duration-500 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent' />
                <div className='absolute inset-0 flex flex-col justify-end p-5'>
                  <h3 className='text-base font-bold text-white'>{brand.name}</h3>
                  <p className='mt-0.5 line-clamp-1 text-xs text-white/70'>
                    {brand.tagline}
                  </p>
                  <div className='mt-3 flex items-center justify-between'>
                    <span className='text-xs text-white/60'>
                      {brand.productCount} {t('brandOwner', 'productsLabel')}
                    </span>
                    <span className='inline-flex items-center gap-1 text-xs font-semibold text-[#ec5800]'>
                      {t('brandOwner', 'viewBrand')}
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className='pb-8 text-center text-xs text-faint'>
        Àgbáyémáarà ·{' '}
        <Link to='/' className='transition hover:text-strong'>
          {t('brandOwner', 'backToApp')}
        </Link>
      </footer>
    </div>
  )
}

export default BrandOwner
