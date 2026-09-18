import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, Star, PackageX, MapPin } from 'lucide-react'
import { getProductById, getAvailability, AVAILABILITY_STATUS } from '../data/products'
import { brands } from '../data/brands'
import { useCart } from '../Context/CartContext'
import { useLanguage } from '../Context/LanguageContext'

// Proper state badges: in stock / made to order (+ lead time) / sold out.
const AVAILABILITY_BADGES = {
  [AVAILABILITY_STATUS.IN_STOCK]: {
    labelKey: 'inStock',
    icon: CheckCircle2,
    chipClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [AVAILABILITY_STATUS.MADE_TO_ORDER]: {
    labelKey: 'madeToOrder',
    icon: Clock,
    chipClass: 'bg-[#f28500]/10 text-[#b35f00] border-[#f28500]/30',
  },
  [AVAILABILITY_STATUS.SOLD_OUT]: {
    labelKey: 'soldOut',
    icon: PackageX,
    chipClass: 'bg-red-50 text-red-600 border-red-200',
  },
}

const AvailabilityBadge = ({ availability }) => {
  const { t } = useLanguage()
  const badge =
    AVAILABILITY_BADGES[availability.status] ??
    AVAILABILITY_BADGES[AVAILABILITY_STATUS.IN_STOCK]
  const Icon = badge.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.chipClass}`}
    >
      <Icon size={13} />
      {t('productDetails', badge.labelKey)}
      {availability.status === AVAILABILITY_STATUS.MADE_TO_ORDER &&
        availability.leadTime && (
          <span className="font-medium opacity-80">— {availability.leadTime}</span>
        )}
    </span>
  )
}

const ProductDetails = () => {
  const { productId } = useParams()
  const product = getProductById(productId)
  const { addToCart, setIsCartOpen } = useCart()
  const { t } = useLanguage()
  const availability = getAvailability(product)
  // The brand name is tappable when the label has a Brand Profile; products
  // from unlisted brands fall back to plain text.
  const brandProfile = product?.brand
    ? brands.find((brand) => brand.name === product.brand)
    : null

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className='text-2xl font-bold text-black'>{t('productDetails', 'notFound')}</p>
        <Link to='/shop' className='text-sm font-medium text-[#f28500] hover:underline'>
          {t('productDetails', 'return')}
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.productName,
      price: product.productPrice,
      image: product.productImage,
      brand: product.brand,
    })
    setIsCartOpen(true)
  }

  return (
    <section className="bg-white text-black px-5 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black mb-6">
          <ArrowLeft size={16} />
          {t('productDetails', 'back')}
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-3xl overflow-hidden bg-gray-100 border border-gray-100">
            <img
              src={product.productImage}
              alt={product.productName}
              className="w-full h-[420px] lg:h-[620px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              {brandProfile ? (
                <Link
                  to={`/brands/${brandProfile.slug}`}
                  className="group/brand inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.25em] text-black/45 mb-3 transition-colors hover:text-[#f28500]"
                >
                  {product.brand}
                  <MapPin
                    size={12}
                    className="opacity-0 -translate-x-1 transition-all duration-200 group-hover/brand:opacity-100 group-hover/brand:translate-x-0"
                  />
                </Link>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45 mb-3">
                  {product.brand}
                </p>
              )}
              <h1 className="text-3xl lg:text-2xl font-bold tracking-tight text-black">{product.productName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-black/60">
                <span className="inline-flex items-center gap-1.5">
                  <Star size={15} className="text-[#f28500] fill-[#f28500]" />
                  {product.rating}
                </span>
                <span>•</span>
                <span>{product.category}</span>
                <span>•</span>
                <AvailabilityBadge availability={availability} />
              </div>
            </div>

            <p className="text-3xl font-semibold text-black">${product.productPrice.toFixed(2)}</p>

            <p className="text-base leading-7 text-black/70 max-w-2xl">{product.description}</p>

            <div className="rounded-2xl bg-white border border-gray-200  shadow-md text-white p-6 space-y-4 mt-5">
              <h2 className='text-lg font-semibold text-black'>{t('productDetails', 'overview')}</h2>
              <p className="text-black/70 leading-7">{product.overview}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {product.details.map((detail) => (
                <div key={detail} className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 text-[#f28500] shrink-0" />
                  <span className="text-sm leading-6 text-black/75">{detail}</span>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                <Truck size={18} className="mt-0.5 text-black/70 shrink-0" />
                <div>
                  <p className='font-semibold text-black'>{t('productDetails', 'fastDelivery')}</p>
                  <p className='text-sm text-black/60 mt-1'>{t('productDetails', 'fastDeliveryText')}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-black/70 shrink-0" />
                <div>
                  <p className='font-semibold text-black'>{t('productDetails', 'qualityGuarantee')}</p>
                  <p className='text-sm text-black/60 mt-1'>{t('productDetails', 'qualityGuaranteeText')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
              <h2 className='text-lg font-semibold text-black'>{t('productDetails', 'care')}</h2>
              <p className="text-sm leading-6 text-black/70">{product.care}</p>
            </div>

            {/* Availability states: inStock / madeToOrder / soldOut */}
            <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
              <h2 className='text-lg font-semibold text-black'>Availability</h2>
              {availability.status === AVAILABILITY_STATUS.IN_STOCK && (
                <p className="text-sm leading-6 text-black/70 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  In stock and ready to ship within 48 hours.
                </p>
              )}
              {availability.status === AVAILABILITY_STATUS.MADE_TO_ORDER && (
                <p className="text-sm leading-6 text-black/70 flex items-center gap-2">
                  <Clock size={18} className="text-[#f28500] shrink-0" />
                  Made to order for you by hand — allow {availability.leadTime} for production and delivery.
                </p>
              )}
              {availability.status === AVAILABILITY_STATUS.SOLD_OUT && (
                <p className="text-sm leading-6 text-black/70 flex items-center gap-2">
                  <PackageX size={18} className="text-red-500 shrink-0" />
                  Sold out. Join the waitlist and we’ll email you when it returns.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {availability.status === AVAILABILITY_STATUS.SOLD_OUT ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black/20 px-6 py-3.5 text-sm font-semibold text-white cursor-not-allowed"
                >
                  <PackageX size={16} />
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A0B0F] px-6 py-3.5 text-sm font-semibold text-white hover:bg-black/90 transition-colors"
                >
                  {availability.status === AVAILABILITY_STATUS.MADE_TO_ORDER ? (
                    <>
                      <Clock size={16} />
                      Order — Made to Order
                    </>
                  ) : (
                    t('productDetails', 'addToCart')
                  )}
                </button>
              )}
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
              >
                {t('productDetails', 'continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails