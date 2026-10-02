import { useState } from 'react'
import { Check, ImagePlus, X } from 'lucide-react'
import SellerProfileCard from '../../Components/seller/SellerProfileCard'
import { useSeller } from '../../Context/SellerContext'

const inputClass =
  'w-full rounded-lg border border-line bg-raised px-3.5 py-2.5 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted'

const SkeletonCard = () => (
  <div className='rounded-3xl border border-line bg-surface-alt p-6' aria-hidden='true'>
    <div className='flex items-center gap-4'>
      <div className='animate-pulse h-16 w-16 rounded-2xl bg-raised' />
      <div className='flex-1 space-y-2'>
        <div className='animate-pulse h-3 w-24 rounded-lg bg-raised' />
        <div className='animate-pulse h-5 w-48 rounded-lg bg-raised' />
        <div className='animate-pulse h-3 w-32 rounded-lg bg-raised' />
      </div>
    </div>
    <div className='mt-6 grid gap-4 sm:grid-cols-2'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='animate-pulse h-16 rounded-xl bg-raised' />
      ))}
    </div>
  </div>
)

// Seller profile: read-only card by default; "Edit Profile" swaps in a local
// form whose save runs through updateProfile (PUT /api/seller/profile later).
const SellerProfile = () => {
  const { profile, isLoading, updateProfile } = useSeller()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)

  const startEdit = () => {
    setForm(profile)
    setIsEditing(true)
    setSaved(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setSaved(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile({
      avatar: form.avatar.trim(),
      businessName: form.businessName.trim(),
      ownerName: form.ownerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    })
    setIsEditing(false)
    setSaved(true)
  }

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className='mx-auto max-w-3xl space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold tracking-tight text-strong sm:text-2xl'>Profile</h1>
          <p className='mt-1 text-sm text-muted'>
            How your store appears to customers across the platform.
          </p>
        </div>
        {isEditing && (
          <button
            onClick={cancelEdit}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
          >
            <X size={15} aria-hidden='true' />
            Cancel editing
          </button>
        )}
      </div>

      {saved && !isEditing && (
        <p
          role='status'
          className='flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500'
        >
          <Check size={16} aria-hidden='true' />
          Profile updated — saved locally for this demo.
        </p>
      )}

      {isLoading ? (
        <SkeletonCard />
      ) : isEditing ? (
        <form
          onSubmit={handleSubmit}
          className='rounded-3xl border border-line bg-surface-alt'
        >
          <div className='border-b border-line px-6 py-4'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
              Editing
            </p>
            <h2 className='mt-0.5 text-lg font-bold tracking-tight text-strong'>
              Edit profile
            </h2>
          </div>

          <div className='space-y-5 p-6'>
            {/* Avatar */}
            <div>
              <label htmlFor='profile-avatar' className={labelClass}>
                Profile image URL
              </label>
              <div className='flex items-center gap-3'>
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt=''
                    className='h-12 w-12 shrink-0 rounded-xl border border-line object-cover'
                  />
                ) : (
                  <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-line text-faint'>
                    <ImagePlus size={17} />
                  </span>
                )}
                <input
                  id='profile-avatar'
                  type='text'
                  value={form.avatar}
                  onChange={setField('avatar')}
                  placeholder='https://example.com/logo.jpg'
                  className={inputClass}
                />
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <label htmlFor='profile-business' className={labelClass}>
                  Seller / business name
                </label>
                <input
                  id='profile-business'
                  type='text'
                  value={form.businessName}
                  onChange={setField('businessName')}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor='profile-owner' className={labelClass}>
                  Owner name
                </label>
                <input
                  id='profile-owner'
                  type='text'
                  value={form.ownerName}
                  onChange={setField('ownerName')}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor='profile-email' className={labelClass}>
                  Email
                </label>
                <input
                  id='profile-email'
                  type='email'
                  value={form.email}
                  onChange={setField('email')}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor='profile-phone' className={labelClass}>
                  Phone
                </label>
                <input
                  id='profile-phone'
                  type='tel'
                  value={form.phone}
                  onChange={setField('phone')}
                  required
                  className={inputClass}
                />
              </div>
              <div className='sm:col-span-2'>
                <label htmlFor='profile-location' className={labelClass}>
                  Location
                </label>
                <input
                  id='profile-location'
                  type='text'
                  value={form.location}
                  onChange={setField('location')}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor='profile-description' className={labelClass}>
                Business description
              </label>
              <textarea
                id='profile-description'
                value={form.description}
                onChange={setField('description')}
                rows={4}
                required
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={cancelEdit}
                className='rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='rounded-xl bg-[#ec5800] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        <SellerProfileCard profile={profile} onEdit={startEdit} />
      )}
    </div>
  )
}

export default SellerProfile
