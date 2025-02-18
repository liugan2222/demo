import useSWR from "swr"
import { getCountries, getUoms } from "@/lib/api"

// Cache durations
const CACHE_DURATION = 120 * 60 * 1000 // 5 minutes

export function useCountries(shouldFetch: boolean) {
  return useSWR(
    shouldFetch ? "countries" : null, 
    getCountries,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION
    }
  )
}

export function useCurrencies(shouldFetch: boolean) {
  return useSWR(
  shouldFetch ? "currencies" : null, 
  () => getUoms('CURRENCY_MEASURE'), 
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: CACHE_DURATION
  })
}

export function usePackageType(shouldFetch: boolean) {
  return useSWR(
  shouldFetch ? "packageType" : null, 
  () => getUoms('PACKAGE_TYPE_MEASURE'), 
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: CACHE_DURATION
  })
}

export function useWeightUom(shouldFetch: boolean) {
  return useSWR(
  shouldFetch ? "weightUom" : null, 
  () => getUoms('WEIGHT_MEASURE'), 
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: CACHE_DURATION
  })
}
