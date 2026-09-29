import type { City } from '../types/City.ts'
import { GEOCODING_URL } from '../utils/constants.ts'

interface GeocodingResult {
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

interface GeocodingResponse {
  results?: GeocodingResult[]
}

/** Geocoding API — resuelve un nombre de ciudad a coordenadas. */
export async function searchCities(name: string, count = 5): Promise<City[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=${count}&language=es&format=json`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Geocoding API respondió ${response.status}`)
  }

  const data = (await response.json()) as GeocodingResponse
  return (data.results ?? []).map(result => ({
    name: result.name,
    country: result.country ?? '',
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
  }))
}
