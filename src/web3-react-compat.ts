/**
 * Compatibility shim for @web3-react/core
 * This file replaces the web3-react library with Dynamic + Wagmi equivalents
 * to enable gradual migration without modifying 136+ files at once.
 */

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { usePublicClient, useWalletClient } from 'wagmi'
import { useMemo } from 'react'
import type { providers } from 'ethers'

// Export the compatibility hook as the default export that @web3-react/core would have
export function useWeb3React(): {
  account: string | undefined
  chainId: number | undefined
  provider: any
  connector: any
  isActive: boolean
  isActivating: boolean
  ENSName?: string
  ENSNames?: string[]
  hooks?: any
} {
  const { primaryWallet } = useDynamicContext()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return useMemo(() => {
    // Convert wagmi publicClient to ethers-compatible provider for backward compatibility
    const provider = publicClient ? createEthersProvider(publicClient) : undefined

    return {
      account: primaryWallet?.address,
      chainId: primaryWallet?.connector?.connectedChain as number | undefined,
      provider,
      connector: primaryWallet?.connector,
      isActive: !!primaryWallet,
      isActivating: false,
      ENSName: undefined,
      ENSNames: [],
      hooks: {},
    }
  }, [primaryWallet, publicClient, walletClient])
}

// Create a minimal ethers-like provider from wagmi publicClient
function createEthersProvider(publicClient: any): Partial<providers.Provider> {
  return {
    getBlockNumber: () => publicClient.getBlockNumber().then((n: bigint) => Number(n)),
    getBlock: (blockHashOrBlockTag: any) => publicClient.getBlock({ blockNumber: blockHashOrBlockTag }),
    getTransaction: (hash: string) => publicClient.getTransaction({ hash }),
    getTransactionReceipt: (hash: string) => publicClient.getTransactionReceipt({ hash }),
    getLogs: (filter: any) => publicClient.getLogs(filter),
    getCode: (address: string) => publicClient.getBytecode({ address }),
    getBalance: (address: string) => publicClient.getBalance({ address }),
    call: (transaction: any) => publicClient.call(transaction),
    estimateGas: (transaction: any) => publicClient.estimateGas(transaction),
    getNetwork: async () => ({ chainId: publicClient.chain?.id ?? 1, name: publicClient.chain?.name ?? 'mainnet' }),
    on: () => {}, // Stub for event listeners
    once: () => {},
    off: () => {},
    removeListener: () => {},
    removeAllListeners: () => {},
  } as any
}

// Re-export as Web3ReactHooks type
export type Web3ReactHooks = ReturnType<typeof useWeb3React>

// Export empty connectors array for compatibility
export const connectors: any[] = []

// Export stub for initializeConnector (used by connection/index.ts)
export function initializeConnector<T>(
  f: (actions: any) => T,
  allowedChainIds?: number[]
): [T, Web3ReactHooks] {
  // Return a stub connector and hooks
  const connector = f({} as any)
  const hooks = {
    useAccount: () => undefined,
    useChainId: () => undefined,
    useIsActivating: () => false,
    useIsActive: () => false,
    useProvider: () => undefined,
    useENSNames: () => undefined,
  } as any

  return [connector, hooks]
}

// Export Web3ReactProvider stub (not used since we removed it, but needed for type compatibility)
export function Web3ReactProvider({ children }: { children: any }) {
  return children
}
