import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Moralis from 'moralis'

// Initialize Moralis
const initMoralis = async () => {
  try {
    await Moralis.start({
      apiKey: import.meta.env.VITE_MORALIS_API_KEY || 'your-api-key-here'
    })
    
    // Make Moralis available globally
    window.Moralis = Moralis
    console.log('Moralis initialized successfully and available globally')
    console.log('Moralis object structure:', Object.keys(Moralis))
    console.log('Moralis.EvmApi structure:', Object.keys(Moralis.EvmApi))
    return true
  } catch (error) {
    console.error('Failed to initialize Moralis:', error)
    return false
  }
}

// Initialize Moralis before rendering the app
const startApp = async () => {
  const moralisReady = await initMoralis()
  
  if (!moralisReady) {
    console.error('Moralis failed to initialize. The app may not work properly.')
  }
  
  // Render the app
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Start the app
startApp()

