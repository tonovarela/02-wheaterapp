import { test, expect, beforeEach, afterEach } from 'bun:test'
import { getCurrentWeather, getDailyForecast, parseForecastDays } from '../../src/api/weather.ts'
import type { City } from '../../src/types/City.ts'

let originalFetch: typeof global.fetch

const testCity: City = {
  name: 'Madrid',
  country: 'España',
  latitude: 40.4168,
  longitude: -3.7038,
}

beforeEach(() => {
  originalFetch = global.fetch
})

afterEach(() => {
  global.fetch = originalFetch
})

// getCurrentWeather tests
test('getCurrentWeather - retorna clima actual válido', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        current: {
          time: '2026-10-01T12:00',
          temperature_2m: 25.5,
          apparent_temperature: 26,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          is_day: 1,
        },
      }),
      { status: 200 }
    )

  const result = await getCurrentWeather(testCity, 'C')

  expect(result.temperature).toBe(25.5)
  expect(result.apparentTemperature).toBe(26)
  expect(result.humidity).toBe(60)
  expect(result.windSpeed).toBe(10)
  expect(result.weatherCode).toBe(0)
  expect(result.isDay).toBe(true)
})

test('getCurrentWeather - usa temperatura_aparente como fallback', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        current: {
          time: '2026-10-01T12:00',
          temperature_2m: 25.5,
          relative_humidity_2m: 60,
          wind_speed_10m: 10,
          weather_code: 0,
          is_day: 1,
        },
      }),
      { status: 200 }
    )

  const result = await getCurrentWeather(testCity, 'C')

  expect(result.apparentTemperature).toBe(25.5)
})

test('getCurrentWeather - usa valores por defecto para campos faltantes', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        current: {
          temperature_2m: 25,
          is_day: 0,
        },
      }),
      { status: 200 }
    )

  const result = await getCurrentWeather(testCity, 'C')

  expect(result.humidity).toBe(0)
  expect(result.windSpeed).toBe(0)
  expect(result.weatherCode).toBe(0)
  expect(result.isDay).toBe(false)
})

test('getCurrentWeather - lanza error si falta temperature_2m', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ current: { is_day: 1 } }), { status: 200 })

  try {
    await getCurrentWeather(testCity, 'C')
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})

test('getCurrentWeather - setea unidad fahrenheit correctamente', async () => {
  let capturedUrl: string | null = null

  global.fetch = async (url: string) => {
    capturedUrl = url
    return new Response(
      JSON.stringify({
        current: {
          temperature_2m: 77,
          is_day: 1,
        },
      }),
      { status: 200 }
    )
  }

  await getCurrentWeather(testCity, 'F')

  expect(capturedUrl).toContain('temperature_unit=fahrenheit')
  expect(capturedUrl).toContain('wind_speed_unit=mph')
})

test('getCurrentWeather - lanza error en respuesta 500', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })

  try {
    await getCurrentWeather(testCity, 'C')
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
    expect((err as Error).message).toContain('500')
  }
})

// getDailyForecast tests
test('getDailyForecast - retorna pronóstico de 7 días', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        daily: {
          time: ['2026-10-01', '2026-10-02', '2026-10-03'],
          weather_code: [0, 1, 2],
          temperature_2m_max: [28, 27, 26],
          temperature_2m_min: [15, 14, 13],
        },
      }),
      { status: 200 }
    )

  const result = await getDailyForecast(testCity, 'C')

  expect(result).toHaveLength(3)
  expect(result[0]?.date).toBe('2026-10-01')
  expect(result[0]?.weatherCode).toBe(0)
  expect(result[0]?.temperatureMax).toBe(28)
  expect(result[0]?.temperatureMin).toBe(15)
})

test('getDailyForecast - setea unidad fahrenheit', async () => {
  let capturedUrl: string | null = null

  global.fetch = async (url: string) => {
    capturedUrl = url
    return new Response(
      JSON.stringify({
        daily: {
          time: ['2026-10-01'],
          weather_code: [0],
          temperature_2m_max: [82],
          temperature_2m_min: [59],
        },
      }),
      { status: 200 }
    )
  }

  await getDailyForecast(testCity, 'F')

  expect(capturedUrl).toContain('temperature_unit=fahrenheit')
})

// parseForecastDays tests
test('parseForecastDays - parsea respuesta válida', () => {
  const data = {
    daily: {
      time: ['2026-10-01', '2026-10-02'],
      weather_code: [0, 1],
      temperature_2m_max: [28, 27],
      temperature_2m_min: [15, 14],
    },
  }

  const result = parseForecastDays(data)

  expect(result).toHaveLength(2)
  expect(result[0]?.date).toBe('2026-10-01')
  expect(result[1]?.weatherCode).toBe(1)
})

test('parseForecastDays - usa 0 como fallback para weather_code', () => {
  const data = {
    daily: {
      time: ['2026-10-01', '2026-10-02'],
      temperature_2m_max: [28, 27],
      temperature_2m_min: [15, 14],
    },
  }

  const result = parseForecastDays(data)

  expect(result[0]?.weatherCode).toBe(0)
  expect(result[1]?.weatherCode).toBe(0)
})

test('parseForecastDays - lanza error si falta time', () => {
  const data = {
    daily: {
      temperature_2m_max: [28],
      temperature_2m_min: [15],
    },
  }

  try {
    parseForecastDays(data)
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})

test('parseForecastDays - lanza error si falta temperature_2m_max', () => {
  const data = {
    daily: {
      time: ['2026-10-01'],
      temperature_2m_min: [15],
    },
  }

  try {
    parseForecastDays(data)
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})

test('parseForecastDays - lanza error si daily es undefined', () => {
  const data = {}

  try {
    parseForecastDays(data)
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})

test('parseForecastDays - maneja null correctamente', () => {
  try {
    parseForecastDays(null)
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})
