import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize Moralis and make it globally available
const initMoralis = async () => {
  try {
    console.log('🚀 Starting Moralis initialization...')
    
    // Import Moralis dynamically
    const Moralis = await import('moralis')
    
    // Use a working API key for testing (you should replace this with your own)
    const apiKey = import.meta.env.VITE_MORALIS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdkNGM4ZGEzLTYzODAtNGI0MC1iOGE2LTU5ZGQ3NzY5YmQ2OSIsIm9yZ0lkIjoiNDE0NDczIiwidXNlcklkIjoiNDI1NTkzIiwidHlwZUlkIjoiY2Q5N2ZhNzYtNzAzNi00ZWEyLTk5MDYtZjM5ZGY2YzU3NjNmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzUzNTUzMDAsImV4cCI6NDg5MTExNTMwMH0.MYKtJkZ2-bhJaQp9fFUY4KPHWFJnA1HV6ZG1o3aCcuk'
    
    // Initialize Moralis
    await Moralis.default.start({
      apiKey: apiKey
    })
    
    // Make Moralis globally available
    window.Moralis = Moralis.default
    window.MoralisEvmApi = Moralis.default.EvmApi
    
    console.log('✅ Moralis initialized successfully and made globally available')
    console.log('🔗 Moralis object:', window.Moralis)
    console.log('🔗 EvmApi object:', window.MoralisEvmApi)
    
    // Test the API connection with the correct endpoint
    try {
      console.log('🧪 Testing Moralis API connection...')
      const testResponse = await window.MoralisEvmApi.token.getWalletTokenBalances({
        address: '0x62B1164bF496f464BAB19C42B88B92E2C74CBE6A', // Test wallet address
        chain: '0x2105', // Base mainnet
        tokenAddresses: ['0xc1d5892e28ea1c5ecd9fac7771b9d06802f321e0'] // $FUNDED token
      })
      console.log('✅ Moralis API test successful:', testResponse)
      console.log('🔍 Test result count:', testResponse.result?.length || 0)
    } catch (testError) {
      console.error('❌ Moralis API test failed:', testError)
      console.error('🔍 Test error details:', {
        message: testError.message,
        status: testError.status,
        code: testError.code
      })
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Moralis:', error)
    console.log('📱 App will continue with fallback RPC methods')
    window.Moralis = null
    window.MoralisEvmApi = null
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

