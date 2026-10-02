import { useMemo, useState } from 'react'
import { ClipboardList, Search, X } from 'lucide-react'
import OrderTable from '../../Components/seller/OrderTable'
import { useSeller } from '../../Context/SellerContext'
import { ORDER_STATUSES } from '../../data/sellerMockData'

const ALL = 'All'

const SkeletonRows = () => (
  <div className='space-y-3 rounded-2xl border border-line bg-surface-alt p-4' aria-hidden='true'>
    {[...Array(6)].map((_, i) => (
      <div key={i} className='animate-pulse h-12 w-full rounded-lg bg-raised' />
    ))}
  </div>
)

// Orders screen: read-only table of mock orders with a status filter and
// search. Order state is shared through SellerContext — when the backend
// lands this becomes GET /api/seller/orders.
const SellerOrders = () => {
  const { orders, isLoading } = useSeller()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(ALL)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders
      .filter((order) => {
        const matchesSearch =
          !query ||
          order.id.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query)
        const matchesStatus = status === ALL || order.status === status
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [orders, search, status])

  const hasFilters = search.trim() !== '' || status !== ALL
  const clearFilters = () => {
    setSearch('')
    setStatus(ALL)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-xl font-bold tracking-tight text-strong sm:text-2xl'>Orders</h1>
        <p className='mt-1 text-sm text-muted'>
          Track customer orders from pending through fulfilment.
        </p>
      </div>

      {/* Toolbar */}
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
            placeholder='Search by order ID, customer or email…'
            aria-label='Search orders'
            className='w-full rounded-lg border border-line bg-raised py-2.5 pl-10 pr-4 text-sm text-strong placeholder-faint transition-colors focus:border-line-strong focus:outline-none'
          />
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:flex lg:gap-3'>
          {[ALL, ...ORDER_STATUSES].map((option) => (
            <button
              key={option}
              onClick={() => setStatus(option)}
              aria-pressed={status === option}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                status === option
                  ? 'border-[#ec5800]/40 bg-[#ec5800]/10 text-[#ec5800]'
                  : 'border-line text-muted hover:border-line-strong hover:text-strong'
              }`}
            >
              {option === ALL ? 'All' : option}
            </button>
          ))}
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
        Showing {filtered.length} of {orders.length} orders
      </p>

      {isLoading ? (
        <SkeletonRows />
      ) : orders.length === 0 ? (
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
            <ClipboardList size={26} aria-hidden='true' />
          </span>
          <div>
            <p className='text-lg font-bold text-strong'>No orders yet</p>
            <p className='mx-auto mt-1 max-w-sm text-sm text-muted'>
              When customers check out, their orders will show up here.
            </p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
            <Search size={26} aria-hidden='true' />
          </span>
          <div>
            <p className='text-lg font-bold text-strong'>No orders match</p>
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
        <OrderTable orders={filtered} />
      )}
    </div>
  )
}

export default SellerOrders
