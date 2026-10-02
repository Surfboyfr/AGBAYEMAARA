import { useEffect } from 'react'
import { TriangleAlert, X } from 'lucide-react'

// Destructive-action confirmation used before deletes. The caller decides the
// wording (title + message) and what happens on confirm, so the same dialog
// can guard products, orders or anything added later.
const DeleteConfirmationModal = ({ isOpen, title = 'Are you sure?', message, onClose, onConfirm }) => {
  // Escape to dismiss + background scroll lock while open.
  useEffect(() => {
    if (!isOpen) return undefined
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role='alertdialog'
      aria-modal='true'
      aria-label={title}
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='animate-pop-in w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface-alt shadow-2xl'>
        <div className='flex items-start justify-between gap-4 px-6 pt-6'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500'>
            <TriangleAlert size={20} aria-hidden='true' />
          </span>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-muted transition-colors hover:bg-raised-strong hover:text-strong'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <div className='px-6 pb-2 pt-4'>
          <h2 className='text-lg font-bold tracking-tight text-strong'>{title}</h2>
          <p className='mt-2 text-sm leading-relaxed text-muted'>{message}</p>
        </div>

        <div className='flex flex-col-reverse gap-3 px-6 pb-6 pt-4 sm:flex-row sm:justify-end'>
          <button
            onClick={onClose}
            className='rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-red-700 active:scale-[0.98]'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
