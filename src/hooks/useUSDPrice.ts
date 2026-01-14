import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useMemo } from 'react'

import useStablecoinPrice from './useStablecoinPrice'

/**
 * Returns the price in USDC (not fiat USD) via simulated swap
 * Note: Despite the function name, this returns USDC value from on-chain pricing, not external fiat price feeds
 */
export function useUSDPrice(
  currencyAmount?: CurrencyAmount<Currency>,
  prefetchCurrency?: Currency
): {
  data?: number
  isLoading: boolean
} {
  const currency = currencyAmount?.currency ?? prefetchCurrency

  // Use USDC-based pricing via simulated swaps (no external price feeds)
  const stablecoinPrice = useStablecoinPrice(currency)

  return useMemo(() => {
    if (!currencyAmount) {
      return { data: undefined, isLoading: false }
    } else if (stablecoinPrice) {
      return { data: parseFloat(stablecoinPrice.quote(currencyAmount).toSignificant()), isLoading: false }
    } else {
      return { data: undefined, isLoading: false }
    }
  }, [currencyAmount, stablecoinPrice])
}
