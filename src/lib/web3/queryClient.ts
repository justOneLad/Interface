import { QueryClient } from '@tanstack/react-query'

/**
 * Centralized QueryClient configuration
 * Single instance shared across React Query, Wagmi, and TanStack Query
 * Provides consistent caching and state management
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})
