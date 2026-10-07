import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import SellerStatCard from '../Components/seller/SellerStatCard'
import { useSeller } from '../Context/SellerContext'
import { useFollow } from '../Context/FollowContext'
import { useCart } from '../Context/CartContext'
import { getActivity } from '../lib/activity'
import { getOrders } from '../lib/orders'
import {
  formatDate,
  formatPrice,
  ORDER_STATUS_TONES,
} from '../data/sellerMockData'

// ── Admin console ─────────────────────────────────────────────────────────────
// One screen that watches both surfaces of the platform: the customer section
// (orders, cart, follows, sign-up) and the seller section (catalogue,
// inventory, orders). Numbers come from the same localStorage-backed stores
// the two sections write to, and the live feed reads the shared activity log
// (src/lib/activity.js) that those stores record into. Frontend-only — a
// backend replaces the readers, not the page.

const ACTIVITY_POLL_MS = 4000

const NEUTRAL_CHIP = 'border-line-strong bg-raised text-muted'

// Customer orders run through the fulfilment lifecycle (lib/orders.js);
// these tints mirror the storefront's status colours.
const CUSTOMER_STATUS_TONES = {
  created: NEUTRAL_CHIP,
  paid: 'border-[#ec5800]/30 bg-[#ec5800]/10 text-[#ec5800]',
  brand_notified: 'border-[#ec5800]/30 bg-[#ec5800]/10 text-[#ec5800]',
  confirmed_by_brand: 'border-[#ec5800]/30 bg-[#ec5800]/10 text-[#ec5800]',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  shipped: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
  delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  fulfilment_failed: 'border-red-500/30 bg-red-500/10 text-red-500',
  refunded: 'border-red-500/30 bg-red-500/10 text-red-500',
}

const SECTION_CHIP = {
  customer: 'border-[#ec5800]/30 bg-[#ec5800]/10 text-[#ec5800]',
  seller: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
}

// The mock sign-up profile (same key BootFlow writes).
const readShopper = () => {
  try {
    return JSON.parse(window.localStorage.getItem('agbayemaara.user') ?? 'null')
  } catch {
    return null
  }
}

const timeAgo = (iso) => {
  const stamp = new Date(iso).getTime()
  if (Number.isNaN(stamp)) return ''
  const minutes = Math.floor((Date.now() - stamp) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const EmptyState = ({ children }) => (
  <p className='border-t border-line px-5 py-8 text-center text-sm text-muted'>
    {children}
  </p>
)

const MiniStat = ({ label, value, warn = false }) => (
  <div className='rounded-xl border border-line bg-raised px-3.5 py-3'>
    <p className='text-[11px] font-semibold uppercase tracking-wider text-muted'>
      {label}
    </p>
    <p
      className={`mt-1 text-lg font-black tracking-tight ${
        warn ? 'text-amber-500' : 'text-strong'
      }`}
    >
      {value}
    </p>
  </div>
)

const Panel = ({ icon: Icon, title, subtitle, to, linkLabel, seller = false, children }) => (
  <section className='rounded-2xl border border-line bg-surface-alt'>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4'>
      <div className='flex items-center gap-3'>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            seller ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#ec5800]/10 text-[#ec5800]'
          }`}
        >
          <Icon size={17} aria-hidden='true' />
        </span>
        <div>
          <h2 className='text-base font-bold tracking-tight text-strong'>{title}</h2>
          <p className='text-xs text-muted'>{subtitle}</p>
        </div>
      </div>
      <Link
        to={to}
        className='inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
      >
        {linkLabel}
        <ArrowRight size={13} aria-hidden='true' />
      </Link>
    </div>
    {children}
  </section>
)

const AdminDashboard = () => {
  const { orders: sellerOrders, stats } = useSeller()
  const { followedBrands } = useFollow()
  const { cartCount } = useCart()
  // Both stores are re-read on a timer and on demand, so the page keeps
  // tracking actions while it sits open — the Refresh button does the same
  // thing by hand.
  const [snapshot, setSnapshot] = useState(() => ({
    customerOrders: getOrders(),
    activity: getActivity(),
  }))
  const refresh = useCallback(() => {
    setSnapshot({ customerOrders: getOrders(), activity: getActivity() })
  }, [])

  useEffect(() => {
    const timer = setInterval(refresh, ACTIVITY_POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const { customerOrders, activity } = snapshot
  const shopper = readShopper()

  const orderedItems = customerOrders.reduce(
    (sum, order) =>
      sum + (order.items ?? []).reduce((count, item) => count + (Number(item.quantity) || 1), 0),
    0
  )

  // Live feed: tracked events first, then the order records themselves (so
  // the feed is never empty on a first visit). Tracked order events are
  // dropped from the derived list to avoid showing one order twice.
  const feed = useMemo(() => {
    const trackedLabels = new Set(activity.map((event) => event.label))
    const derived = [
      ...customerOrders.map((order) => ({
        id: `customer-order-${order.reference}`,
        section: 'customer',
        label: `Order ${order.reference} placed`,
        detail: `${(order.items ?? []).length} items · ${order.currency ?? 'USD'} ${Number(order.total) || 0}`,
        at: order.placedAt,
      })),
      ...sellerOrders.map((order) => ({
        id: `seller-order-${order.id}`,
        section: 'seller',
        label: `Seller order ${order.id} received`,
        detail: order.customer?.name ? `from ${order.customer.name}` : '',
        at: order.date,
      })),
    ].filter((event) => !trackedLabels.has(event.label))

    return [...activity, ...derived]
      .filter((event) => event.at && !Number.isNaN(new Date(event.at).getTime()))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 12)
  }, [activity, customerOrders, sellerOrders])

  const recentCustomerOrders = customerOrders.slice(0, 5)
  const recentSellerOrders = [...sellerOrders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div className='min-h-screen bg-surface text-strong'>
      {/* Shell header — admin is its own surface, outside the shopper boot flow */}
      <header className='border-b border-line bg-raised'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4'>
          <div className='flex items-center gap-3'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-[#ec5800] text-white'>
              <Activity size={18} aria-hidden='true' />
            </span>
            <div>
              <p className='text-sm font-bold tracking-wide'>Àgbáyémáarà</p>
              <p className='text-xs text-muted'>Admin console</p>
            </div>
          </div>
          <nav className='flex flex-wrap items-center gap-2 text-xs font-semibold'>
            <Link
              to='/'
              className='rounded-full border border-line px-3.5 py-1.5 text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
            >
              Customer site
            </Link>
            <Link
              to='/seller'
              className='rounded-full border border-line px-3.5 py-1.5 text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
            >
              Seller portal
            </Link>
            <Link
              to='/brand-owner'
              className='rounded-full border border-line px-3.5 py-1.5 text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
            >
              Brand hub
            </Link>
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-7xl space-y-6 px-5 py-8'>
        {/* Title + live controls */}
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
              Platform overview
            </p>
            <h1 className='mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl'>
              What is happening across the platform
            </h1>
            <p className='mt-1.5 max-w-2xl text-sm text-muted'>
              A live view of both sections — shopper orders, cart and follows on
              one side, the seller catalogue, inventory and orders on the other.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' aria-hidden='true' />
              Live · every {ACTIVITY_POLL_MS / 1000}s
            </span>
            <button
              type='button'
              onClick={refresh}
              className='inline-flex items-center gap-2 rounded-full bg-[#ec5800] px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-[#d04f00] active:scale-[0.98]'
            >
              <RefreshCw size={13} aria-hidden='true' />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI row — two cards per section */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SellerStatCard
            icon={ShoppingBag}
            label='Customer orders'
            value={customerOrders.length}
            hint={`${orderedItems} items ordered`}
            tone='accent'
          />
          <SellerStatCard
            icon={Users}
            label='Cart & follows'
            value={cartCount}
            hint={`${followedBrands.length} brands followed`}
            tone='amber'
          />
          <SellerStatCard
            icon={Package}
            label='Seller products'
            value={stats.totalProducts}
            hint={
              stats.lowStockProducts > 0
                ? `${stats.lowStockProducts} low on stock`
                : 'All stock healthy'
            }
            hintTone={stats.lowStockProducts > 0 ? 'warn' : 'good'}
            tone='sky'
          />
          <SellerStatCard
            icon={Store}
            label='Seller revenue'
            value={formatPrice(stats.totalRevenue)}
            hint={`${stats.pendingOrders} pending of ${stats.totalOrders} orders`}
            tone='emerald'
          />
        </div>

        {/* Both sections side by side */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <Panel
            icon={ShoppingBag}
            title='Customer section'
            subtitle={
              shopper?.name ? `Signed-in shopper: ${shopper.name}` : 'Orders, cart, follows'
            }
            to='/'
            linkLabel='Open site'
          >
            <div className='grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4'>
              <MiniStat label='Orders' value={customerOrders.length} />
              <MiniStat label='Items' value={orderedItems} />
              <MiniStat label='Follows' value={followedBrands.length} />
              <MiniStat label='In cart' value={cartCount} />
            </div>
            {recentCustomerOrders.length === 0 ? (
              <EmptyState>
                No customer orders yet — they appear here the moment a shopper
                checks out.
              </EmptyState>
            ) : (
              <ul className='divide-y divide-line border-t border-line'>
                {recentCustomerOrders.map((order) => (
                  <li
                    key={order.reference}
                    className='flex items-center justify-between gap-4 px-5 py-3.5'
                  >
                    <div className='min-w-0'>
                      <p className='truncate font-mono text-sm font-bold text-[#ec5800]'>
                        {order.reference}
                      </p>
                      <p className='truncate text-xs text-muted'>
                        {order.email} · {timeAgo(order.placedAt)}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          CUSTOMER_STATUS_TONES[order.status] ?? NEUTRAL_CHIP
                        }`}
                      >
                        {String(order.status).replaceAll('_', ' ')}
                      </span>
                      <span className='whitespace-nowrap text-sm font-bold text-strong'>
                        {order.currency ?? 'USD'} {Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            icon={Store}
            title='Seller section'
            subtitle={`${stats.activeProducts} active of ${stats.totalProducts} products`}
            to='/seller'
            linkLabel='Open portal'
            seller
          >
            <div className='grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-4'>
              <MiniStat label='Products' value={stats.totalProducts} />
              <MiniStat
                label='Low stock'
                value={stats.lowStockProducts}
                warn={stats.lowStockProducts > 0}
              />
              <MiniStat label='Orders' value={stats.totalOrders} />
              <MiniStat label='Revenue' value={formatPrice(stats.totalRevenue)} />
            </div>
            {recentSellerOrders.length === 0 ? (
              <EmptyState>No seller orders recorded yet.</EmptyState>
            ) : (
              <ul className='divide-y divide-line border-t border-line'>
                {recentSellerOrders.map((order) => (
                  <li
                    key={order.id}
                    className='flex items-center justify-between gap-4 px-5 py-3.5'
                  >
                    <div className='min-w-0'>
                      <p className='truncate font-mono text-sm font-bold text-[#ec5800]'>
                        {order.id}
                      </p>
                      <p className='truncate text-xs text-muted'>
                        {order.customer?.name ?? 'Customer'} · {formatDate(order.date)}
                      </p>
                    </div>
                    <div className='flex shrink-0 items-center gap-3'>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          ORDER_STATUS_TONES[order.status] ?? NEUTRAL_CHIP
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className='whitespace-nowrap text-sm font-bold text-strong'>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Live activity feed — both sections in one stream */}
        <section className='rounded-2xl border border-line bg-surface-alt'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4'>
            <div>
              <h2 className='text-base font-bold tracking-tight text-strong'>
                Live activity
              </h2>
              <p className='mt-0.5 text-xs text-muted'>
                Every tracked action from both sections — newest first
              </p>
            </div>
            <span className='rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted'>
              {activity.length} tracked · showing {feed.length}
            </span>
          </div>
          {feed.length === 0 ? (
            <EmptyState>
              Nothing tracked yet — place an order, follow a brand or edit the
              catalogue and it shows up here within seconds.
            </EmptyState>
          ) : (
            <ul className='divide-y divide-line'>
              {feed.map((event) => (
                <li
                  key={event.id}
                  className='flex items-center justify-between gap-4 px-5 py-3'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                        SECTION_CHIP[event.section] ?? NEUTRAL_CHIP
                      }`}
                    >
                      {event.section}
                    </span>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-strong'>
                        {event.label}
                      </p>
                      {event.detail ? (
                        <p className='truncate text-xs text-muted'>{event.detail}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className='shrink-0 whitespace-nowrap text-xs text-faint'>
                    {timeAgo(event.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className='text-xs text-faint'>
          Frontend demo data — shopper and seller actions are recorded to
          localStorage by src/lib/activity.js and read back here.
        </p>
      </main>
    </div>
  )
}

export default AdminDashboard
