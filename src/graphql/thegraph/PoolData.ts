// TheGraph subgraph removed - stub file

export interface Token {
  id: string
  symbol: string
  name: string
  decimals: string
  derivedETH: string
}

export interface Pool {
  id: string
  feeTier: string
  liquidity: string
  sqrtPrice: string
  tick: string
  token0: Token
  token1: Token
  token0Price: string
  token1Price: string
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  txCount: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLockedUSD: string
}

export interface PoolData {
  address: string
  feeTier: number
  token0: Token
  token1: Token
  liquidity: number
  sqrtPrice: number
  tick: number
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  tvlUSD: number
  tvlUSDChange: number
  tvlToken0: number
  tvlToken1: number
  token0Price: number
  token1Price: number
}

export function usePoolDataQuery() {
  return {
    loading: false,
    error: undefined,
    data: undefined,
  }
}

export function usePoolData(poolAddress: string, chainId: number | undefined) {
  return {
    loading: false,
    error: undefined,
    data: undefined as PoolData | undefined,
  }
}
