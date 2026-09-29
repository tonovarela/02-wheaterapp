export type Unit = 'C' | 'F'

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
  time: string
}

export interface ForecastDay {
  /** Fecha ISO (`YYYY-MM-DD`) del día en la zona horaria de la ciudad. */
  date: string
  weatherCode: number
  temperatureMax: number
  temperatureMin: number
}
