// KPI card for the dashboard: label, big value, trend hint and a tinted
// icon tile. `tone` picks the accent color so four cards can read differently
// while sharing one shape.
const TONES = {
  accent: 'bg-[#ec5800]/10 text-[#ec5800]',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  sky: 'bg-sky-500/10 text-sky-500',
  amber: 'bg-amber-500/10 text-amber-500',
}

const SellerStatCard = ({ icon: Icon, label, value, hint, hintTone = 'muted', tone = 'accent' }) => (
  <div className='rounded-2xl border border-line bg-surface-alt p-5 transition-all duration-300 hover:border-line-strong hover:shadow-card'>
    <div className='flex items-start justify-between gap-3'>
      <div className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-wider text-muted'>{label}</p>
        <p className='mt-2 text-2xl font-black tracking-tight text-strong sm:text-3xl'>
          {value}
        </p>
        {hint && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              hintTone === 'good'
                ? 'text-emerald-500'
                : hintTone === 'warn'
                  ? 'text-amber-500'
                  : 'text-faint'
            }`}
          >
            {hint}
          </p>
        )}
      </div>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone] ?? TONES.accent}`}
      >
        <Icon size={20} aria-hidden='true' />
      </span>
    </div>
  </div>
)

export default SellerStatCard
