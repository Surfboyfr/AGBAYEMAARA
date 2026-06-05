import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, ShoppingBag, Menu, X, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useCart } from '../Context/CartContext'

// ── Sign-in Modal ─────────────────────────────────────────────────────────────
const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const overlayRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auth logic goes here
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/70'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Modal card */}
        <div
          className={`relative w-full max-w-md bg-[#0D0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
          }`}
        >
          {/* Top accent bar */}
          <div className="h-0.5 w-full bg-linear-to-r from-transparent via-white/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>

          <div className="px-8 pt-8 pb-10">
            {/* Brand mark */}
            <div className="mb-8">
              <p className="text-white/30 text-xs tracking-[0.25em] uppercase mb-2">Agbayemaara</p>
              <h2 className="text-white text-2xl font-bold tracking-tight leading-tight">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-white/40 text-sm mt-1.5">
                {mode === 'signin'
                  ? 'Sign in to access your orders and wishlist.'
                  : 'Join and discover the best of African fashion.'}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white/5 rounded-lg p-1 mb-7 border border-white/5">
              {['signin', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-black shadow'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="group">
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required={mode === 'signup'}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg py-3 pl-10 pr-11 text-sm focus:outline-none focus:border-white/30 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" className="text-white/40 text-xs hover:text-white/70 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm tracking-wide group"
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/25 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google OAuth placeholder */}
            <button
              type="button"
              className="w-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── ShopNavbar ─────────────────────────────────────────────────────────────────
const ShopNavbar = () => {
  const { cartCount, setIsCartOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Home', to: '/' },
  ]

  return (
    <>
      <nav className="bg-[#0A0B0F] w-full sticky top-0 z-30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/shop" className="text-white text-xl font-bold tracking-tight hover:text-white/80 transition-colors">
            Agbayemaara
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Sign in"
            >
              <User size={20} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ml-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 ${
            mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 py-3 flex flex-col gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/60 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
            <button
              onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}
              className="text-white/60 hover:text-white text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all duration-200 text-left flex items-center gap-2"
            >
              <User size={15} />
              Sign In / Register
            </button>
          </div>
        </div>
      </nav>

      {/* Auth modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

export default ShopNavbar