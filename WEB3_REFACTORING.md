# Web3 Refactoring Guide

## Overview

This refactoring consolidates fragmented wallet, Wagmi, and React Query implementations into a clean, centralized architecture.

## What Changed

### Before (Fragmented)
```
index.tsx:
  - QueryClientProvider (legacy react-query)
  - DynamicProvider
    - QueryClientProvider (wagmi's @tanstack/react-query)
    - WagmiProvider
    - DynamicWagmiConnector
```

**Issues:**
- Two separate QueryClient instances (memory duplication)
- Nested providers with unclear responsibilities
- Wagmi config isolated in DynamicConfig.tsx
- Legacy react-query version

### After (Unified)
```
index.tsx:
  - Web3Provider
    - QueryClientProvider (single, centralized)
    - DynamicContextProvider
    - WagmiProvider
    - DynamicWagmiConnector
```

**Benefits:**
- Single QueryClient instance (shared across all libraries)
- Clear provider hierarchy
- Centralized wagmi configuration
- Modern @tanstack/react-query v5+
- Clean exports from `/lib/web3`

## Migration Guide

### 1. Update Imports

**Old way (scattered):**
```typescript
import { DynamicProvider } from './connection/DynamicConfig'
import { useWeb3React } from '@web3-react/core'
import { usePublicClient } from 'wagmi'
import { useQuery } from 'react-query'
```

**New way (centralized):**
```typescript
import { Web3Provider, useWeb3React } from 'lib/web3'
import { usePublicClient, useAccount, useChainId } from 'lib/web3'
import { useQuery } from '@tanstack/react-query'
```

### 2. Update Component Integration

**Old way:**
```typescript
export function MyComponent() {
  const { account, chainId } = useWeb3React()
  return <>{account}</>
}
```

**New way (preferred):**
```typescript
export function MyComponent() {
  const { address } = useAccount()
  const chainId = useChainId()
  return <>{address}</>
}
```

**Note:** `useWeb3React()` still works for backward compatibility, but individual hooks are recommended for new code.

### 3. Remove Old Imports

- Delete imports from `@web3-react/core`, `@web3-react/metamask`, etc.
- Delete imports from `./connection/DynamicConfig`
- Update `react-query` imports to `@tanstack/react-query`

### 4. Update Entry Point

**Old way (index.tsx):**
```typescript
import { DynamicProvider } from './connection/DynamicConfig'
const queryClient = new QueryClient()

createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <DynamicProvider>
      {/* app */}
    </DynamicProvider>
  </QueryClientProvider>
)
```

**New way (index.tsx):**
```typescript
import { Web3Provider } from 'lib/web3'

createRoot(container).render(
  <Web3Provider>
    {/* app */}
  </Web3Provider>
)
```

## API Reference

### From `lib/web3`

#### Configuration
- `wagmiConfig` - Wagmi config object (mainnet, goerli, sepolia)
- `queryClient` - Centralized React Query client

#### Provider
- `Web3Provider` - Unified provider wrapping all web3 functionality

#### Hooks (New - Recommended)
- `useAccount()` - Account info (address, status)
- `useChainId()` - Current chain ID
- `usePublicClient()` - Viem public client for read operations
- `useWalletClient()` - Viem wallet client for write operations
- `useSwitchChain()` - Switch blockchain
- `useDynamicContext()` - Dynamic Labs wallet context
- `useUserUpdateRequest()` - Dynamic user profile updates

#### Hooks (Legacy - For Migration)
- `useWeb3React()` - Backward compatibility (use individual hooks instead)

## Testing Updates

### Old way
```typescript
import { DynamicProvider } from 'connection/DynamicConfig'

render(
  <DynamicProvider>
    <MyComponent />
  </DynamicProvider>
)
```

### New way
```typescript
import { Web3Provider } from 'lib/web3'

render(
  <Web3Provider>
    <MyComponent />
  </Web3Provider>
)
```

## Deprecations

The following are marked for future removal:

- `src/connection/DynamicConfig.tsx` - Replaced by `lib/web3/provider.tsx`
- `src/hooks/useWeb3ReactCompat.ts` - Replaced by `lib/web3/compat.ts`
- Direct imports from `@web3-react/*` - Use wagmi hooks instead

## Performance Improvements

1. **Single QueryClient** - Reduced memory footprint, shared caching
2. **Optimized Defaults:**
   - staleTime: 5 minutes
   - gcTime: 10 minutes
   - retry: 1 (reduced network requests)
   - refetchOnWindowFocus: false (improved UX)

3. **Wagmi v3** - Latest features and bug fixes

## Troubleshooting

### "Cannot find module 'lib/web3'"
Make sure you're running from the project root and dependencies are installed:
```bash
yarn install
```

### "useWeb3React is not defined"
Use individual hooks instead:
```typescript
// ❌ Old way
const { account, chainId } = useWeb3React()

// ✅ New way
const { address } = useAccount()
const chainId = useChainId()
```

### "QueryClient conflicts"
If you see duplicate caching behavior, ensure you're only using the exported `queryClient` from `lib/web3`, not creating new instances.

## Next Steps

1. Update all imports to use `lib/web3`
2. Replace `useWeb3React()` calls with individual wagmi hooks
3. Remove old `DynamicProvider` usage
4. Delete legacy web3-react imports
5. Test wallet connection flow
6. Verify React Query is working correctly with network requests
