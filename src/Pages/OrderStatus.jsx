import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Ban,
  Check,
  CircleDashed,
  Mail,
  MapPin,
  Package,
  PackageOpen,
  PackageX,
  RefreshCw,
  RotateCcw,
  Truck,
} from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'
import {
  getOrder,
  advanceOrderStatus,
  failOrder,
  refundOrder,
  resetOrder,
  stepForStage,
  STEP_MILESTONES,
  FAILURE_STAGES,
} from '../lib/orders'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

const isFailedStage = (stage) => FAILURE_STAGES.includes(stage)

// Index of the happy-path step where fulfilment stopped, so the failure
// branch can be shown against the normal track. `created` fails before any
// step starts, hence the -1. `failedAt` (recorded by failOrder) holds the
// origin stage; fall back to it, then to the Ordered step.
const failurePoint = (order) => {
  const map = {
    created: -1,
    paid: 0,
    brand_notified: 1,
    confirmed_by_brand: 1,
    in_progress: 1,
    shipped: 2,
  }
  return map[order.failedAt] ?? map[order.status] ?? 0
}

// ── Lifecycle stepper ────────────────────────────────────────────────────────
// Ordered → In Progress → Shipped → Delivered, driven by the order's raw
// lifecycle stage. The failure branch (fulfilment_failed → refunded) is
// rendered against the normal track: a red stop icon marks the step where
// fulfilment halted, later steps are struck through, and the refunded order
// reads as finished-but-failed (red check on the stopped step).
const Stepper = ({ order }) => {
  const { t } = useLanguage()
  const failed = isFailedStage(order.status)
  const currentStep = failed ? failurePoint(order) : stepForStage(order.status)

  const iconFor = (done, active) =>
    done ? (
      <Check size={18} strokeWidth={3} />
    ) : active && failed ? (
      <Ban size={20} />
    ) : active ? (
      <Truck size={20} />
    ) : (
      <CircleDashed size={20} />
    )

  return (
    <ol className='grid grid-cols-4 gap-2 rounded-3xl border border-line bg-surface-alt p-5 sm:gap-4 sm:p-7'>
      {STEP_MILESTONES.map((step, index) => {
        const active = index === currentStep
        const done = !failed && index < currentStep
        const skipped = failed && index > currentStep

        const stateStyles = failed
          ? active
            ? 'border-red-500/60 bg-red-500/15 text-red-400'
            : skipped
              ? 'border-line bg-raised text-faint'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
          : done
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
            : active
              ? 'border-[#ec5800] bg-[#ec5800]/10 text-[#ec5800]'
              : 'border-line bg-raised text-faint'

        return (
          <li key={step.id} className='flex flex-col items-center gap-2 text-center'>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors sm:h-12 sm:w-12 ${stateStyles}`}
            >
              {iconFor(done, active)}
            </span>
            <span
              className={`text-xs font-semibold leading-tight sm:text-sm ${
                done || active ? 'text-strong' : 'text-muted'
              } ${skipped ? 'line-through opacity-40' : ''}`}
            >
              {t('orderStatus', step.labelKey)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// ── Item row ─────────────────────────────────────────────────────────────────
const StatusItem = ({ item }) => {
  const { t } = useLanguage()

  return (
    <div className='flex items-center gap-3 rounded-2xl border border-line bg-raised p-3'>
      <img src={item.image} alt={item.name} className='h-14 w-14 shrink-0 rounded-xl object-cover' />
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
  )
}

// ── Order status page ────────────────────────────────────────────────────────
const OrderStatus = () => {
  const { orderId } = useParams()
  const { t } = useLanguage()
  const [order, setOrder] = useState(() => getOrder(orderId))
  const [trackedId, setTrackedId] = useState(orderId)

  // Re-read when navigating between /orders/:id routes. Done by adjusting
  // state during render (the documented reset-on-prop-change pattern) instead
  // of an effect, so the right order renders in a single pass.
  if (trackedId !== orderId) {
    setTrackedId(orderId)
    setOrder(getOrder(orderId))
  }

  const placed = useMemo(() => (order?.placedAt ? new Date(order.placedAt) : null), [order])

  // Demo affordances: a local mock order never changes on its own, so these
  // drive the full lifecycle — the happy path stage by stage, the failure
  // branch (fulfilment_failed → refunded), and a reset for replay. A backend
  // replaces all of this.
  const advance = () => setOrder(advanceOrderStatus(orderId))
  const fail = () => setOrder(failOrder(orderId))
  const refund = () => setOrder(refundOrder(orderId))
  const reset = () => setOrder(resetOrder(orderId))

  // Unknown reference — the shopper may have followed a stale or mistyped link.
  if (!order) {
    return (
      <section className='min-h-screen w-full bg-surface px-5 text-strong'>
        <div className='flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center'>
          <span className='flex h-16 w-16 items-center justify-center rounded-full bg-raised text-faint'>
            <PackageOpen size={30} />
          </span>
          <p className='text-lg font-bold'>{t('orderStatus', 'notFoundTitle')}</p>
          <p className='max-w-sm text-sm text-muted'>{t('orderStatus', 'notFoundBody')}</p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Link
              to='/orders'
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#ec5800] px-6 py-2.5 text-sm font-semibold text-strong transition hover:bg-[#d04f00] active:scale-95'
            >
              {t('orders', 'viewOrdersCta')}
            </Link>
            <Link
              to='/shop'
              className='inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-strong transition hover:border-line-strong hover:text-strong active:scale-95'
            >
              {t('orders', 'emptyCta')}
            </Link>
            <Link
              to='/'
              className='inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-strong transition hover:border-line-strong hover:text-strong active:scale-95'
            >
              {t('checkout', 'successFeedCta')}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const failed = isFailedStage(order.status)

  // Which demo controls apply: advance + fail while in flight, refund once
  // fulfilment has failed, reset once delivered or refunded (replay).
  const demoActions = []
  if (order.status === 'fulfilment_failed') {
    demoActions.push({ key: 'demoRefund', icon: <RotateCcw size={13} />, run: refund })
  } else if (order.status === 'refunded' || order.status === 'delivered') {
    demoActions.push({ key: 'demoReset', icon: <RotateCcw size={13} />, run: reset })
  } else {
    demoActions.push({ key: 'demoAdvance', icon: <RefreshCw size={13} />, run: advance })
    // Failure is only possible before the parcel is on the road.
    if (stepForStage(order.status) < 2) {
      demoActions.push({ key: 'demoFail', icon: <Ban size={13} />, run: fail })
    }
  }

  return (
    <section className='min-h-screen w-full bg-surface px-5 pb-20 text-strong'>
      <div className='mx-auto max-w-4xl pt-8'>
        <Link
          to='/orders'
          className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-strong'
        >
          <Package size={15} />
          {t('orders', 'viewOrdersCta')}
        </Link>

        {/* Confirmation header */}
        <header className='mb-8 text-center'>
          <span
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              failed ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {failed ? <PackageX size={36} /> : <BadgeCheck size={36} />}
          </span>
          <h1 className='mt-6 text-3xl font-black tracking-tight sm:text-4xl'>
            {t('orderStatus', failed ? 'failedTitle' : 'title')}
          </h1>
          <p className='mt-3 text-sm leading-6 text-muted'>
            {t('orderStatus', failed ? 'failedSubtitle' : 'subtitle')}
          </p>
          <p className='mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-raised px-4 py-1.5 text-sm'>
            <span className='font-mono font-bold text-[#ec5800]'>{order.reference}</span>
            <span className='text-faint'>·</span>
            <span className='text-muted'>
              {placed ? `${formatDate(order.placedAt)} · ${formatTime(order.placedAt)}` : ''}
            </span>
          </p>
        </header>

        {/* Lifecycle stepper */}
        <Stepper order={order} />

        {failed && (
          <div className='mt-4 flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
            <PackageX size={16} className='shrink-0' />
            {t('orderStatus', `stage_${order.status}`)}
          </div>
        )}

        {/* Order summary card */}
        <div className='mt-8 overflow-hidden rounded-3xl border border-line bg-surface-alt'>
          <div className='flex items-center justify-between gap-4 border-b border-line px-6 py-4'>
            <h2 className='flex items-center gap-2 text-lg font-bold'>
              <Package size={18} className='text-[#ec5800]' />
              {t('checkout', 'summaryTitle')}
            </h2>
            <span className='text-lg font-black text-strong'>${order.total.toFixed(2)}</span>
          </div>

          <div className='space-y-3 p-6'>
            {order.items.map((item) => (
              <StatusItem key={item.id} item={item} />
            ))}
          </div>

          <div className='grid gap-4 border-t border-line p-6 text-sm sm:grid-cols-2'>
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
              <BadgeCheck size={15} className='mt-0.5 shrink-0 text-[#ec5800]' />
              <span>{t('checkout', 'mockNote')}</span>
            </div>
          </div>
        </div>

        {/* Demo controls — simulate the lifecycle and its failure branch
            (fulfilment_failed → refunded), then reset to replay. */}
        {demoActions.length > 0 && (
          <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
            {demoActions.map((action) => (
              <button
                key={action.key}
                onClick={action.run}
                className='inline-flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-strong active:scale-95'
              >
                {action.icon}
                {t('orderStatus', action.key)}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderStatus
