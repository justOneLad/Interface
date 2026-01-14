# Web3 Integration Quick Start

## Using the New Web3 System

### 1. Access Wallet Information

```typescript
import { useAccount } from 'lib/web3'

export function MyComponent() {
  const { address, isConnected, chainId } = useAccount()
  
  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  )
}
```

### 2. Read Contract Data

```typescript
import { usePublicClient } from 'lib/web3'
import { useQuery } from '@tanstack/react-query'

export function TokenBalance() {
  const { data: publicClient } = usePublicClient()
  
  const { data: balance } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!publicClient) return null
      // Use publicClient for read operations
      return publicClient.getBalance()
    },
  })
  
  return <div>Balance: {balance?.toString()}</div>
}
```

### 3. Send Transactions

```typescript
import { useWalletClient } from 'lib/web3'
import { useMutation } from '@tanstack/react-query'

export function SendTransaction() {
  const { data: walletClient } = useWalletClient()
  
  const mutation = useMutation({
    mutationFn: async () => {
      if (!walletClient) throw new Error('Wallet not connected')
      return walletClient.sendTransaction({
        to: '0x...',
        value: 1000000000000000000n, // 1 ETH
      })
    },
  })
  
  return (
    <button onClick={() => mutation.mutate()}>
      Send Transaction
    </button>
  )
}
```

### 4. Switch Chains

```typescript
import { useSwitchChain } from 'lib/web3'

export function ChainSwitcher() {
  const { switchChain } = useSwitchChain()
  
  return (
    <button onClick={() => switchChain?.({ chainId: 5 })}>
      Switch to Goerli
    </button>
  )
}
```

### 5. Access Dynamic Context

```typescript
import { useDynamicContext } from 'lib/web3'

export function WalletInfo() {
  const { primaryWallet, user } = useDynamicContext()
  
  return (
    <div>
      <p>Wallet: {primaryWallet?.connector?.name}</p>
      <p>User: {user?.userId}</p>
    </div>
  )
}
```

## Common Patterns

### Authenticated Queries

```typescript
import { useAccount } from 'lib/web3'
import { useQuery } from '@tanstack/react-query'

export function UserData() {
  const { address, isConnected } = useAccount()
  
  const { data: userData } = useQuery({
    queryKey: ['user', address],
    queryFn: () => fetch(`/api/user/${address}`).then(r => r.json()),
    enabled: isConnected, // Only run if connected
  })
  
  return <div>{userData?.name}</div>
}
```

### Error Handling

```typescript
import { usePublicClient } from 'lib/web3'

export function SafeRead() {
  const { data: client, isError, isPending } = usePublicClient()
  
  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error connecting</div>
  
  return <div>Ready</div>
}
```

### Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletClient } from 'lib/web3'

export function OptimisticUpdate() {
  const queryClient = useQueryClient()
  const { data: walletClient } = useWalletClient()
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Make transaction
      return walletClient?.sendTransaction({...})
    },
    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries()
      
      // Optimistically update cache
      const previousData = queryClient.getQueryData(['data'])
      queryClient.setQueryData(['data'], newData)
      
      return { previousData }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['data'], context?.previousData)
    },
    onSuccess: () => {
      // Refetch on success
      queryClient.invalidateQueries({ queryKey: ['data'] })
    },
  })
  
  return <button onClick={() => mutation.mutate({...})}>Update</button>
}
```

## Wagmi v3 Chains

Configured chains in `lib/web3/config.ts`:
- Mainnet (1)
- Goerli (5)
- Sepolia (11155111)

To add more chains:

```typescript
// src/lib/web3/config.ts
import { polygon, optimism } from 'viem/chains'

export const wagmiConfig = createConfig({
  chains: [mainnet, goerli, sepolia, polygon, optimism],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    // ...
  },
})
```

## React Query Configuration

Defaults (configured in `queryClient.ts`):

```typescript
{
  staleTime: 1000 * 60 * 5,        // 5 minutes
  gcTime: 1000 * 60 * 10,          // 10 minutes
  retry: 1,                         // One retry on failure
  refetchOnWindowFocus: false,      // Don't refetch on window focus
  refetchOnReconnect: true,         // Refetch when reconnecting
}
```

Override per query:

```typescript
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 30 * 1000,  // 30 seconds instead of default
  gcTime: 2 * 60 * 1000, // 2 minutes
})
```

## Debugging

### Enable React Query DevTools

```typescript
// Add to main App component
import { DevtoolsButtonFixture } from '@tanstack/react-query-devtools'

export function App() {
  return (
    <>
      <YourApp />
      <DevtoolsButtonFixture />
    </>
  )
}
```

### Check Wagmi State

```typescript
import { useConfig } from 'wagmi'

export function Debug() {
  const config = useConfig()
  
  console.log('Wagmi config:', config)
  console.log('Current state:', config.state.current)
  
  return <div>Check console</div>
}
```

### Check React Query

```typescript
import { useQueryClient } from '@tanstack/react-query'

export function DebugQueries() {
  const queryClient = useQueryClient()
  
  console.log('Cache:', queryClient.getQueryCache().getAll())
  
  return <div>Check console</div>
}
```

## TypeScript Types

```typescript
import type {
  Account,
  Chain,
  Client,
  PublicClient,
  WalletClient,
  Transport,
} from 'viem'

// Wagmi types
import type {
  UseAccountReturnType,
  UsePublicClientReturnType,
  UseWalletClientReturnType,
} from 'wagmi'

// Dynamic types
import type { PrimaryWallet, UserProfile } from '@dynamic-labs/sdk-react-core'

// React Query types
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
```

## Performance Tips

1. **Use `enabled` for conditional queries:**
   ```typescript
   useQuery({
     queryFn: fetchData,
     enabled: isConnected, // Only run if condition is true
   })
   ```

2. **Set appropriate `staleTime`:**
   - Static data: High staleTime (30+ minutes)
   - User data: Medium staleTime (5 minutes)
   - Real-time data: Low staleTime (10-30 seconds)

3. **Use `queryKey` efficiently:**
   ```typescript
   // Good: Includes all dependencies
   useQuery({
     queryKey: ['user', address, chainId],
     queryFn: () => fetchUser(address, chainId),
   })
   ```

4. **Batch mutations:**
   ```typescript
   const mutation = useMutation({
     mutationFn: ([tx1, tx2]) => Promise.all([
       walletClient.sendTransaction(tx1),
       walletClient.sendTransaction(tx2),
     ]),
   })
   ```

## Resources

- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [React Query Documentation](https://tanstack.com/query)
- [Dynamic Labs Docs](https://docs.dynamic.xyz)

## Getting Help

1. Check error messages and DevTools
2. Review `/WEB3_REFACTORING.md` for migration help
3. Check inline comments in `/src/lib/web3`
4. Review this quick start guide
