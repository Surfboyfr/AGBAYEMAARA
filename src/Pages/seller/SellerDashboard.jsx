import { Link } from 'react-router-dom'
import { ArrowRight, DollarSign, Package, ShoppingBag, TriangleAlert } from 'lucide-react'
import SellerStatCard from '../../Components/seller/SellerStatCard'
import ProductImage from '../../Components/seller/ProductImage'
import { useSeller } from '../../Context/SellerContext'
import {
  ORDER_STATUS_TONES,
  formatDate,
  formatPrice,
  getProductStatus,
  PRODUCT_STATUS_TONES,
  sellerStats,
} from '../../data/sellerMockData'

// Period-over-period hint text shared by the stat cards.
const trendHint = (percent) => `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}% vs last month`

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-raised ${className}`} aria-hidden='true' />
)

const CardHeader = ({ title, subtitle, to, linkLabel = 'View all' }) => (
  <div className='flex items-center justify-between gap-4 border-b border-line px-5 py-4'>
    <div>
      <h2 className='text-base font-bold tracking-tight text-strong'>{title}</h2>
      {subtitle && <p className='mt-0.5 text-xs text-muted'>{subtitle}</p>}
    </div>
    <Link
      to={to}
      className='inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
    >
      {linkLabel}
      <ArrowRight size={13} aria-hidden='true' />
    </Link>
  </div>
)

// Dashboard: welcome line, four KPI cards, then recent orders + recent
// products. All numbers derive from seller context state, so they react to
// add/edit/delete on the other screens immediately.
const SellerDashboard = () => {
  const { profile, orders, products, stats, isLoading } = useSeller()

  const firstName = profile.ownerName.split(' ')[0]
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  return (
    <div className='space-y-6'>
      {/* Welcome */}
      <div>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
          {today}
        </p>
        <h1 className='mt-1.5 text-2xl font-bold tracking-tight text-strong sm:text-3xl'>
          Welcome back, {firstName}
        </h1>
        <p className='mt-1.5 text-sm text-muted'>
          Here is what is happening with {profile.businessName} today.
        </p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border border-line bg-surface-alt p-5'
              aria-hidden='true'
            >
              <Skeleton className='h-3 w-24' />
              <Skeleton className='mt-4 h-8 w-32' />
              <Skeleton className='mt-3 h-3 w-28' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SellerStatCard
            icon={Package}
            label='Total Products'
            value={stats.totalProducts}
            hint={`${trendHint(sellerStats.productsTrendPercent)} · ${stats.activeProducts} active`}
            hintTone={sellerStats.productsTrendPercent >= 0 ? 'good' : 'warn'}
            tone='accent'
          />
          <SellerStatCard
            icon={ShoppingBag}
            label='Total Orders'
            value={stats.totalOrders}
            hint={`${trendHint(sellerStats.ordersTrendPercent)} · ${stats.pendingOrders} pending`}
            hintTone={sellerStats.ordersTrendPercent >= 0 ? 'good' : 'warn'}
            tone='sky'
          />
          <SellerStatCard
            icon={DollarSign}
            label='Total Revenue'
            value={formatPrice(stats.totalRevenue)}
            hint={`${trendHint(sellerStats.revenueTrendPercent)} · cancelled excluded`}
            hintTone={sellerStats.revenueTrendPercent >= 0 ? 'good' : 'warn'}
            tone='emerald'
          />
          <SellerStatCard
            icon={TriangleAlert}
            label='Low Stock Products'
            value={stats.lowStockProducts}
            hint={
              stats.lowStockProducts > 0
                ? `${trendHint(sellerStats.lowStockTrendPercent)} · needs restocking`
                : 'All products are healthy'
            }
            hintTone={
              stats.lowStockProducts === 0
                ? 'good'
                : sellerStats.lowStockTrendPercent <= 0
                  ? 'good'
                  : 'warn'
            }
            tone='amber'
          />
        </div>
      )}

      {/* Recent activity */}
      <div className='grid gap-6 xl:grid-cols-5'>
        {/* Recent orders */}
        <section className='overflow-hidden rounded-2xl border border-line bg-surface-alt xl:col-span-3'>
          <CardHeader title='Recent Orders' subtitle='Latest activity in your store' to='/seller/orders' />

          {isLoading ? (
            <div className='space-y-3 p-5'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className='px-5 py-12 text-center'>
              <p className='text-sm font-semibold text-strong'>No orders yet</p>
              <p className='mt-1 text-xs text-muted'>
                New orders will appear here as customers check out.
              </p>
            </div>
          ) : (
            <ul className='divide-y divide-line'>
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className='flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors duration-150 hover:bg-raised'
                >
                  <span className='font-mono text-sm font-bold text-[#ec5800]'>{order.id}</span>
                  <span className='min-w-0 flex-1 truncate text-sm font-medium text-strong'>
                    {order.customer.name}
                  </span>
                  <span className='text-xs text-muted'>{formatDate(order.date)}</span>
                  <span className='text-sm font-black text-strong'>
                    {formatPrice(order.total)}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ORDER_STATUS_TONES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent products */}
        <section className='overflow-hidden rounded-2xl border border-line bg-surface-alt xl:col-span-2'>
          <CardHeader
            title='Recent Products'
            subtitle='Newest additions to your catalog'
            to='/seller/products'
          />

          {isLoading ? (
            <div className='space-y-3 p-5'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className='px-5 py-12 text-center'>
              <p className='text-sm font-semibold text-strong'>No products yet</p>
              <p className='mt-1 text-xs text-muted'>Add your first product to get started.</p>
            </div>
          ) : (
            <ul className='divide-y divide-line'>
              {recentProducts.map((product) => {
                const status = getProductStatus(product.stock)
                return (
                  <li
                    key={product.id}
                    className='flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-raised'
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className='h-10 w-10 rounded-lg'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-semibold text-strong'>{product.name}</p>
                      <p className='text-xs text-muted'>{formatPrice(product.price)}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRODUCT_STATUS_TONES[status]}`}
                    >
                      {status}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default SellerDashboard
