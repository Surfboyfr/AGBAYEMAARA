import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserPlus,
  Users,
} from 'lucide-react'
import SellerStatCard from '../Components/seller/SellerStatCard'
import { useSeller } from '../Context/SellerContext'
import { useFollow } from '../Context/FollowContext'
import { useCart } from '../Context/CartContext'
import {
  getActivity,
  getCartTracking,
  getRegistrations,
} from '../lib/activity'
import { getOrders } from '../lib/orders'
import {
  formatDate,
  formatPrice,
  ORDER_STATUS_TONES,
} from '../data/sellerMockData'

// ── Admin console ─────────────────────────────────────────────────────────────
// One screen that watches everything happening across the platform: shopper
// and vendor sign-ups, every product a shopper adds to cart and how far it
// gets toward purchase and payment, orders on both surfaces, and the live
// action trail of both sections. Numbers come from the same localStorage-
// backed stores the two sections write to (src/lib/activity.js, lib/orders.js,
// the seller context). Frontend-only — a backend replaces the readers, not
// the page.

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

// Cart → purchase pipeline stages (lib/activity.js CART_STAGES). The chips
// colour the funnel so a stalled item is visible at a glance.
const STAGE_CHIPS = {
  in_cart: NEUTRAL_CHIP,
  checkout_started: 'border-sky-500/30 bg-sky-500/10 text-sky-500',
  payment_initialized: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
  payment_failed: 'border-red-500/30 bg-red-500/10 text-red-500',
  removed: 'border-line-strong bg-raised text-faint',
}

const STAGE_LABELS = {
  in_cart: 'In cart',
  checkout_started: 'In checkout',
  payment_initialized: 'Payment pending',
  paid: 'Paid',
  payment_failed: 'Payment failed',
  removed: 'Removed',
}

// Live-feed filter chips: the whole trail, or one section's activity.
const FEED_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'customer', label: 'Users' },
  { id: 'seller', label: 'Sellers' },
]

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

const Panel = ({
  icon: Icon,
  title,
  subtitle,
  to,
  linkLabel,
  seller = false,
  children,
}) => (
  <section className='rounded-2xl border border-line bg-surface-alt'>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4'>
      <div className='flex items-center gap-3'>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            seller
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-[#ec5800]/10 text-[#ec5800]'
          }`}
        >
          <Icon size={17} aria-hidden='true' />
        </span>
        <div>
          <h2 className='text-base font-bold tracking-tight text-strong'>{title}</h2>
          <p className='text-xs text-muted'>{subtitle}</p>
        </div>
      </div>
      {to && (
        <Link
          to={to}
          className='inline-flex shrink-0 items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted transition-all duration-200 hover:border-line-strong hover:text-strong'
        >
          {linkLabel}
          <ArrowRight size={13} aria-hidden='true' />
        </Link>
      )}
    </div>
    {children}
  </section>
)

const AdminDashboard = () => {
  const { orders: sellerOrders, stats } = useSeller()
  const { followedBrands } = useFollow()
  const { cartCount } = useCart()
  // All stores are re-read on a timer and on demand, so the page keeps
  // tracking actions while it sits open — the Refresh button does the same
  // thing by hand.
  const [snapshot, setSnapshot] = useState(() => ({
    customerOrders: getOrders(),
    activity: getActivity(),
    registrations: getRegistrations(),
    cartTracking: getCartTracking(),
  }))
  const [feedFilter, setFeedFilter] = useState('all')
  const refresh = useCallback(() => {
    setSnapshot({
      customerOrders: getOrders(),
      activity: getActivity(),
      registrations: getRegistrations(),
      cartTracking: getCartTracking(),
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(refresh, ACTIVITY_POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const { customerOrders, activity, registrations, cartTracking } = snapshot
  const shopper = readShopper()

  // ── Sign-ups ────────────────────────────────────────────────────────────────
  const registeredUsers = registrations.filter((entry) => entry.kind === 'user')
  const registeredVendors = registrations.filter((entry) => entry.kind === 'vendor')

  // ── Cart → purchase pipeline ────────────────────────────────────────────────
  // Funnel counts per stage plus the entries themselves, newest activity
  // first. A product sits at exactly one stage, so the counts read as a
  // funnel: in cart → in checkout → payment pending → paid.
  const pipeline = useMemo(() => {
    const counts = cartTracking.reduce(
      (acc, entry) => {
        acc[entry.status] = (acc[entry.status] ?? 0) + 1
        return acc
      },
      { in_cart: 0, checkout_started: 0, payment_initialized: 0, paid: 0 }
    )
    // Value still moving through the funnel (everything not yet paid or
    // dropped) — the money currently sitting in shoppers' carts.
    const OPEN_STAGES = ['in_cart', 'checkout_started', 'payment_initialized']
    const openValue = cartTracking
      .filter((entry) => OPEN_STAGES.includes(entry.status))
      .reduce(
        (sum, entry) =>
          sum + (Number(entry.price) || 0) * (Number(entry.quantity) || 1),
        0
      )
    const recent = [...cartTracking]
      .sort((a, b) => new Date(b.updatedAt ?? b.at) - new Date(a.updatedAt ?? a.at))
      .slice(0, 8)
    return { counts, openValue, recent }
  }, [cartTracking])

  const orderedItems = customerOrders.reduce(
    (sum, order) =>
      sum + (order.items ?? []).reduce((count, item) => count + (Number(item.quantity) || 1), 0),
    0
  )

  // Live feed: tracked events first, then the order records themselves (so
  // the feed is never empty on a first visit). Tracked order events are
  // dropped from the derived list to avoid showing one order twice. Built
  // once here, then sliced for display and counted per filter chip.
  const mergedFeed = useMemo(() => {
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
  }, [activity, customerOrders, sellerOrders])

  // Section counts feed the filter chips; the visible rows honour the filter.
  const feedSectionCounts = useMemo(
    () => ({
      all: mergedFeed.length,
      customer: mergedFeed.filter((event) => event.section === 'customer').length,
      seller: mergedFeed.filter((event) => event.section === 'seller').length,
    }),
    [mergedFeed]
  )

  const feed = useMemo(() => {
    const filtered =
      feedFilter === 'all'
        ? mergedFeed
        : mergedFeed.filter((event) => event.section === feedFilter)
    return filtered.slice(0, 12)
  }, [mergedFeed, feedFilter])

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
              A live view of the whole application — new shoppers and vendors as
              they register, every cart on its way to purchase and payment, and
              the activity of both sections as it happens.
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

        {/* KPI row — sign-ups and pipeline first, then both sections' numbers */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <SellerStatCard
            icon={UserPlus}
            label='Registered users'
            value={registeredUsers.length}
            hint={
              registeredUsers[0]
                ? `Latest ${timeAgo(registeredUsers[0].at)}`
                : 'No sign-ups yet'
            }
            tone='accent'
          />
          <SellerStatCard
            icon={Store}
            label='Registered vendors'
            value={registeredVendors.length}
            hint={
              registeredVendors[0]
                ? `Latest ${timeAgo(registeredVendors[0].at)}`
                : 'No vendors yet'
            }
            tone='emerald'
          />
          <SellerStatCard
            icon={ShoppingCart}
            label='Carts in progress'
            value={
              pipeline.counts.in_cart +
              pipeline.counts.checkout_started +
              pipeline.counts.payment_initialized
            }
            hint={`${pipeline.counts.paid} reached purchase`}
            tone='sky'
          />
          <SellerStatCard
            icon={CreditCard}
            label='Seller revenue'
            value={formatPrice(stats.totalRevenue, stats.currency)}
            hint={`${stats.pendingOrders} pending of ${stats.totalOrders} orders`}
            tone='amber'
          />
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
            icon={CreditCard}
            label='Value in carts'
            value={formatPrice(pipeline.openValue)}
            hint='Moving toward purchase'
            tone='emerald'
          />
        </div>

        {/* Sign-ups — every new account, from either entry point */}
        <div className='grid gap-6 lg:grid-cols-2'>
          <Panel
            icon={UserPlus}
            title='New users'
            subtitle={`${registeredUsers.length} registered shopper${registeredUsers.length === 1 ? '' : 's'} & brand owners`}
            to='/'
            linkLabel='Open site'
          >
            {registeredUsers.length === 0 ? (
              <EmptyState>
                No sign-ups tracked yet — the next shopper to register (boot
                flow or the auth modal) appears here within seconds.
              </EmptyState>
            ) : (
              <ul className='divide-y divide-line border-t border-line'>
                {registeredUsers.slice(0, 6).map((entry) => (
                  <li
                    key={entry.id}
                    className='flex items-center justify-between gap-4 px-5 py-3.5'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-bold text-strong'>
                        {entry.name || entry.email}
                      </p>
                      <p className='truncate text-xs text-muted'>
                        {entry.email}
                        {entry.name ? ` · ${entry.detail}` : ''}
                      </p>
                    </div>
                    <span className='shrink-0 whitespace-nowrap text-xs text-faint'>
                      {timeAgo(entry.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            icon={Store}
            title='New vendors'
            subtitle={`${registeredVendors.length} vendor${registeredVendors.length === 1 ? '' : 's'} onboarded via /seller/register`}
            to='/seller'
            linkLabel='Open portal'
            seller
          >
            {registeredVendors.length === 0 ? (
              <EmptyState>
                No vendors onboarded yet — the next business to register shows
                up here with its location and contact.
              </EmptyState>
            ) : (
              <ul className='divide-y divide-line border-t border-line'>
                {registeredVendors.slice(0, 6).map((entry) => (
                  <li
                    key={entry.id}
                    className='flex items-center justify-between gap-4 px-5 py-3.5'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-bold text-strong'>
                        {entry.name || entry.email}
                      </p>
                      <p className='truncate text-xs text-muted'>
                        {entry.detail || entry.email}
                      </p>
                    </div>
                    <span className='shrink-0 whitespace-nowrap text-xs text-faint'>
                      {timeAgo(entry.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Cart → purchase pipeline — every carted product and its stage */}
        <section className='rounded-2xl border border-line bg-surface-alt'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4'>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500'>
                <ShoppingCart size={17} aria-hidden='true' />
              </span>
              <div>
                <h2 className='text-base font-bold tracking-tight text-strong'>
                  Cart → purchase pipeline
                </h2>
                <p className='text-xs text-muted'>
                  Every product added to a cart, tracked through checkout and
                  payment
                </p>
              </div>
            </div>
            <span className='rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted'>
              {cartTracking.length} tracked
            </span>
          </div>
          <div className='grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-3 xl:grid-cols-6'>
            <MiniStat label='In cart' value={pipeline.counts.in_cart} />
            <MiniStat label='In checkout' value={pipeline.counts.checkout_started} />
            <MiniStat
              label='Payment pending'
              value={pipeline.counts.payment_initialized}
            />
            <MiniStat label='Paid' value={pipeline.counts.paid} />
            <MiniStat
              label='Payment failed'
              value={pipeline.counts.payment_failed ?? 0}
              warn={(pipeline.counts.payment_failed ?? 0) > 0}
            />
            <MiniStat label='Removed' value={pipeline.counts.removed ?? 0} />
          </div>
          {pipeline.recent.length === 0 ? (
            <EmptyState>
              Nothing in any cart yet — the moment a shopper adds a product it
              appears here and follows the funnel through payment.
            </EmptyState>
          ) : (
            <ul className='divide-y divide-line border-t border-line'>
              {pipeline.recent.map((entry) => (
                <li
                  key={entry.id}
                  className='flex items-center justify-between gap-4 px-5 py-3'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        STAGE_CHIPS[entry.status] ?? NEUTRAL_CHIP
                      }`}
                    >
                      {STAGE_LABELS[entry.status] ?? entry.status}
                    </span>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-strong'>
                        {entry.name} × {entry.quantity}
                        {entry.brand ? ` · ${entry.brand}` : ''}
                      </p>
                      <p className='truncate text-xs text-muted'>
                        {entry.reference
                          ? `Ref ${entry.reference} · updated ${timeAgo(entry.updatedAt ?? entry.at)}`
                          : `Updated ${timeAgo(entry.updatedAt ?? entry.at)}`}
                      </p>
                    </div>
                  </div>
                  <span className='shrink-0 whitespace-nowrap text-sm font-bold text-strong'>
                    {formatPrice((Number(entry.price) || 0) * (Number(entry.quantity) || 1))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

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
              <MiniStat label='Revenue' value={formatPrice(stats.totalRevenue, stats.currency)} />
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
                        {formatPrice(order.total, order.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Live activity — both sections in one stream, filterable per side */}
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
            <div className='flex flex-wrap items-center gap-3'>
              <div
                role='group'
                aria-label='Filter activity by section'
                className='flex rounded-full border border-line p-1'
              >
                {FEED_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type='button'
                    onClick={() => setFeedFilter(filter.id)}
                    aria-pressed={feedFilter === filter.id}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${
                      feedFilter === filter.id
                        ? 'bg-[#ec5800] text-white'
                        : 'text-muted hover:text-strong'
                    }`}
                  >
                    {filter.label}
                    <span className='ml-1.5 text-[10px] opacity-70'>
                      {feedSectionCounts[filter.id] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
              <span className='rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-muted'>
                showing {feed.length}
              </span>
            </div>
          </div>
          {feed.length === 0 ? (
            <EmptyState>
              {feedFilter === 'all'
                ? 'Nothing tracked yet — place an order, follow a brand or edit the catalogue and it shows up here within seconds.'
                : 'No activity on this side of the platform yet.'}
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
          Frontend demo data — sign-ups, cart pipelines, orders and both
          sections' actions are recorded to localStorage by src/lib/activity.js
          and read back here.
        </p>
      </main>
    </div>
  )
}

export default AdminDashboard
