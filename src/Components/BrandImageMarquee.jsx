import { Link } from 'react-router-dom'
import { BadgeCheck, MapPin, Sparkles } from 'lucide-react'
import { brands } from '../data/brands'

const BrandImageMarquee = () => {
  // Duplicate the brands array for a seamless continuous marquee loop
  const slides = [...brands, ...brands]

  return (
    <section
      aria-label="Featured African Brands Marquee"
      className="w-full overflow-hidden border-t border-neutral-200 bg-neutral-50 pt-8 pb-10"
    >
      <div className="mx-auto max-w-7xl px-5 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#ec5800]" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-600">
            Premier African Fashion Houses
          </p>
        </div>
        <p className="hidden sm:block text-[11px] text-neutral-400">
          Hover to pause • Discover independent labels
        </p>
      </div>

      <div className="brand-marquee-container">
        <div className="brand-marquee-track">
          {slides.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              to={`/brands/${brand.slug}`}
              className="group relative flex h-48 w-64 sm:h-56 sm:w-72 shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-orange-300 hover:shadow-[0_18px_36px_-18px_rgba(15,23,42,0.3)]"
            >
              {/* Brand Image */}
              <img
                src={brand.coverImage}
                alt={brand.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              <div className={`absolute top-0 inset-x-0 h-1 bg-linear-to-r ${brand.accent}`} />

              {/* Top Category Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md border border-white/10">
                  {brand.category || 'Atelier'}
                </span>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 p-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-white transition-colors group-hover:text-[#ec5800] drop-shadow-sm">
                    {brand.name}
                  </h4>
                  <BadgeCheck size={15} className="text-[#ec5800] shrink-0" />
                </div>

                <p className="line-clamp-1 text-xs text-white/70">
                  {brand.tagline}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/50">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={10} className="text-[#ec5800]" />
                    {brand.location}
                  </span>
                  <span>•</span>
                  <span>{brand.productCount} pieces</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BrandImageMarquee
