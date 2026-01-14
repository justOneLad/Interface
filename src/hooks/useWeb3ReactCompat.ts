import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { usePublicClient } from 'wagmi'
import { useMemo } from 'react'

/**
 * Compatibility hook to replace useWeb3React from @web3-react/core
 * This provides a migration path from web3-react to Dynamic + Wagmi
 */
export function useWeb3React() {
  const { primaryWallet } = useDynamicContext()
  const publicClient = usePublicClient()

  return useMemo(() => ({
    account: primaryWallet?.address ?? undefined,
    chainId: (primaryWallet?.connector?.connectedChain as unknown as number) ?? undefined,
    provider: publicClient as any, // Wagmi's publicClient acts as provider for read operations
    connector: primaryWallet?.connector as any,
    isActive: !!primaryWallet,
    isActivating: false,
    ENSName: undefined,
    ENSNames: [],
    hooks: {} as any,
  }), [primaryWallet, publicClient])
}
