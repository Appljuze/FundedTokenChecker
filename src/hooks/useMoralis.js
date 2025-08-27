import { useState, useCallback } from 'react'

export const useMoralis = () => {
  const getTokenBalanceAtBlock = useCallback(async (tokenAddress, walletAddress, blockNumber) => {
    try {
      // Debug logging to see what values we're receiving
      console.log('getTokenBalanceAtBlock called with:')
      console.log('- tokenAddress:', tokenAddress)
      console.log('- walletAddress:', walletAddress)
      console.log('- blockNumber:', blockNumber)
      console.log('- tokenAddress type:', typeof tokenAddress)
      
      // Validate inputs
      if (!tokenAddress || !walletAddress || !blockNumber) {
        throw new Error(`Invalid parameters: tokenAddress=${tokenAddress}, walletAddress=${walletAddress}, blockNumber=${blockNumber}`)
      }
      
      // Check if Moralis is available
      if (window.Moralis && window.Moralis.EvmApi) {
        console.log('Using Moralis API...')
        console.log('Full Moralis object:', window.Moralis)
        console.log('Available Moralis methods:', Object.keys(window.Moralis.EvmApi))
        console.log('Available token methods:', Object.keys(window.Moralis.EvmApi.token))
        console.log('Token methods details:', window.Moralis.EvmApi.token)
        
        // Get token metadata using Moralis v2
        const tokenMetadata = await window.Moralis.EvmApi.token.getTokenMetadata({
          addresses: [tokenAddress],
          chain: '0x2105' // Base mainnet chain ID
        })

        const token = tokenMetadata.result[0]
        const symbol = token.symbol || 'TOKEN'
        const decimals = token.decimals || 18

        // Try to find the correct method for getting token balances
        let balanceResponse
        const tokenMethods = Object.keys(window.Moralis.EvmApi.token)
        
        if (tokenMethods.includes('getTokenBalances')) {
          balanceResponse = await window.Moralis.EvmApi.token.getTokenBalances({
            address: walletAddress,
            tokenAddresses: [tokenAddress],
            chain: '0x2105',
            toBlock: blockNumber.toString()
          })
        } else if (tokenMethods.includes('getWalletTokenBalances')) {
          balanceResponse = await window.Moralis.EvmApi.token.getWalletTokenBalances({
            address: walletAddress,
            chain: '0x2105',
            toBlock: blockNumber.toString()
          })
          // Filter for our specific token
          const ourToken = balanceResponse.result.find(t => t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())
          if (ourToken) {
            balanceResponse = { result: [ourToken] }
          } else {
            balanceResponse = { result: [{ balance: '0' }] }
          }
        } else if (tokenMethods.includes('getTokenPrice')) {
          // Fallback: try to get balance using a different approach
          console.log('Trying alternative method...')
          // For now, let's use a direct RPC call as fallback
          throw new Error('Moralis token balance methods not available. Please check API configuration.')
        } else {
          console.error('Available token methods:', tokenMethods)
          throw new Error(`No suitable balance method found. Available methods: ${tokenMethods.join(', ')}`)
        }

        // Extract the balance from the response
        const tokenBalance = balanceResponse.result[0]
        if (!tokenBalance) {
          throw new Error('No balance data returned for this token')
        }

        const rawBalance = tokenBalance.balance || '0'
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
        // Check what's available for debugging
        console.error('Moralis availability check failed:')
        console.error('- window.Moralis exists:', !!window.Moralis)
        console.error('- window.Moralis.EvmApi exists:', !!(window.Moralis && window.Moralis.EvmApi))
        console.error('- window.Moralis object:', window.Moralis)
        
        throw new Error('Moralis SDK not available. Please ensure Moralis is properly initialized and refresh the page.')
      }
    } catch (error) {
      console.error('Error fetching token balance with Moralis:', error)
      throw new Error(`Failed to fetch token balance: ${error.message}`)
    }
  }, [])

  return {
    getTokenBalanceAtBlock
  }
}
