import type { City } from '../types/City.ts'
import type { CurrentWeather, ForecastDay, Unit } from '../types/Weather.ts'
import { FORECAST_URL } from '../utils/constants.ts'

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
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

/** Forecast API — clima actual para unas coordenadas. */
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

/** Forecast API — pronóstico diario de los próximos 7 días. */
export async function getDailyForecast(city: City, unit: Unit): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '7',
    timezone: 'auto',
  })
  if (unit === 'F') {
    params.set('temperature_unit', 'fahrenheit')
  }

  const response = await fetch(`${FORECAST_URL}?${params}`)
  if (!response.ok) {
    throw new Error(`Forecast API respondió ${response.status}`)
  }

  return parseForecastDays(await response.json())
}

/** Convierte el bloque `daily` de la respuesta en `ForecastDay[]` (puro, sin red). */
export function parseForecastDays(data: unknown): ForecastDay[] {
  const daily = (data as ForecastResponse | null | undefined)?.daily
  if (!daily?.time?.length || !daily.temperature_2m_max || !daily.temperature_2m_min) {
    throw new Error('La respuesta del clima no incluye datos diarios')
  }

  const dates = daily.time
  const max = daily.temperature_2m_max
  const min = daily.temperature_2m_min
  const codes = daily.weather_code

  return dates.map((date, index) => ({
    date,
    weatherCode: codes?.[index] ?? 0,
    temperatureMax: max[index] ?? 0,
    temperatureMin: min[index] ?? 0,
  }))
}
