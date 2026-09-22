import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  ChevronDown,
  Mail,
  MapPin,
  Package,
  PackageOpen,
  PackageX,
  Truck,
} from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import { getOrders } from '../lib/orders'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Chip tone per lifecycle stage — covers the full order lifecycle recorded in
// src/lib/orders.js, falling back to the neutral "in flight" tone.
const statusTones = {
  created: 'bg-emerald-500/10 text-emerald-300',
  paid: 'bg-emerald-500/10 text-emerald-300',
  brand_notified: 'bg-[#ec5800]/10 text-[#ec5800]',
  confirmed_by_brand: 'bg-[#ec5800]/10 text-[#ec5800]',
  in_progress: 'bg-[#ec5800]/10 text-[#ec5800]',
  processing: 'bg-[#ec5800]/10 text-[#ec5800]',
  shipped: 'bg-sky-500/10 text-sky-300',
  delivered: 'bg-emerald-500/15 text-emerald-300',
  fulfilment_failed: 'bg-red-500/10 text-red-300',
  refunded: 'bg-red-500/10 text-red-300',
}

const statusTone = (status) => statusTones[status] ?? statusTones.paid

const isFailedStatus = (status) => status === 'fulfilment_failed' || status === 'refunded'

const OrderCard = ({ order }) => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  return (
    <article className='overflow-hidden rounded-3xl border border-line bg-surface-alt'>
      {/* Summary row — reference, date, total, status */}
      <div className='flex flex-wrap items-center gap-4 p-5 sm:gap-6'>
        <div className='min-w-0 flex-1'>
          <Link
            to={`/orders/${order.reference}`}
            className='font-mono text-sm font-bold text-[#ec5800] transition-colors hover:text-[#ff7a33] hover:underline'
          >
            {order.reference}
          </Link>
          <p className='mt-1 text-xs text-muted'>{formatDate(order.placedAt)}</p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusTone(order.status)}`}
        >
          {isFailedStatus(order.status) ? <PackageX size={13} /> : <BadgeCheck size={13} />}
          {t('orders', `status_${order.status}`)}
        </span>

        <span className='text-lg font-black text-strong'>
          ${order.total.toFixed(2)}
        </span>

        <Link
          to={`/orders/${order.reference}`}
          className='inline-flex items-center gap-1.5 rounded-full bg-[#ec5800]/10 px-4 py-2 text-xs font-semibold text-[#ec5800] transition hover:bg-[#ec5800]/20'
        >
          <Truck size={13} />
          {t('orderStatus', 'trackOrderCta')}
        </Link>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className='inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-strong'
        >
          {t('orders', expanded ? 'hideItems' : 'viewItems')}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expanded detail: items, delivery address, payment method */}
      {expanded && (
        <div className='space-y-6 border-t border-line p-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            {order.items.map((item) => (
              <div
                key={item.id}
                className='flex items-center gap-3 rounded-2xl border border-line bg-raised p-3'
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-14 w-14 shrink-0 rounded-xl object-cover'
                />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-strong'>{item.name}</p>
                  <p className='text-xs text-muted'>
                    {item.brand || t('cart', 'brandFallback')} · ×{item.quantity}
                  </p>
                </div>
                <span className='text-sm font-bold text-strong'>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className='grid gap-4 text-sm sm:grid-cols-2'>
            <div className='flex items-start gap-2 text-muted'>
              <MapPin size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>
                {order.delivery.address}, {order.delivery.city}, {order.delivery.country}
              </span>
            </div>
            <div className='flex items-start gap-2 text-muted'>
              <Mail size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{order.email}</span>
            </div>
            <div className='flex items-start gap-2 text-muted'>
              <Truck size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{t('checkout', 'deliveryEstimate')}</span>
            </div>
            <div className='flex items-start gap-2 text-muted'>
              <Package size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{t('checkout', methodLabelKey(order.paymentMethod))}</span>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

const methodLabelKey = (id) =>
  ({
    'paystack-card': 'cardLabel',
    'bank-transfer': 'transferLabel',
    ussd: 'ussdLabel',
  })[id] ?? 'cardLabel'

// ── Orders page ──────────────────────────────────────────────────────────────
const Orders = () => {
  const { t } = useLanguage()
  const orders = getOrders()

  return (
    <section className='min-h-screen w-full bg-surface px-5 pb-20 text-strong'>
      <div className='mx-auto max-w-4xl pt-8'>
        <Link
          to='/shop'
          className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-strong'
        >
          <Package size={15} />
          {t('orders', 'backToShop')}
        </Link>

        <header className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            {t('orders', 'title')}
          </h1>
          <p className='mt-2 text-sm text-muted'>{t('orders', 'subtitle')}</p>
        </header>

        {orders.length === 0 ? (
          <div className='flex flex-col items-center gap-5 rounded-3xl border border-dashed border-line bg-white/2 px-6 py-16 text-center'>
            <span className='flex h-14 w-14 items-center justify-center rounded-full bg-raised text-faint'>
              <PackageOpen size={26} />
            </span>
            <p className='text-lg font-bold'>{t('orders', 'emptyTitle')}</p>
            <p className='max-w-sm text-sm text-muted'>{t('orders', 'emptyBody')}</p>
            <Link
              to='/shop'
              className='inline-flex items-center gap-2 rounded-xl bg-[#ec5800] px-6 py-2.5 text-sm font-semibold text-strong transition hover:bg-[#d04f00] active:scale-95'
            >
              {t('orders', 'emptyCta')}
            </Link>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <OrderCard key={order.reference} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Orders
