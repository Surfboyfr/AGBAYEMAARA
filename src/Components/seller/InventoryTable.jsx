import { Pencil, Trash2 } from 'lucide-react'
import ProductImage from './ProductImage'
import {
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_TONES,
  formatPrice,
  getProductStatus,
} from '../../data/sellerMockData'

const Th = ({ children, className = '' }) => (
  <th
    scope='col'
    className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted ${className}`}
  >
    {children}
  </th>
)

// Inventory table — image / name / category / price / stock / status /
// actions. Rows are driven by the already-filtered list the page passes in,
// so search + filters stay page concerns.
const InventoryTable = ({ products, onEdit, onDelete }) => (
  <div className='overflow-x-auto rounded-2xl border border-line bg-surface-alt'>
    <table className='w-full min-w-[860px] text-sm'>
      <thead className='border-b border-line bg-raised/50'>
        <tr>
          <Th>Image</Th>
          <Th>Product</Th>
          <Th>Category</Th>
          <Th>Price</Th>
          <Th>Stock</Th>
          <Th>Status</Th>
          <Th className='text-right'>Actions</Th>
        </tr>
      </thead>
      <tbody className='divide-y divide-line'>
        {products.map((product) => {
          const status = getProductStatus(product.stock)
          return (
            <tr
              key={product.id}
              className='transition-colors duration-150 hover:bg-raised'
            >
              <td className='px-4 py-3'>
                <ProductImage src={product.image} alt={product.name} />
              </td>
              <td className='max-w-[240px] px-4 py-3'>
                <p className='truncate font-semibold text-strong'>{product.name}</p>
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-muted'>{product.category}</td>
              <td className='whitespace-nowrap px-4 py-3 font-bold text-strong'>
                {formatPrice(product.price)}
              </td>
              <td className='whitespace-nowrap px-4 py-3'>
                <span
                  className={`font-bold ${
                    product.stock === 0
                      ? 'text-red-500'
                      : product.stock <= LOW_STOCK_THRESHOLD
                        ? 'text-amber-500'
                        : 'text-strong'
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td className='whitespace-nowrap px-4 py-3'>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS_TONES[status]}`}
                >
                  {status}
                </span>
              </td>
              <td className='px-4 py-3'>
                <div className='flex items-center justify-end gap-1'>
                  <button
                    onClick={() => onEdit(product)}
                    className='rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-raised-strong hover:text-[#ec5800]'
                    aria-label={`Edit ${product.name}`}
                    title='Edit'
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className='rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400'
                    aria-label={`Delete ${product.name}`}
                    title='Delete'
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default InventoryTable
