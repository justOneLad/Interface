import { ChainId } from '@uniswap/sdk-core'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { DEPRECATED_RPC_PROVIDERS, RPC_PROVIDERS } from 'constants/providers'
import { useFallbackProviderEnabled } from 'featureFlags/flags/fallbackProvider'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePublicClient } from 'wagmi'

const MISSING_PROVIDER = Symbol()
const BlockNumberContext = createContext<
  | {
      fastForward(block: number): void
      block?: number
      mainnetBlock?: number
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)

function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext)
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }
  return blockNumber
}

export function useFastForwardBlockNumber(): (block: number) => void {
  return useBlockNumberContext().fastForward
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockNumberContext().block
}

export function useMainnetBlockNumber(): number | undefined {
  return useBlockNumberContext().mainnetBlock
}

export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const { primaryWallet } = useDynamicContext()
  const activeChainId = primaryWallet?.connector?.connectedChain as ChainId | undefined
  const publicClient = usePublicClient()

  const [{ chainId, block, mainnetBlock }, setChainBlock] = useState<{
    chainId?: number
    block?: number
    mainnetBlock?: number
  }>({})
  const activeBlock = chainId === activeChainId ? block : undefined

  const onChainBlock = useCallback((chainId: number, block: number) => {
    setChainBlock((chainBlock) => {
      if (chainBlock.chainId === chainId) {
        if (!chainBlock.block || chainBlock.block < block) {
          return { chainId, block, mainnetBlock: chainId === ChainId.MAINNET ? block : chainBlock.mainnetBlock }
        }
      } else if (chainId === ChainId.MAINNET) {
        if (!chainBlock.mainnetBlock || chainBlock.mainnetBlock < block) {
          return { ...chainBlock, mainnetBlock: block }
        }
      }
      return chainBlock
    })
  }, [])

  const windowVisible = useIsWindowVisible()
  useEffect(() => {
    let stale = false

    if (publicClient && activeChainId && windowVisible) {
      setChainBlock((chainBlock) => {
        // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
        if (chainBlock.chainId !== activeChainId) {
          return { chainId: activeChainId, mainnetBlock: chainBlock.mainnetBlock }
        }
        return chainBlock
      })

      if ('getBlockNumber' in publicClient) {
        (publicClient.getBlockNumber as any)()
          .then((block: any) => {
            if (!stale) onChainBlock(activeChainId, Number(block))
          })
          .catch((error: any) => {
            console.error(`Failed to get block number for chainId ${activeChainId}`, error)
          })
      }

      const unwatch = 'watchBlockNumber' in publicClient ? (publicClient.watchBlockNumber as any)({
        onBlockNumber: (block: any) => onChainBlock(activeChainId, Number(block)),
      }) : () => {}

      return () => {
        stale = true
        unwatch()
      }
    }

    return void 0
  }, [activeChainId, publicClient, windowVisible, onChainBlock])

  const networkProviders = useFallbackProviderEnabled() ? RPC_PROVIDERS : DEPRECATED_RPC_PROVIDERS

  useEffect(() => {
    if (mainnetBlock === undefined) {
      networkProviders[ChainId.MAINNET]
        .getBlockNumber()
        .then((block) => {
          onChainBlock(ChainId.MAINNET, block)
        })
        // swallow errors - it's ok if this fails, as we'll try again if we activate mainnet
        .catch(() => undefined)
    }
  }, [mainnetBlock, networkProviders, onChainBlock])

  const value = useMemo(
    () => ({
      fastForward: (update: number) => {
        if (activeBlock && update > activeBlock) {
          setChainBlock({
            chainId: activeChainId,
            block: update,
            mainnetBlock: activeChainId === ChainId.MAINNET ? update : mainnetBlock,
          })
        }
      },
      block: activeBlock,
      mainnetBlock,
    }),
    [activeBlock, activeChainId, mainnetBlock]
  )
  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
