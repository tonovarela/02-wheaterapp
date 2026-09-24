export type Unit = 'C' | 'F'

export interface City {
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

export interface Config {
  cities: City[]
  /** Clave (`cityKey`) de la ciudad por defecto, o `null` si no hay ninguna. */
  defaultCity: string | null
  unit: Unit
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
  time: string
}

export function cityKey(city: City): string {
  return `${city.name}|${city.country}|${city.latitude},${city.longitude}`
}

export function cityLabel(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}
