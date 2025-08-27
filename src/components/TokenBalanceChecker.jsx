import React, { useState } from 'react'
import { Search, Wallet, Coins, Hash, AlertCircle, CheckCircle, Loader2, ExternalLink, Gift, Plus, X, Users } from 'lucide-react'
import { useMoralis } from '../hooks/useMoralis'

const TokenBalanceChecker = () => {
  const [wallets, setWallets] = useState([''])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  
  // Hardcoded values
  const TOKEN_ADDRESS = '0xc1d5892e28ea1c5ecd9fac7771b9d06802f321e0' // $FUNDED token on Base
  const BLOCK_NUMBER = 26161082
  const FUNDED_USD_VALUE = 0.15 // $0.15 per $FUNDED token
  
  const { getTokenBalanceAtBlock } = useMoralis()

  const handleWalletChange = (index, value) => {
    const newWallets = [...wallets]
    newWallets[index] = value
    setWallets(newWallets)
  }

  const addWallet = () => {
    setWallets([...wallets, ''])
  }

  const removeWallet = (index) => {
    if (wallets.length > 1) {
      const newWallets = wallets.filter((_, i) => i !== index)
      setWallets(newWallets)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Filter out empty wallet addresses
    const validWallets = wallets.filter(wallet => wallet.trim())
    if (validWallets.length === 0) return
    
    console.log('🚀 Starting balance check for wallets:', validWallets)
    console.log('📊 Total wallets to check:', validWallets.length)
    
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const walletResults = []
      let totalBalance = 0

      // Check balance for each wallet
      for (let i = 0; i < validWallets.length; i++) {
        const walletAddress = validWallets[i]
        console.log(`\n🔍 Processing wallet ${i + 1}/${validWallets.length}:`, walletAddress)
        
        try {
          console.log(`  ⏳ Fetching balance for wallet: ${walletAddress}`)
          
          const balance = await getTokenBalanceAtBlock(
            TOKEN_ADDRESS,
            walletAddress.trim(),
            BLOCK_NUMBER
          )
          
          console.log(`  ✅ Raw balance response:`, balance)
          
          // Ensure balance is properly parsed and handle zero values
          const parsedBalance = parseFloat(balance.balance) || 0
          console.log(`  🔢 Parsed balance: ${parsedBalance} (original: ${balance.balance})`)
          
          const result = {
            ...balance,
            balance: parsedBalance.toString()
          }
          
          console.log(`  📝 Final result object:`, result)
          
          walletResults.push(result)
          totalBalance += parsedBalance
          
          console.log(`  💰 Wallet ${i + 1} balance: ${parsedBalance} $FUNDED`)
          console.log(`  📈 Running total: ${totalBalance} $FUNDED`)
          
        } catch (err) {
          console.error(`  ❌ Error checking wallet ${walletAddress}:`, err)
          console.error(`  🔍 Error details:`, {
            message: err.message,
            stack: err.stack,
            wallet: walletAddress,
            index: i
          })
          
          const errorResult = {
            tokenAddress: TOKEN_ADDRESS,
            walletAddress: walletAddress.trim(),
            blockNumber: BLOCK_NUMBER,
            balance: '0',
            symbol: 'FUNDED',
            decimals: 18,
            rawBalance: '0',
            error: err.message
          }
          
          console.log(`  🚫 Adding error result:`, errorResult)
          walletResults.push(errorResult)
          // Don't add to total if there's an error
        }
        
        // Add a small delay between requests to avoid rate limiting
        if (i < validWallets.length - 1) {
          console.log(`  ⏸️  Waiting 1500ms before next wallet...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      }

      console.log(`\n🎯 Final results summary:`)
      console.log(`  📊 Total wallets processed: ${walletResults.length}`)
      console.log(`  💰 Total balance: ${totalBalance} $FUNDED`)
      console.log(`  📋 All results:`, walletResults)

      setResults({
        wallets: walletResults,
        totalBalance: totalBalance.toString(),
        totalWallets: validWallets.length
      })
      
      console.log(`✅ Results set successfully`)
      
    } catch (err) {
      console.error(`💥 Fatal error in handleSubmit:`, err)
      console.error(`🔍 Error details:`, {
        message: err.message,
        stack: err.stack
      })
      setError(err.message || 'Failed to fetch token balances')
    } finally {
      setIsLoading(false)
      console.log(`🏁 Loading state set to false`)
    }
  }

  const isFormValid = wallets.some(wallet => wallet.trim())

  // Calculate estimated $VIBE airdrop value
  const calculateVibeAirdrop = (fundedBalance) => {
    const balance = parseFloat(fundedBalance)
    const usdValue = balance * FUNDED_USD_VALUE
    return {
      fundedTokens: balance,
      usdValue: usdValue,
      vibeTokens: usdValue // 1:1 ratio for $VIBE airdrop
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Check Multiple $FUNDED Holdings & $VIBE Airdrop</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Users className="inline h-4 w-4 mr-2" />
              Wallet Addresses
            </label>
            
            {wallets.map((wallet, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => handleWalletChange(index, e.target.value)}
                  placeholder="0x..."
                  className="input-field flex-1"
                  required={index === 0}
                />
                {wallets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWallet(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove wallet"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addWallet}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Wallet
            </button>
            
            
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking {wallets.filter(w => w.trim()).length} Wallet{results?.totalWallets > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Calculate Total $VIBE Airdrop
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {/* Individual Wallet Results */}
          {results.wallets.map((result, index) => (
            <div key={index} className="card border-green-200 bg-green-50">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <h3 className="text-lg font-medium text-green-800">
                  Wallet {index + 1} - {result.error ? 'Error' : '$FUNDED Holdings Retrieved'}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">Wallet Address</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{result.walletAddress}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-600">$FUNDED Balance</p>
                  <p className="font-mono text-lg font-semibold text-green-600">
                    {parseFloat(result.balance).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {result.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              )}
            </div>
          ))}

          {/* Total $VIBE Airdrop Calculation */}
          <div className="card border-blue-200 bg-blue-50">
            <div className="flex items-center mb-6">
              <Gift className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-blue-800">Total Estimated $VIBE Airdrop</h3>
            </div>
            
            {(() => {
              const airdrop = calculateVibeAirdrop(results.totalBalance)
              return (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="text-center">
                      <p className="text-sm text-purple-100 mb-2">Total Estimated $VIBE Airdrop</p>
                      <p className="text-4xl font-bold text-white">
                        ${airdrop.vibeTokens.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-purple-100 mt-2">
                        Based on {results.totalWallets} wallet{results.totalWallets > 1 ? 's' : ''} • Total: {parseFloat(results.totalBalance).toLocaleString()} $FUNDED
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenBalanceChecker
