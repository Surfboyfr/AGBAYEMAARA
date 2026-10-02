import { useMemo, useState } from 'react'
import { Package, Plus } from 'lucide-react'
import ProductTable from '../../Components/seller/ProductTable'
import ProductForm from '../../Components/seller/ProductForm'
import DeleteConfirmationModal from '../../Components/seller/DeleteConfirmationModal'
import { useSeller } from '../../Context/SellerContext'

const SkeletonRows = () => (
  <div className='space-y-3 rounded-2xl border border-line bg-surface-alt p-4' aria-hidden='true'>
    {[...Array(6)].map((_, i) => (
      <div key={i} className='animate-pulse h-12 w-full rounded-lg bg-raised' />
    ))}
  </div>
)

// Products management: the full catalog with add/edit/delete through the
// ProductForm modal. Shares product state with the inventory screen via
// SellerContext, so changes show up on both surfaces.
const SellerProducts = () => {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useSeller()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Newest first — matches the "recent" ordering on the dashboard.
  const sorted = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [products]
  )

  const openAdd = () => {
    setEditing(null)
    setIsFormOpen(true)
  }
  const openEdit = (product) => {
    setEditing(product)
    setIsFormOpen(true)
  }

  // POST /api/seller/products vs PUT /api/seller/products/:id later.
  const handleFormSubmit = (values) => {
    if (editing) {
      updateProduct(editing.id, values)
    } else {
      addProduct(values)
    }
    setIsFormOpen(false)
    setEditing(null)
  }

  const handleDelete = () => {
    if (deleting) deleteProduct(deleting.id)
    setDeleting(null)
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold tracking-tight text-strong sm:text-2xl'>Products</h1>
          <p className='mt-1 text-sm text-muted'>
            Create, edit and remove listings in your catalog.
          </p>
        </div>
        <button
          onClick={openAdd}
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#ec5800] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
        >
          <Plus size={16} aria-hidden='true' />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : products.length === 0 ? (
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
            <Package size={26} aria-hidden='true' />
          </span>
          <div>
            <p className='text-lg font-bold text-strong'>No products yet</p>
            <p className='mx-auto mt-1 max-w-sm text-sm text-muted'>
              List your first product — name, price, stock and a description
              are all you need.
            </p>
          </div>
          <button
            onClick={openAdd}
            className='inline-flex items-center gap-2 rounded-xl bg-[#ec5800] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
          >
            <Plus size={16} aria-hidden='true' />
            Add Product
          </button>
        </div>
      ) : (
        <>
          <p className='text-xs font-medium text-faint' role='status'>
            {sorted.length} product{sorted.length === 1 ? '' : 's'} in your catalog
          </p>
          <ProductTable products={sorted} onEdit={openEdit} onDelete={setDeleting} />
        </>
      )}

      {isFormOpen && (
        <ProductForm
          product={editing}
          onClose={() => {
            setIsFormOpen(false)
            setEditing(null)
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(deleting)}
        title='Delete product?'
        message={
          deleting
            ? `"${deleting.name}" will be permanently removed from your catalog. This cannot be undone.`
            : ''
        }
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default SellerProducts
