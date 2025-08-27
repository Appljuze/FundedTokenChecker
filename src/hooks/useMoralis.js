import { useState, useCallback } from 'react'

export const useMoralis = () => {
  const getTokenBalanceAtBlock = useCallback(async (tokenAddress, walletAddress, blockNumber) => {
    try {
      // Check if Moralis is available
      if (window.Moralis && window.Moralis.EvmApi) {
        console.log('Using Moralis API...')
        console.log('Available Moralis methods:', Object.keys(window.Moralis.EvmApi))
        console.log('Available token methods:', Object.keys(window.Moralis.EvmApi.token))
        
        // Get token metadata using Moralis v2
        const tokenMetadata = await window.Moralis.EvmApi.token.getTokenMetadata({
          addresses: [tokenAddress],
          chain: '0x2105' // Base mainnet chain ID
        })

        const token = tokenMetadata.result[0]
        const symbol = token.symbol || 'TOKEN'
        const decimals = token.decimals || 18

        // Get token balance at specific block using Moralis v2
        // In v2, we need to use getTokenBalances for a single token
        const balanceResponse = await window.Moralis.EvmApi.token.getTokenBalances({
          address: walletAddress,
          tokenAddresses: [tokenAddress],
          chain: '0x2105', // Base mainnet chain ID
          block: blockNumber.toString()
        })

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
