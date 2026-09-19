import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { CartProvider } from './Context/CartContext'
import { FollowProvider } from './Context/FollowContext'
import { LanguageProvider } from './Context/LanguageContext'
import { ThemeProvider } from './Context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <CartProvider>
        <FollowProvider>
          <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
          </LanguageProvider>
        </FollowProvider>
      </CartProvider>
    </Router>
  </StrictMode>,
)
