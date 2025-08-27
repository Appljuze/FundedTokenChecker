import { useState, useCallback } from 'react'

export const useMoralis = () => {
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to convert hex to string (browser compatible)
  const hexToString = (hex) => {
    if (!hex || hex === '0x') return ''
    try {
      return decodeURIComponent('%' + hex.slice(2).match(/.{1,2}/g).map(byte => byte).join('%'))
    } catch {
      // Fallback: remove null bytes and convert
      return hex.slice(2).replace(/00/g, '').replace(/(.{2})/g, '%$1')
        .split('%').slice(1).map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
    }
  }

  const getTokenBalanceAtBlock = useCallback(async (tokenAddress, walletAddress, blockNumber) => {
    console.log(`🔧 useMoralis: Starting balance check for wallet ${walletAddress}`)
    console.log(`🔧 useMoralis: Token: ${tokenAddress}, Block: ${blockNumber}`)
    
    setIsLoading(true)
    
    try {
      // Check if Moralis is available
      if (window.Moralis && window.Moralis.EvmApi) {
        console.log(`🔧 useMoralis: Using Moralis API...`)
        
        // Get token metadata using Moralis
        console.log(`🔧 useMoralis: Fetching token metadata...`)
        const tokenMetadata = await window.Moralis.EvmApi.token.getTokenMetadata({
          addresses: [tokenAddress],
          chain: '0x2105' // Base mainnet chain ID
        })

        console.log(`🔧 useMoralis: Token metadata response:`, tokenMetadata)
        const token = tokenMetadata.result[0]
        const symbol = token.symbol || 'TOKEN'
        const decimals = token.decimals || 18
        
        console.log(`🔧 useMoralis: Token symbol: ${symbol}, decimals: ${decimals}`)

        // Get token balance at specific block using Moralis
        console.log(`🔧 useMoralis: Fetching token balance...`)
        const balanceResponse = await window.Moralis.EvmApi.token.getTokenBalance({
          address: walletAddress,
          tokenAddress: tokenAddress,
          chain: '0x2105', // Base mainnet chain ID
          block: blockNumber.toString()
        })

        console.log(`🔧 useMoralis: Balance response:`, balanceResponse)
        const rawBalance = balanceResponse.result.balance
        const balance = (parseInt(rawBalance) / Math.pow(10, decimals)).toFixed(decimals)
        
        console.log(`🔧 useMoralis: Raw balance: ${rawBalance}, calculated balance: ${balance}`)

        const result = {
          tokenAddress,
          walletAddress,
          blockNumber: parseInt(blockNumber),
          balance,
          symbol,
          decimals,
          rawBalance
        }
        
        console.log(`🔧 useMoralis: Returning result:`, result)
        return result
        
      } else {
        console.log(`🔧 useMoralis: Moralis not available, using fallback RPC...`)
        return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
      }
    } catch (error) {
      console.error(`🔧 useMoralis: Error fetching token balance:`, error)
      console.error(`🔧 useMoralis: Error details:`, {
        message: error.message,
        stack: error.stack,
        wallet: walletAddress
      })
      
      // Fallback to direct RPC if Moralis fails
      try {
        console.log(`🔧 useMoralis: Falling back to direct RPC call...`)
        return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
      } catch (fallbackError) {
        console.error(`🔧 useMoralis: Fallback also failed:`, fallbackError)
        throw new Error(`Failed to fetch token balance: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
      console.log(`🔧 useMoralis: Loading state set to false`)
    }
  }, [])

  // Fallback method using direct RPC calls
  const getTokenBalanceFallback = async (tokenAddress, walletAddress, blockNumber) => {
    console.log(`🔧 Fallback: Starting RPC fallback for wallet ${walletAddress}`)
    
    // Multiple RPC endpoints for redundancy and speed
    const rpcEndpoints = [
      'https://mainnet.base.org',
      'https://base.blockpi.network/v1/rpc/public',
      'https://1rpc.io/base',
      'https://base.meowrpc.com'
    ]
    
    // Try each RPC endpoint until one succeeds
    for (let i = 0; i < rpcEndpoints.length; i++) {
      const rpcUrl = rpcEndpoints[i]
      console.log(`🔧 Fallback: Trying RPC endpoint ${i + 1}/${rpcEndpoints.length}: ${rpcUrl}`)
      
      try {
        // Get token decimals
        console.log(`🔧 Fallback: Fetching token decimals...`)
        const decimalsResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: tokenAddress,
              data: '0x313ce567' // decimals() function selector
            }, '0x' + parseInt(blockNumber).toString(16)],
            id: 1
          })
        })
        
        if (!decimalsResponse.ok) {
          console.log(`🔧 Fallback: RPC ${i + 1} failed with status ${decimalsResponse.status}`)
          continue
        }
        
        const decimalsData = await decimalsResponse.json()
        const decimals = parseInt(decimalsData.result, 16)
        console.log(`🔧 Fallback: Token decimals: ${decimals}`)

        // Get token symbol
        console.log(`🔧 Fallback: Fetching token symbol...`)
        const symbolResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: tokenAddress,
              data: '0x95d89b41' // symbol() function selector
            }, '0x' + parseInt(blockNumber).toString(16)],
            id: 1
          })
        })
        
        if (!symbolResponse.ok) {
          console.log(`🔧 Fallback: RPC ${i + 1} failed with status ${symbolResponse.status}`)
          continue
        }
        
        const symbolData = await symbolResponse.json()
        const symbol = symbolData.result ? 
          hexToString(symbolData.result) : 
          'TOKEN'
        console.log(`🔧 Fallback: Token symbol: ${symbol}`)

        // Get balance
        console.log(`🔧 Fallback: Fetching token balance...`)
        const balanceResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: tokenAddress,
              data: '0x70a08231' + '000000000000000000000000' + walletAddress.slice(2)
            }, '0x' + parseInt(blockNumber).toString(16)],
            id: 1
          })
        })
        
        if (!balanceResponse.ok) {
          console.log(`🔧 Fallback: RPC ${i + 1} failed with status ${balanceResponse.status}`)
          continue
        }
        
        const balanceData = await balanceResponse.json()
        const rawBalance = balanceData.result
        const balance = (parseInt(rawBalance, 16) / Math.pow(10, decimals)).toFixed(decimals)
        
        console.log(`🔧 Fallback: Raw balance: ${rawBalance}, calculated balance: ${balance}`)
        console.log(`🔧 Fallback: Successfully used RPC endpoint ${i + 1}`)

        const result = {
          tokenAddress,
          walletAddress,
          blockNumber: parseInt(blockNumber),
          balance,
          symbol,
          decimals,
          rawBalance
        }
        
        console.log(`🔧 Fallback: Returning result:`, result)
        return result
        
      } catch (error) {
        console.log(`🔧 Fallback: RPC ${i + 1} failed with error:`, error.message)
        if (i === rpcEndpoints.length - 1) {
          console.error(`🔧 Fallback: All RPC endpoints failed`)
          throw error
        }
        // Continue to next RPC endpoint
      }
    }
    
    throw new Error('All RPC endpoints failed')
  }

  return {
    getTokenBalanceAtBlock,
    isLoading
  }
}
