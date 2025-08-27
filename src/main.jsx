import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize Moralis in the background
const initMoralis = async () => {
  try {
    const Moralis = await import('moralis')
    await Moralis.default.start({
      apiKey: import.meta.env.VITE_MORALIS_API_KEY || 'your-api-key-here'
    })
    console.log('Moralis initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Moralis:', error)
    console.log('App will continue with fallback RPC methods')
  }
}

// Start Moralis initialization but don't wait for it
initMoralis()

// Render the app immediately
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

