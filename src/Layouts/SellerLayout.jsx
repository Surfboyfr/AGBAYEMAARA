import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SellerSidebar from '../Components/seller/SellerSidebar'
import SellerHeader from '../Components/seller/SellerHeader'
import { useSeller } from '../Context/SellerContext'

// Shell for every /seller/* surface (except login): sidebar + header + main.
// The sidebar is a fixed column on desktop and an off-canvas drawer on
// mobile — the header's hamburger controls it.
const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { stats } = useSeller()

  return (
    <div className='min-h-screen bg-surface text-strong'>
      <SellerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lowStockCount={stats.lowStockProducts}
      />

      <div className='lg:pl-64'>
        <SellerHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className='mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SellerLayout
