import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Package,
  PackageX,
  PartyPopper,
  Smartphone,
  Truck,
} from 'lucide-react'
import { useCart } from '../Context/CartContext'
import { useLanguage } from '../Context/LanguageContext'
import { initializeTransaction } from '../lib/payments'
import { saveOrder, getLastOrder, clearLastOrder } from '../lib/orders'

const PAYMENT_METHODS = [
  { id: 'paystack-card', icon: CreditCard, labelKey: 'cardLabel', hintKey: 'cardHint' },
  { id: 'bank-transfer', icon: Landmark, labelKey: 'transferLabel', hintKey: 'transferHint' },
  { id: 'ussd', icon: Smartphone, labelKey: 'ussdLabel', hintKey: 'ussdHint' },
]

// ── Field primitive ──────────────────────────────────────────────────────────
const Field = ({ label, optional, ...inputProps }) => (
  <label className='block'>
    <span className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted'>
      {label}
      {optional && (
        <span className='ml-1 font-normal normal-case text-faint'>— optional</span>
      )}
    </span>
    <input
      {...inputProps}
      className='w-full rounded-xl border border-line bg-raised px-4 py-2.5 text-sm text-strong placeholder-faint outline-none transition-colors focus:border-[#ec5800] focus:bg-raised-strong'
    />
  </label>
)

// ── Order summary ────────────────────────────────────────────────────────────
const OrderSummary = ({ items, total }) => {
  const { t } = useLanguage()

  return (
    <div className='rounded-3xl border border-line bg-surface-alt p-6 lg:sticky lg:top-8'>
      <h2 className='flex items-center gap-2 text-lg font-bold'>
        <Package size={18} className='text-[#ec5800]' />
        {t('checkout', 'summaryTitle')}
      </h2>

      <div className='mt-5 space-y-4'>
        {items.map((item) => (
          <div key={item.id} className='flex items-center gap-4'>
            <div className='relative shrink-0'>
              <img
                src={item.image}
                alt={item.name}
                className='h-16 w-16 rounded-xl border border-line object-cover'
              />
              <span className='absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec5800] px-1 text-[11px] font-bold'>
                {item.quantity}
              </span>
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-strong'>{item.name}</p>
              <p className='mt-0.5 text-xs text-muted'>
                {item.brand || t('cart', 'brandFallback')}
              </p>
              <p className='mt-0.5 text-sm font-bold text-strong'>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 space-y-2.5 border-t border-line pt-5 text-sm'>
        <div className='flex justify-between text-muted'>
          <span>{t('cart', 'subtotal')}</span>
          <span className='font-semibold text-strong'>${total.toFixed(2)}</span>
        </div>
        <div className='flex justify-between text-muted'>
          <span>{t('checkout', 'shippingLabel')}</span>
          <span className='font-semibold text-emerald-400'>
            {t('checkout', 'shippingFree')}
          </span>
        </div>
        <div className='flex justify-between border-t border-line pt-3 text-base'>
          <span className='font-bold text-strong'>{t('checkout', 'totalLabel')}</span>
          <span className='font-black text-[#ec5800]'>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Success state ────────────────────────────────────────────────────────────
const CheckoutSuccess = ({ order }) => {
  const { t } = useLanguage()

  // Accepts both the fresh payment payload (`amount`) and the restored
  // persisted order (`total`) so the receipt renders identically on refresh.
  const amount = order.amount ?? order.total ?? 0

  // Dismiss the restored receipt once the shopper moves on — the order itself
  // stays in history at /orders.
  const leaveSuccess = () => clearLastOrder()

  return (
    <div className='mx-auto max-w-lg py-10 text-center'>
      <span className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400'>
        <PartyPopper size={36} />
      </span>
      <h1 className='mt-6 text-3xl font-black tracking-tight sm:text-4xl'>
        {t('checkout', 'successTitle')}
      </h1>
      <p className='mt-3 text-sm leading-6 text-muted'>{t('checkout', 'successBody')}</p>

      <div className='mt-8 rounded-3xl border border-line bg-surface-alt p-6 text-left'>
        <div className='flex items-center justify-between gap-4 border-b border-line pb-4'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted'>
            {t('checkout', 'referenceLabel')}
          </span>
          <span className='font-mono text-sm font-bold text-[#ec5800]'>
            {order.reference}
          </span>
        </div>
        <div className='flex items-center justify-between gap-4 py-4'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted'>
            {t('checkout', 'paidLabel')}
          </span>
          <span className='text-lg font-black text-strong'>${amount.toFixed(2)}</span>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm text-muted'>
          <span className='inline-flex items-center gap-1.5'>
            <Mail size={14} className='text-[#ec5800]' />
            {order.email}
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <Truck size={14} className='text-[#ec5800]' />
            {t('checkout', 'deliveryEstimate')}
          </span>
        </div>
        <div className='mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300'>
          <BadgeCheck size={15} className='shrink-0' />
          {t('checkout', 'mockNote')}
        </div>
      </div>

      <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
        <Link
          to={`/orders/${order.reference}`}
          onClick={leaveSuccess}
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#ec5800] px-6 py-3 text-sm font-semibold text-strong transition hover:bg-[#d04f00] active:scale-95'
        >
          {t('orderStatus', 'trackOrderCta')}
        </Link>
        <Link
          to='/shop'
          onClick={leaveSuccess}
          className='inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-semibold text-strong transition hover:border-line-strong hover:text-strong active:scale-95'
        >
          {t('checkout', 'successShopCta')}
        </Link>
        <Link
          to='/'
          onClick={leaveSuccess}
          className='inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-semibold text-strong transition hover:border-line-strong hover:text-strong active:scale-95'
        >
          {t('checkout', 'successFeedCta')}
        </Link>
      </div>
    </div>
  )
}

// ── Checkout page ────────────────────────────────────────────────────────────
const Checkout = () => {
  const { cartItems, cartTotal, clearCart, setIsCartOpen } = useCart()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id)
  const [status, setStatus] = useState('form') // 'form' | 'processing' | 'success'
  const [order, setOrder] = useState(getLastOrder)

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Minimal guard — required-field notice if browser validation is bypassed
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'country']
    if (required.some((key) => !form[key].trim())) return

    setStatus('processing')
    try {
      // Mock transaction — swap initializeTransaction for the real endpoint
      // once the Express service exists.
      const tx = await initializeTransaction({ email: form.email, amount: cartTotal })
      const placedOrder = {
        reference: tx.data.reference,
        amount: tx.data.amount / 100,
        email: form.email,
      }
      // Persist the full order so the receipt survives a refresh and shows up
      // in /orders. Item prices are snapshot at purchase time.
      saveOrder({
        reference: placedOrder.reference,
        placedAt: new Date().toISOString(),
        status: 'paid',
        email: placedOrder.email,
        total: placedOrder.amount,
        paymentMethod,
        delivery: {
          address: form.address,
          city: form.city,
          country: form.country,
        },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      })
      // Land on the order status page automatically — the receipt lives there
      // now, with the lifecycle stepper.
      navigate(`/orders/${placedOrder.reference}`)
      setOrder(placedOrder)
      setStatus('success')
      clearCart()
    } catch {
      setStatus('form')
    }
  }

  // Receipt view: either we just paid, or the shopper refreshed the success
  // page — a refresh resets status to 'form', but the cart was cleared on
  // payment and the order is still in localStorage, which is the refresh
  // signature. Checked before the empty-cart guard for exactly that reason.
  const showReceipt =
    (status === 'success' && order) ||
    (status === 'form' && order && cartItems.length === 0)

  if (showReceipt) {
    return (
      <section className='min-h-screen w-full bg-surface px-5 pb-16 text-strong'>
        <CheckoutSuccess order={order} />
      </section>
    )
  }

  // Dead-end guard: empty cart bounces back to the shop
  if (cartItems.length === 0) {
    return (
      <section className='min-h-screen w-full bg-surface px-5 text-strong'>
        <div className='flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center'>
          <span className='flex h-16 w-16 items-center justify-center rounded-full bg-raised text-faint'>
            <PackageX size={30} />
          </span>
          <p className='text-lg font-bold'>{t('checkout', 'emptyCartTitle')}</p>
          <Link
            to='/shop'
            className='inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-on-accent/85 active:scale-95'
          >
            {t('checkout', 'emptyCartCta')}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className='min-h-screen w-full bg-surface px-5 pb-16 text-strong'>
      <div className='mx-auto max-w-7xl pt-8'>
        <button
          onClick={() => {
            setIsCartOpen(false)
            navigate(-1)
          }}
          className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-strong'
        >
          <ArrowLeft size={16} />
          {t('checkout', 'back')}
        </button>
      </div>

      <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
        {/* Delivery + payment form */}
        <form onSubmit={handleSubmit} className='space-y-8'>
          <section className='rounded-3xl border border-line bg-surface-alt p-6 sm:p-8'>
            <h2 className='flex items-center gap-2 text-lg font-bold'>
              <MapPin size={18} className='text-[#ec5800]' />
              {t('checkout', 'deliveryTitle')}
            </h2>
            <p className='mt-1 text-sm text-muted'>{t('checkout', 'deliveryHint')}</p>

            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <Field
                label={t('checkout', 'fullNameLabel')}
                value={form.fullName}
                onChange={setField('fullName')}
                placeholder='Amina Bello'
                required
              />
              <Field
                label={t('checkout', 'emailLabel')}
                type='email'
                value={form.email}
                onChange={setField('email')}
                placeholder='you@example.com'
                required
              />
              <Field
                label={t('checkout', 'phoneLabel')}
                type='tel'
                value={form.phone}
                onChange={setField('phone')}
                placeholder='+234 801 234 5678'
                required
              />
              <Field
                label={t('checkout', 'addressLabel')}
                value={form.address}
                onChange={setField('address')}
                placeholder='12 Ozumba Mbadiwe Avenue'
                required
              />
              <Field
                label={t('checkout', 'cityLabel')}
                value={form.city}
                onChange={setField('city')}
                placeholder='Lagos'
                required
              />
              <Field
                label={t('checkout', 'countryLabel')}
                value={form.country}
                onChange={setField('country')}
                placeholder='Nigeria'
                required
              />
            </div>
          </section>

          <section className='rounded-3xl border border-line bg-surface-alt p-6 sm:p-8'>
            <h2 className='flex items-center gap-2 text-lg font-bold'>
              <Lock size={18} className='text-[#ec5800]' />
              {t('checkout', 'paymentTitle')}
            </h2>
            <p className='mt-1 text-sm text-muted'>{t('checkout', 'paymentHint')}</p>

            <div className='mt-6 space-y-3'>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                const isActive = paymentMethod === method.id
                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
                      isActive
                        ? 'border-[#ec5800] bg-[#ec5800]/10'
                        : 'border-line bg-raised hover:border-line-strong'
                    }`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={method.id}
                      checked={isActive}
                      onChange={() => setPaymentMethod(method.id)}
                      className='sr-only'
                    />
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive ? 'bg-[#ec5800] text-strong' : 'bg-raised text-muted'
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className='flex-1'>
                      <span className='block text-sm font-bold text-strong'>
                        {t('checkout', method.labelKey)}
                      </span>
                      <span className='mt-0.5 block text-xs text-muted'>
                        {t('checkout', method.hintKey)}
                      </span>
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        isActive ? 'border-[#ec5800]' : 'border-line-strong'
                      }`}
                    >
                      {isActive && <span className='h-2.5 w-2.5 rounded-full bg-[#ec5800]' />}
                    </span>
                  </label>
                )
              })}
            </div>

            {/* Demo note — no real charge is made */}
            <div className='mt-6 flex items-start gap-2 rounded-xl border border-line bg-raised px-4 py-3 text-xs leading-5 text-muted'>
              <Lock size={13} className='mt-0.5 shrink-0 text-[#ec5800]' />
              {t('checkout', 'mockNote')}
            </div>

            <button
              type='submit'
              disabled={status === 'processing'}
              className='mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-bold tracking-wide text-black transition hover:bg-on-accent/90 active:scale-[0.99] disabled:opacity-60'
            >
              {status === 'processing' ? (
                <>
                  <Loader2 size={16} className='animate-spin' />
                  {t('checkout', 'processingLabel')}
                </>
              ) : (
                <>
                  <Lock size={15} />
                  {t('checkout', 'payButton')} ${cartTotal.toFixed(2)}
                </>
              )}
            </button>
          </section>
        </form>

        {/* Order summary column */}
        <div>
          <OrderSummary items={cartItems} total={cartTotal} />
        </div>
      </div>
    </section>
  )
}

export default Checkout
