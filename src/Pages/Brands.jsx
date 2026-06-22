import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Store, Grid2X2 } from 'lucide-react'
import { brands } from '../data/brands'
import ShopNavbar from '../Components/ShopNavbar'
import Footer from '../Components/Footer'

const BrandsPage = () => {
  return (
    <section className="min-h-screen bg-[#0A0B0F] text-white">
      <ShopNavbar />
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 " />
        <div className="relative max-w-7xl mx-auto px-5 py-14 lg:py-18">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              <Sparkles size={14} />
              Brand Directory
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight">
              Discover brands that define the collection.
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-8">
              Explore a curated grid of labels. Tap any brand to open a dedicated collection page with all of its products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/50">Brands</p>
              <p className="text-2xl font-bold mt-1">{brands.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/50">Style range</p>
              <p className="text-2xl font-bold mt-1">Curated</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/50">Layout</p>
              <p className="text-2xl font-bold mt-1">Grid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-10 lg:py-14">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Featured labels</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Shop by brand</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/50 text-sm">
            <Grid2X2 size={16} />
            Grid View
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brands/${brand.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${brand.accent}`} />
              <div className={`mb-5 flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br ${brand.accent} shadow-lg`}>
                <span className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                  {brand.name.charAt(0)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">{brand.name}</h3>
                    <p className="mt-1 text-sm text-white/55 leading-6">{brand.tagline}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                    {brand.productCount}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 text-sm text-white/55">
                  <span className="inline-flex items-center gap-2">
                    <Store size={15} />
                    Collection
                  </span>
                  <span className="inline-flex items-center gap-1 text-white group-hover:text-[#f28500] transition-colors">
                    View brand <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  )
}

export default BrandsPage