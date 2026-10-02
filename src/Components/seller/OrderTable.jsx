import { ORDER_STATUS_TONES, formatDate, formatPrice } from '../../data/sellerMockData'

const Th = ({ children, className = '' }) => (
  <th
    scope='col'
    className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted ${className}`}
  >
    {children}
  </th>
)

// Orders table — order id, customer, products, total, date, status. Products
// render as a stacked thumbnail row plus a "name ×qty" summary so long item
// lists never blow up the row.
const OrderTable = ({ orders }) => (
  <div className='overflow-x-auto rounded-2xl border border-line bg-surface-alt'>
    <table className='w-full min-w-[900px] text-sm'>
      <thead className='border-b border-line bg-raised/50'>
        <tr>
          <Th>Order ID</Th>
          <Th>Customer</Th>
          <Th>Products</Th>
          <Th>Total</Th>
          <Th>Date</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody className='divide-y divide-line'>
        {orders.map((order) => {
          const [first, ...rest] = order.items
          return (
            <tr key={order.id} className='transition-colors duration-150 hover:bg-raised'>
              <td className='whitespace-nowrap px-4 py-3'>
                <span className='font-mono text-sm font-bold text-[#ec5800]'>{order.id}</span>
              </td>
              <td className='px-4 py-3'>
                <p className='font-semibold text-strong'>{order.customer.name}</p>
                <p className='text-xs text-muted'>{order.customer.email}</p>
              </td>
              <td className='px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex -space-x-2'>
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={`${order.id}-${item.productId}`}
                        src={item.image}
                        alt={item.name}
                        className='h-8 w-8 rounded-full border-2 border-surface-alt object-cover'
                      />
                    ))}
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-xs text-strong'>
                      {first.name} ×{first.quantity}
                    </p>
                    <p className='text-xs text-muted'>
                      {rest.length > 0
                        ? `+${rest.length} more item${rest.length > 1 ? 's' : ''}`
                        : '1 item'}
                    </p>
                  </div>
                </div>
              </td>
              <td className='whitespace-nowrap px-4 py-3 font-bold text-strong'>
                {formatPrice(order.total)}
              </td>
              <td className='whitespace-nowrap px-4 py-3 text-muted'>{formatDate(order.date)}</td>
              <td className='whitespace-nowrap px-4 py-3'>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_TONES[order.status]}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default OrderTable
