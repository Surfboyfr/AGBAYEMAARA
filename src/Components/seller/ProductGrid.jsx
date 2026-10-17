import { Pencil, Trash2 } from 'lucide-react'
import ProductImage from './ProductImage'
import {
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_TONES,
  formatPrice,
  getProductStatus,
} from '../../data/sellerMockData'

// Products grid — the catalog as cards instead of a table: media + status
// chip on top, then name/category, description, price and stock, with the
// same edit/delete actions (and labels) the table used.
const ProductGrid = ({ products, onEdit, onDelete }) => (
  <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
    {products.map((product) => {
      const status = getProductStatus(product.stock)
      const stockTone =
        product.stock === 0
          ? 'text-red-500'
          : product.stock <= LOW_STOCK_THRESHOLD
            ? 'text-amber-500'
            : 'text-strong'
      return (
        <article
          key={product.id}
          className='group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-alt transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card'
        >
          <div className='relative'>
            <ProductImage
              src={product.image}
              alt={product.name}
              className='h-36 w-full rounded-none'
            />
            {/* Light backing keeps the tinted chip legible over any photo. */}
            <span className='absolute left-3 top-3 inline-flex rounded-full bg-surface-alt/85 p-0.5 backdrop-blur-sm'>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS_TONES[status]}`}
              >
                {status}
              </span>
            </span>
          </div>

          <div className='flex flex-1 flex-col gap-3 p-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='truncate font-semibold text-strong' title={product.name}>
                  {product.name}
                </h3>
                <p className='mt-0.5 text-xs font-medium text-muted'>{product.category}</p>
              </div>
              <p className='shrink-0 text-base font-black tracking-tight text-strong'>
                {formatPrice(product.price, product.currency)}
              </p>
            </div>

            <p className='line-clamp-2 text-xs leading-relaxed text-muted'>
              {product.description || 'No description yet'}
            </p>

            <div className='mt-auto flex items-center justify-between gap-3 border-t border-line pt-3'>
              <p className='text-xs text-muted'>
                Stock{' '}
                <span className={`font-bold ${stockTone}`}>{product.stock}</span>
              </p>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onEdit(product)}
                  className='rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-raised-strong hover:text-[#ec5800]'
                  aria-label={`Edit ${product.name}`}
                  title='Edit product'
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className='rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400'
                  aria-label={`Delete ${product.name}`}
                  title='Delete product'
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </article>
      )
    })}
  </div>
)

export default ProductGrid
