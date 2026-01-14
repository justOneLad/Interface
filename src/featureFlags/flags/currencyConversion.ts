import { BaseVariant, FeatureFlag, useBaseFlag } from '../index'

export function useCurrencyConversionFlag(): BaseVariant {
  return useBaseFlag(FeatureFlag.currencyConversion)
}

export function useCurrencyConversionFlagEnabled(): boolean {
  // Currency conversion disabled - always use USDC pricing
  return false
}
