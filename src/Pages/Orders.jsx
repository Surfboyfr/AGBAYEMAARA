import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  ChevronDown,
  Mail,
  MapPin,
  Package,
  PackageOpen,
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

const statusStyles = {
  paid: 'bg-emerald-500/10 text-emerald-300',
  processing: 'bg-[#ec5800]/10 text-[#ec5800]',
  shipped: 'bg-sky-500/10 text-sky-300',
}

const OrderCard = ({ order }) => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)

  return (
    <article className='overflow-hidden rounded-3xl border border-white/10 bg-[#12141A]'>
      {/* Summary row — reference, date, total, status */}
      <div className='flex flex-wrap items-center gap-4 p-5 sm:gap-6'>
        <div className='min-w-0 flex-1'>
          <p className='font-mono text-sm font-bold text-[#ec5800]'>{order.reference}</p>
          <p className='mt-1 text-xs text-white/45'>{formatDate(order.placedAt)}</p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            statusStyles[order.status] ?? statusStyles.processing
          }`}
        >
          <BadgeCheck size={13} />
          {t('orders', `status_${order.status}`)}
        </span>

        <span className='text-lg font-black text-white'>
          ${order.total.toFixed(2)}
        </span>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className='inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/35 hover:text-white'
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
        <div className='space-y-6 border-t border-white/10 p-5'>
          <div className='grid gap-4 sm:grid-cols-2'>
            {order.items.map((item) => (
              <div
                key={item.id}
                className='flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3'
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-14 w-14 shrink-0 rounded-xl object-cover'
                />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-white'>{item.name}</p>
                  <p className='text-xs text-white/45'>
                    {item.brand || t('cart', 'brandFallback')} · ×{item.quantity}
                  </p>
                </div>
                <span className='text-sm font-bold text-white'>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className='grid gap-4 text-sm sm:grid-cols-2'>
            <div className='flex items-start gap-2 text-white/55'>
              <MapPin size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>
                {order.delivery.address}, {order.delivery.city}, {order.delivery.country}
              </span>
            </div>
            <div className='flex items-start gap-2 text-white/55'>
              <Mail size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{order.email}</span>
            </div>
            <div className='flex items-start gap-2 text-white/55'>
              <Truck size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{t('checkout', 'deliveryEstimate')}</span>
            </div>
            <div className='flex items-start gap-2 text-white/55'>
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
    <section className='min-h-screen w-full bg-[#0A0B0F] px-5 pb-20 text-white'>
      <div className='mx-auto max-w-4xl pt-8'>
        <Link
          to='/shop'
          className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white'
        >
          <Package size={15} />
          {t('orders', 'backToShop')}
        </Link>

        <header className='mb-8'>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            {t('orders', 'title')}
          </h1>
          <p className='mt-2 text-sm text-white/50'>{t('orders', 'subtitle')}</p>
        </header>

        {orders.length === 0 ? (
          <div className='flex flex-col items-center gap-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center'>
            <span className='flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/25'>
              <PackageOpen size={26} />
            </span>
            <p className='text-lg font-bold'>{t('orders', 'emptyTitle')}</p>
            <p className='max-w-sm text-sm text-white/50'>{t('orders', 'emptyBody')}</p>
            <Link
              to='/shop'
              className='inline-flex items-center gap-2 rounded-xl bg-[#ec5800] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d04f00] active:scale-95'
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
