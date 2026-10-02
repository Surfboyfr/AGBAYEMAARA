import { useMemo, useState } from 'react'
import { ChevronDown, Plus, Search, SearchX, Store, X } from 'lucide-react'
import InventoryTable from '../../Components/seller/InventoryTable'
import ProductForm from '../../Components/seller/ProductForm'
import DeleteConfirmationModal from '../../Components/seller/DeleteConfirmationModal'
import { useSeller } from '../../Context/SellerContext'
import { PRODUCT_STATUS, getProductStatus } from '../../data/sellerMockData'

const ALL = 'All'

const selectClass =
  'w-full appearance-none rounded-lg border border-line bg-raised py-2.5 pl-3.5 pr-9 text-sm text-strong transition-colors focus:border-line-strong focus:outline-none lg:w-44'

const SkeletonRows = () => (
  <div className='space-y-3 rounded-2xl border border-line bg-surface-alt p-4' aria-hidden='true'>
    {[...Array(6)].map((_, i) => (
      <div key={i} className='animate-pulse h-12 w-full rounded-lg bg-raised' />
    ))}
  </div>
)

// Inventory management: live search + category/stock-status filters over the
// shared seller product state, with add/edit/delete wired to the context
// (local state today, API calls later).
const SellerInventory = () => {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useSeller()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Options derive from the data so new categories show up automatically.
  const categoryOptions = useMemo(
    () => [ALL, ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  )
  const statusOptions = [ALL, ...Object.values(PRODUCT_STATUS)]

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      const matchesCategory = category === ALL || product.category === category
      const matchesStatus = status === ALL || getProductStatus(product.stock) === status
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, category, status])

  const hasFilters = search.trim() !== '' || category !== ALL || status !== ALL
  const clearFilters = () => {
    setSearch('')
    setCategory(ALL)
    setStatus(ALL)
  }

  const openAdd = () => {
    setEditing(null)
    setIsFormOpen(true)
  }
  const openEdit = (product) => {
    setEditing(product)
    setIsFormOpen(true)
  }

  // Add vs edit funnels through one submit — swap each branch for its API
  // call (POST vs PUT) when the backend lands.
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
          <h1 className='text-xl font-bold tracking-tight text-strong sm:text-2xl'>
            Inventory
          </h1>
          <p className='mt-1 text-sm text-muted'>
            Search, filter and manage stock levels across your catalog.
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

      {/* Toolbar: search + filters */}
      <div className='flex flex-col gap-3 rounded-2xl border border-line bg-surface-alt p-4 lg:flex-row lg:items-center'>
        <div className='group relative flex-1'>
          <Search
            size={15}
            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors group-focus-within:text-muted'
            aria-hidden='true'
          />
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search by name, category or description…'
            aria-label='Search inventory'
            className='w-full rounded-lg border border-line bg-raised py-2.5 pl-10 pr-4 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'
          />
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:flex'>
          <div className='relative'>
            <label htmlFor='inventory-category' className='sr-only'>
              Filter by category
            </label>
            <select
              id='inventory-category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === ALL ? 'All categories' : option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint'
              aria-hidden='true'
            />
          </div>

          <div className='relative'>
            <label htmlFor='inventory-status' className='sr-only'>
              Filter by stock status
            </label>
            <select
              id='inventory-status'
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === ALL ? 'All statuses' : option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint'
              aria-hidden='true'
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className='inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong lg:self-auto'
          >
            <X size={13} aria-hidden='true' />
            Clear
          </button>
        )}
      </div>

      <p className='text-xs font-medium text-faint' role='status'>
        Showing {filtered.length} of {products.length} products
      </p>

      {/* Table / states */}
      {isLoading ? (
        <SkeletonRows />
      ) : products.length === 0 ? (
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
            <Store size={26} aria-hidden='true' />
          </span>
          <div>
            <p className='text-lg font-bold text-strong'>Your catalog is empty</p>
            <p className='mx-auto mt-1 max-w-sm text-sm text-muted'>
              Add your first product to start tracking stock and orders.
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
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
            <SearchX size={26} aria-hidden='true' />
          </span>
          <div>
            <p className='text-lg font-bold text-strong'>No products match</p>
            <p className='mx-auto mt-1 max-w-sm text-sm text-muted'>
              Try a different search term or clear the filters.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className='inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
          >
            Clear filters
          </button>
        </div>
      ) : (
        <InventoryTable products={filtered} onEdit={openEdit} onDelete={setDeleting} />
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

export default SellerInventory
