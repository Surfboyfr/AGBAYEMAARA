import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../Context/ThemeContext'
import { useLanguage } from '../Context/LanguageContext'

// Sun/moon toggle for the light/dark theme. Shows the icon of the theme you
// would switch TO (moon while in light, sun while in dark), matching the
// pattern used by most app chrome. Rendered as a theme-aware ghost chip: a
// quiet control at rest, a warm glow + orange icon on hover.
const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`group relative rounded-lg bg-raised p-2.5 text-muted transition-all duration-200 hover:bg-raised-strong hover:text-[#ec5800] active:scale-95 ${className}`}
      aria-label={t('nav', isDark ? 'switchToLight' : 'switchToDark')}
      title={t('nav', isDark ? 'switchToLight' : 'switchToDark')}
    >
      {isDark ? <Sun size={18} className='transition-transform duration-500 group-hover:rotate-90' /> : <Moon size={18} className='transition-transform duration-500 group-hover:-rotate-12' />}
    </button>
  )
}

export default ThemeToggle
