import { DynamicContextProvider, DynamicUserProfile } from '@dynamic-labs/sdk-react-core'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ReactNode } from 'react'
import { wagmiConfig } from './config'
import { queryClient } from './queryClient'

interface Web3ProviderProps {
  children: ReactNode
}

/**
 * Unified Web3 Provider
 * 
 * This replaces the fragmented DynamicProvider and consolidates:
 * - Wagmi configuration for chain interactions
 * - Dynamic Labs for wallet connection and authentication
 * - React Query for data fetching and caching
 * 
 * Structure (top to bottom):
 * 1. QueryClientProvider - Provides React Query client to all hooks
 * 2. DynamicContextProvider - Manages wallet authentication and user session
 * 3. WagmiProvider - Provides wagmi hooks for contract interactions
 * 4. DynamicWagmiConnector - Bridges Dynamic wallet selection with Wagmi
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  const environmentId = process.env.REACT_APP_DYNAMIC_ENVIRONMENT_ID

  // If Dynamic is disabled or environment ID is not set, render minimal setup
  if (!environmentId || environmentId === 'disabled') {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId,
          walletConnectors: [EthereumWalletConnectors],
          // Enable all wallet features
          walletConnectorExtensions: [],
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </QueryClientProvider>
  )
}

/**
 * Hook to access wallet account information
 * Replaces useWeb3React() from web3-react
 */
export function useWalletConnection() {
  const { primaryWallet } = useDynamicContext()
  
  return {
    account: primaryWallet?.address,
    isConnected: !!primaryWallet?.address,
    wallet: primaryWallet,
  }
}

// Re-export commonly used wagmi hooks for convenience
export { usePublicClient, useWalletClient, useAccount, useChainId, useSwitchChain } from 'wagmi'
export { useDynamicContext, useUserUpdateRequest } from '@dynamic-labs/sdk-react-core'

// Note: Import useDynamicContext here to enable useWalletConnection hook
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
