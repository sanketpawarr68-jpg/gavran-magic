import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { HashRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'

const PUBLISHABLE_KEY = "pk_test_aW1tdW5lLWFuZW1vbmUtMjMuY2xlcmsuYWNjb3VudHMuZGV2JA"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <HashRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
