import { Currency } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'

// TheGraph subgraph removed - stub implementation

const PRICE_FIXED_DIGITS = 8

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number
  liquidityActive: JSBI
  liquidityNet: JSBI
  price0: string
}

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): {
  isLoading: boolean
  error: any
  activeTick?: number
  data?: TickProcessed[]
} {
  // Return loading state - no TheGraph data available
  return {
    isLoading: false,
    error: undefined,
    activeTick: undefined,
    data: undefined,
  }
}
