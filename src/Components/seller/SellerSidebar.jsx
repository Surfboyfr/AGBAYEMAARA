import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react'

// Seller portal navigation. Desktop: fixed sidebar. Mobile: off-canvas drawer
// (controlled by SellerLayout) with a dismissible scrim.
const navItems = [
  { label: 'Dashboard', to: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', to: '/seller/inventory', icon: Package },
  { label: 'Products', to: '/seller/products', icon: Store },
  { label: 'Orders', to: '/seller/orders', icon: ClipboardList },
  { label: 'Profile', to: '/seller/profile', icon: UserRound },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-[#ec5800]/10 text-[#ec5800]'
      : 'text-muted hover:bg-raised hover:text-strong'
  }`

const SellerSidebar = ({ open, onClose, lowStockCount = 0 }) => {
  const navigate = useNavigate()

  // MOCK LOGOUT — there is no session/token to clear yet. When real auth
  // lands, clear the seller session here before navigating.
  const handleLogout = () => {
    navigate('/seller/login', { replace: true })
  }

  return (
    <>
      {/* Mobile scrim — tapping outside the drawer closes it */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface-alt transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className='flex items-center justify-between gap-3 border-b border-line px-5 py-4'>
          <div className='min-w-0'>
            <p className='truncate text-base font-bold tracking-wide text-strong'>
              Àgbáyémáarà
            </p>
            <p className='mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ec5800]'>
              Seller Center
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-muted transition-colors hover:bg-raised-strong hover:text-strong lg:hidden'
            aria-label='Close menu'
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className='flex-1 overflow-y-auto px-3 py-4' aria-label='Seller navigation'>
          <ul className='space-y-1'>
            {navItems.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose} className={linkClass}>
                  <Icon size={17} className='shrink-0' />
                  {label}
                  {label === 'Inventory' && lowStockCount > 0 && (
                    <span className='ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500'>
                      {lowStockCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className='my-4 h-px bg-line' />

          <ul>
            <li>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:bg-red-500/10 hover:text-red-400'
              >
                <LogOut size={17} className='shrink-0' />
                Logout
              </button>
            </li>
          </ul>
        </nav>

        {/* Honest demo notice — seller routes are NOT secured yet. */}
        <div className='border-t border-line px-5 py-4'>
          <p className='flex items-start gap-2 text-[11px] leading-relaxed text-faint'>
            <TriangleAlert size={13} className='mt-0.5 shrink-0 text-amber-500' />
            <span>
              Demo build — mock login and local data only. Seller auth and
              permissions arrive with the backend.
            </span>
          </p>
        </div>
      </aside>
    </>
  )
}

export default SellerSidebar
