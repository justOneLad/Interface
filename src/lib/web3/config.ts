import { http } from 'viem'
import { createConfig } from 'wagmi'
import { mainnet, goerli, sepolia } from 'viem/chains'

/**
 * Centralized Wagmi configuration
 * This is the single source of truth for chain and transport configuration
 */
export const wagmiConfig = createConfig({
  chains: [mainnet, goerli, sepolia],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false, // Disable server-side rendering as this is a client-side app
})
