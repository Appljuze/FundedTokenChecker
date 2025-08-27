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
      if (window.MoralisEvmApi) {
        console.log(`🔧 useMoralis: Using Moralis EvmApi...`)
        
        try {
          // Get wallet token balances using the correct Moralis endpoint
          console.log(`🔧 useMoralis: Fetching wallet token balances with Moralis...`)
          const balanceResponse = await window.MoralisEvmApi.token.getWalletTokenBalances({
            address: walletAddress,
            chain: '0x2105', // Base mainnet chain ID
            tokenAddresses: [tokenAddress],
            toBlock: blockNumber
          })

          console.log(`🔧 useMoralis: Balance response:`, balanceResponse)
          console.log(`🔧 useMoralis: Response result:`, balanceResponse.result)
          console.log(`🔧 useMoralis: Full response object:`, JSON.stringify(balanceResponse, null, 2))
          
          // Handle both result array and jsonResponse array formats
          const resultArray = balanceResponse.result || balanceResponse.jsonResponse || []
          console.log(`🔧 useMoralis: Result array:`, resultArray)
          
          if (resultArray && resultArray.length > 0) {
            const tokenData = resultArray[0]
            console.log(`🔧 useMoralis: Token data object:`, tokenData)
            
            const rawBalance = tokenData.balance || tokenData.amount || '0'
            const decimals = parseInt(tokenData.decimals) || 18
            const symbol = tokenData.symbol || tokenData.token_symbol || 'FUNDED'
            const name = tokenData.name || tokenData.token_name
            const tokenAddress = tokenData.token_address
            
            console.log(`🔧 useMoralis: Extracted values:`, {
              rawBalance,
              decimals,
              symbol,
              name,
              tokenAddress
            })
            
            const balance = rawBalance !== '0' ? (parseInt(rawBalance) / Math.pow(10, decimals)).toFixed(decimals) : '0'
            
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
            
            console.log(`🔧 useMoralis: Successfully returning Moralis result:`, result)
            return result
          } else {
            console.log(`🔧 useMoralis: Empty result from Moralis - no tokens found for this address at this block`)
            console.log(`🔧 useMoralis: This could mean:`)
            console.log(`🔧 useMoralis: 1. Wallet has 0 balance of this token at block ${blockNumber}`)
            console.log(`🔧 useMoralis: 2. Token wasn't held at this specific historical block`)
            console.log(`🔧 useMoralis: 3. Moralis doesn't have data for this token/block combination`)
            console.log(`🔧 useMoralis: Falling back to RPC for direct blockchain query...`)
            return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
          }
          
        } catch (moralisError) {
          console.error(`🔧 useMoralis: Moralis API error:`, moralisError)
          console.error(`🔧 useMoralis: Error details:`, {
            message: moralisError.message,
            status: moralisError.status,
            code: moralisError.code
          })
          console.log(`🔧 useMoralis: Falling back to RPC due to Moralis error...`)
          return await getTokenBalanceFallback(tokenAddress, walletAddress, blockNumber)
        }
        
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
      
      // Fallback to direct RPC if everything fails
      try {
        console.log(`🔧 useMoralis: Final fallback to direct RPC call...`)
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
