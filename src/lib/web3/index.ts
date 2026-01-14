/**
 * Web3 Library Index
 * 
 * Central export point for all web3-related utilities, hooks, and providers
 * This replaces fragmented imports from multiple locations
 */

// Configuration
export { wagmiConfig } from './config'
export { queryClient } from './queryClient'

// Provider and hooks
export { Web3Provider, useWalletConnection, useDynamicContext, useUserUpdateRequest } from './provider'
export {
  usePublicClient,
  useWalletClient,
  useAccount,
  useChainId,
  useSwitchChain,
} from './provider'

// Utilities
export { useWeb3React } from './compat' // For legacy code migration
