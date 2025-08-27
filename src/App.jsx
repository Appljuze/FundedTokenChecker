import React from 'react'
import { Gift } from 'lucide-react'
import TokenBalanceChecker from './components/TokenBalanceChecker'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-full mr-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">$VIBE Airdrop Calculator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your estimated $VIBE airdrop based on combined $FUNDED token holdings across multiple wallets
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <TokenBalanceChecker />
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Powered by Base RPC • $FUNDED → $VIBE Airdrop Calculator</p>
        </div>
      </div>
    </div>
  )
}

export default App
