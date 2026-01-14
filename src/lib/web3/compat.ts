import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { usePublicClient, useChainId, useAccount } from 'wagmi'
import { useMemo } from 'react'

/**
 * Compatibility hook for legacy code using useWeb3React
 * 
 * Gradually migrate code to use individual wagmi hooks instead:
 * - useAccount() - for account info
 * - useChainId() - for chain ID
 * - usePublicClient() - for provider/client
 * - useDynamicContext() - for wallet management
 * 
 * This is provided for backward compatibility during migration,
 * but individual hooks are preferred for new code
 * 
 * @deprecated Use useAccount, useChainId, usePublicClient, useDynamicContext directly
 */
export function useWeb3React() {
  const { primaryWallet } = useDynamicContext()
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()

  return useMemo(() => ({
    account: address,
    chainId,
    provider: publicClient,
    connector: primaryWallet?.connector,
    isActive: !!primaryWallet,
    isActivating: false,
    ENSName: undefined,
    ENSNames: [],
    hooks: {} as any,
  }), [address, chainId, publicClient, primaryWallet])
}
