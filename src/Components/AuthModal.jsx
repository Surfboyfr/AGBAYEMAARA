import { useState, useEffect, useRef } from 'react'
import { User, X, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useLanguage } from '../Context/LanguageContext'

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const overlayRef = useRef(null)
  const { t } = useLanguage()

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auth logic goes here
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        isOpen
          ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/70'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`relative w-full max-w-md bg-surface-alt border border-line rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#ec5800]/50 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-strong transition-colors duration-200 p-1.5 rounded-lg hover:bg-raised-strong"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-8 pt-8 pb-10">
          <div className="mb-8">
            <p className="text-faint text-xs tracking-[0.25em] uppercase mb-2">{t('auth', 'brand')}</p>
            <h2 className="text-strong text-2xl font-bold tracking-tight leading-tight">
              {mode === 'signin' ? t('auth', 'welcomeBack') : t('auth', 'createAccount')}
            </h2>
            <p className="text-muted text-sm mt-1.5">
              {mode === 'signin' ? t('auth', 'signInSubtitle') : t('auth', 'signUpSubtitle')}
            </p>
          </div>

          <div className="flex bg-raised rounded-lg p-1 mb-7 border border-line">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  mode === m ? 'bg-strong text-surface shadow' : 'text-muted hover:text-strong'
                }`}
              >
                {m === 'signin' ? t('auth', 'signIn') : t('auth', 'signUp')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="group">
                <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                  {t('auth', 'fullName')}
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-muted transition-colors"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth', 'fullNamePlaceholder')}
                    required={mode === 'signup'}
                    className="w-full bg-raised border border-line text-strong placeholder-faint rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-line-strong transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                {t('auth', 'email')}
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-muted transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth', 'emailPlaceholder')}
                  required
                  className="w-full bg-raised border border-line text-strong placeholder-faint rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-line-strong transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                {t('auth', 'password')}
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint group-focus-within:text-muted transition-colors"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? t('auth', 'passwordPlaceholderSignup') : t('auth', 'passwordPlaceholderSignin')}
                  required
                  className="w-full bg-raised border border-line text-strong placeholder-faint rounded-lg py-3 pl-10 pr-11 text-sm focus:outline-none focus:border-line-strong transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="text-right">
                <button type="button" className="text-muted text-xs hover:text-muted transition-colors">
                  {t('auth', 'forgotPassword')}
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 bg-[#ec5800] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d04f00] active:scale-[0.98] transition-all duration-200 text-sm tracking-wide group"
            >
              {mode === 'signin' ? t('auth', 'signInButton') : t('auth', 'createAccountButton')}
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-raised-strong" />
            <span className="text-faint text-xs">{t('auth', 'continueWithGoogle')}</span>
            <div className="flex-1 h-px bg-raised-strong" />
          </div>

          <button
            type="button"
            className="w-full bg-raised border border-line text-muted hover:text-strong hover:bg-raised-strong rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('auth', 'continueWithGoogle')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
