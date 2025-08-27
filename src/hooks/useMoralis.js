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
    setIsLoading(true)
    
    try {
      // Check if Moralis is available
      if (window.Moralis && window.Moralis.EvmApi) {
        console.log('Using Moralis API...')
        
        // Get token metadata using Moralis
        const tokenMetadata = await window.Moralis.EvmApi.token.getTokenMetadata({
          addresses: [tokenAddress],
          chain: '0x2105' // Base mainnet chain ID
        })

        const token = tokenMetadata.result[0]
        const symbol = token.symbol || 'TOKEN'
        const decimals = token.decimals || 18

        // Get token balance at specific block using Moralis
        const balanceResponse = await window.Moralis.EvmApi.token.getTokenBalance({
          address: walletAddress,
          tokenAddress: tokenAddress,
          chain: '0x2105', // Base mainnet chain ID
          block: blockNumber.toString()
        })

        const rawBalance = balanceResponse.result.balance
        const balance = (parseInt(rawBalance) / Math.pow(10, decimals)).toFixed(decimals)

        return {
          tokenAddress,
          walletAddress,
          blockNumber: parseInt(blockNumber),
          balance,
          symbol,
          decimals,
          rawBalance
        }
      } else {
        console.log('Moralis not available, using fallback RPC...')
        return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
      
      // Fallback to direct RPC if Moralis fails
      try {
        console.log('Falling back to direct RPC call...')
        return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        throw new Error(`Failed to fetch token balance: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fallback method using direct RPC calls
  const getTokenBalanceFallback = async (tokenAddress, walletAddress, blockNumber) => {
    const rpcUrl = 'https://mainnet.base.org'
    
    // Get token decimals
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
    const decimalsData = await decimalsResponse.json()
    const decimals = parseInt(decimalsData.result, 16)

    // Get token symbol
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
    const symbolData = await symbolResponse.json()
    const symbol = symbolData.result ? 
      hexToString(symbolData.result) : 
      'TOKEN'

    // Get balance
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
    const balanceData = await balanceResponse.json()
    const rawBalance = balanceData.result
    const balance = (parseInt(rawBalance, 16) / Math.pow(10, decimals)).toFixed(decimals)

    return {
      tokenAddress,
      walletAddress,
      blockNumber: parseInt(blockNumber),
      balance,
      symbol,
      decimals,
      rawBalance
    }
  }

  return {
    getTokenBalanceAtBlock,
    isLoading
  }
}
