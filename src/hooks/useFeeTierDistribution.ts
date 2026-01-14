import { Currency } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

// TheGraph subgraph removed - stub implementation

interface FeeTierDistribution {
  isLoading: boolean
  isError: boolean
  largestUsageFeeTier?: FeeAmount

  // distributions as percentages of overall liquidity
  distributions?: Record<FeeAmount, number | undefined>
}

export function useFeeTierDistribution(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): FeeTierDistribution {
  // Return undefined distributions - no TheGraph data available
  return {
    isLoading: false,
    isError: false,
    distributions: undefined,
    largestUsageFeeTier: undefined,
  }
}
