import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <SettingsProvider>
          <BrowserRouter>
            <CartProvider>
              <App />
            </CartProvider>
          </BrowserRouter>
        </SettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
)
