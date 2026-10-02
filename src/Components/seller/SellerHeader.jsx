import { useLocation } from 'react-router-dom'
import { Menu, Store } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'
import { useSeller } from '../../Context/SellerContext'

// Route → page title so the header always matches the open surface.
const TITLES = {
  '/seller': 'Dashboard',
  '/seller/dashboard': 'Dashboard',
  '/seller/inventory': 'Inventory',
  '/seller/products': 'Products',
  '/seller/orders': 'Orders',
  '/seller/profile': 'Profile',
}

// Sticky glass header (same treatment as ShopNavbar): mobile menu trigger,
// current page title, theme toggle and the signed-in seller chip.
const SellerHeader = ({ onMenuClick }) => {
  const { pathname } = useLocation()
  const { profile } = useSeller()
  const title = TITLES[pathname] ?? 'Seller Center'

  return (
    <header className='sticky top-0 z-30 border-b border-line bg-surface/85 shadow-nav backdrop-blur-md supports-[backdrop-filter]:bg-surface/70'>
      <div className='flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8'>
        <button
          onClick={onMenuClick}
          className='rounded-lg p-2.5 text-muted transition-all duration-200 hover:bg-raised-strong hover:text-strong lg:hidden'
          aria-label='Open menu'
        >
          <Menu size={20} />
        </button>

        <div className='min-w-0'>
          <p className='truncate text-lg font-bold tracking-tight text-strong sm:text-xl'>
            {title}
          </p>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <ThemeToggle />

          <div className='flex items-center gap-2.5 rounded-full border border-line bg-raised py-1 pl-1 pr-1 sm:pr-4'>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt=''
                className='h-8 w-8 shrink-0 rounded-full object-cover'
              />
            ) : (
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ec5800]/10 text-[#ec5800]'>
                <Store size={14} aria-hidden='true' />
              </span>
            )}
            <div className='hidden min-w-0 sm:block'>
              <p className='truncate text-xs font-bold leading-tight text-strong'>
                {profile.businessName}
              </p>
              <p className='truncate text-[11px] leading-tight text-muted'>
                {profile.ownerName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default SellerHeader
