import { CalendarDays, Mail, MapPin, Pencil, Phone, Store, UserRound } from 'lucide-react'
import { formatDate } from '../../data/sellerMockData'

const Field = ({ icon: Icon, label, value }) => (
  <div className='flex items-start gap-3 rounded-xl border border-line bg-raised p-3.5'>
    <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ec5800]/10 text-[#ec5800]'>
      <Icon size={15} aria-hidden='true' />
    </span>
    <div className='min-w-0'>
      <p className='text-[11px] font-semibold uppercase tracking-wider text-faint'>{label}</p>
      <p className='mt-0.5 break-words text-sm font-medium text-strong'>{value}</p>
    </div>
  </div>
)

// Read-only profile summary. The Edit Profile button lives in the card
// header so the page can simply toggle its edit form.
const SellerProfileCard = ({ profile, onEdit }) => (
  <div className='rounded-3xl border border-line bg-surface-alt'>
    <div className='flex flex-col gap-5 border-b border-line p-6 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-4'>
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={`${profile.businessName} logo`}
            className='h-16 w-16 shrink-0 rounded-2xl border border-line object-cover'
          />
        ) : (
          <span className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-line bg-raised text-faint'>
            <Store size={24} aria-hidden='true' />
          </span>
        )}
        <div className='min-w-0'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
            Seller
          </p>
          <h2 className='truncate text-xl font-bold tracking-tight text-strong'>
            {profile.businessName}
          </h2>
          <p className='truncate text-sm text-muted'>Owned by {profile.ownerName}</p>
        </div>
      </div>
      <button
        onClick={onEdit}
        className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:bg-raised-strong hover:text-strong active:scale-[0.98]'
      >
        <Pencil size={15} />
        Edit Profile
      </button>
    </div>

    <div className='p-6'>
      <p className='mb-5 text-sm leading-relaxed text-muted'>{profile.description}</p>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field icon={Store} label='Business name' value={profile.businessName} />
        <Field icon={UserRound} label='Owner name' value={profile.ownerName} />
        <Field icon={Mail} label='Email' value={profile.email} />
        <Field icon={Phone} label='Phone' value={profile.phone} />
        <Field icon={MapPin} label='Location' value={profile.location} />
        <Field
          icon={CalendarDays}
          label='Seller since'
          value={formatDate(profile.joinedAt)}
        />
      </div>
    </div>
  </div>
)

export default SellerProfileCard
