import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { mainnet, goerli } from 'viem/chains'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [mainnet, goerli],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
  },
})

// Create a separate QueryClient for Wagmi (required by wagmi v2+)
const wagmiQueryClient = new QueryClient()

export function DynamicProvider({ children }: { children: ReactNode }) {
  const environmentId = process.env.REACT_APP_DYNAMIC_ENVIRONMENT_ID || 'b49d23e4-b607-4c39-900a-cfd81d6a6d93'

  // If Dynamic is disabled or environment ID is not set, just render children
  if (!environmentId || environmentId === 'disabled') {
    return <>{children}</>
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <QueryClientProvider client={wagmiQueryClient}>
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </WagmiProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  )
}
