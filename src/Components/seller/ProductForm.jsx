import { useEffect, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { SELLER_CATEGORIES } from '../../data/sellerMockData'

const EMPTY_FORM = {
  image: '',
  name: '',
  category: SELLER_CATEGORIES[0],
  price: '',
  stock: '',
  description: '',
}

const inputClass =
  'w-full rounded-lg border border-line bg-raised px-3.5 py-2.5 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted'

// Add/Edit product modal. Mounted by the page only while open (conditional
// render), which seeds `form` fresh from `product` on every mount: `product`
// is null for a fresh add or the row being edited; `onSubmit` receives plain
// form values so the page decides whether to add or update (and, later, which
// API to call).
const ProductForm = ({ product, onClose, onSubmit }) => {
  const [form, setForm] = useState(() =>
    product
      ? {
          image: product.image ?? '',
          name: product.name ?? '',
          category: product.category ?? SELLER_CATEGORIES[0],
          price: String(product.price ?? ''),
          stock: String(product.stock ?? ''),
          description: product.description ?? '',
        }
      : EMPTY_FORM
  )

  // Close on Escape + lock background scroll while open (same pattern as
  // AuthModal).
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      image: form.image.trim(),
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number.parseInt(form.stock, 10),
      description: form.description.trim(),
    })
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={product ? 'Edit product' : 'Add product'}
      className='fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='animate-pop-in my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface-alt shadow-2xl'>
        <div className='h-0.5 w-full bg-linear-to-r from-transparent via-[#ec5800]/50 to-transparent' />

        <div className='flex items-center justify-between gap-4 border-b border-line px-6 py-4'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
              {product ? 'Edit product' : 'New product'}
            </p>
            <h2 className='mt-0.5 text-lg font-bold tracking-tight text-strong'>
              {product ? product.name : 'Add to your catalog'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-muted transition-colors hover:bg-raised-strong hover:text-strong'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='max-h-[calc(100vh-10rem)] space-y-4 overflow-y-auto px-6 py-5'>
          {/* Image */}
          <div>
            <label htmlFor='product-image' className={labelClass}>
              Product image URL
            </label>
            <div className='flex items-center gap-3'>
              {form.image ? (
                <img
                  src={form.image}
                  alt=''
                  className='h-11 w-11 shrink-0 rounded-lg border border-line object-cover'
                />
              ) : (
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-faint'>
                  <ImagePlus size={17} />
                </span>
              )}
              <input
                id='product-image'
                type='text'
                value={form.image}
                onChange={setField('image')}
                placeholder='https://example.com/image.jpg'
                className={inputClass}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor='product-name' className={labelClass}>
              Product name
            </label>
            <input
              id='product-name'
              type='text'
              value={form.name}
              onChange={setField('name')}
              placeholder='e.g. Ankara Wrap Dress'
              required
              autoFocus
              className={inputClass}
            />
          </div>

          {/* Category / Price / Stock */}
          <div className='grid gap-4 sm:grid-cols-3'>
            <div>
              <label htmlFor='product-category' className={labelClass}>
                Category
              </label>
              <select
                id='product-category'
                value={form.category}
                onChange={setField('category')}
                className={`${inputClass} appearance-none`}
              >
                {SELLER_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor='product-price' className={labelClass}>
                Price ($)
              </label>
              <input
                id='product-price'
                type='number'
                min='0.01'
                step='0.01'
                value={form.price}
                onChange={setField('price')}
                placeholder='0.00'
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor='product-stock' className={labelClass}>
                Stock
              </label>
              <input
                id='product-stock'
                type='number'
                min='0'
                step='1'
                value={form.stock}
                onChange={setField('stock')}
                placeholder='0'
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor='product-description' className={labelClass}>
              Description
            </label>
            <textarea
              id='product-description'
              value={form.description}
              onChange={setField('description')}
              rows={3}
              placeholder='Describe the product, materials and fit…'
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className='flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='rounded-xl bg-[#ec5800] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
            >
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
