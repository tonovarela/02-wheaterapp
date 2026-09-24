import type { City, CurrentWeather, Unit } from './types.ts'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

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

interface ForecastResponse {
  current?: {
    time?: string
    temperature_2m?: number
    apparent_temperature?: number
    relative_humidity_2m?: number
    wind_speed_10m?: number
    weather_code?: number
    is_day?: number
  }
}

/** Paso 1: Geocoding API — resuelve un nombre de ciudad a coordenadas. */
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

/** Paso 2: Forecast API — clima actual para unas coordenadas. */
export async function getCurrentWeather(city: City, unit: Unit): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  })
  if (unit === 'F') {
    params.set('temperature_unit', 'fahrenheit')
    params.set('wind_speed_unit', 'mph')
  }

  const response = await fetch(`${FORECAST_URL}?${params}`)
  if (!response.ok) {
    throw new Error(`Forecast API respondió ${response.status}`)
  }

  const data = (await response.json()) as ForecastResponse
  const current = data.current
  if (!current || current.temperature_2m === undefined) {
    throw new Error('La respuesta del clima no incluye datos actuales')
  }

  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature ?? current.temperature_2m,
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    weatherCode: current.weather_code ?? 0,
    isDay: current.is_day !== 0,
    time: current.time ?? new Date().toISOString(),
  }
}
