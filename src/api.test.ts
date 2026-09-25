import { describe, expect, test } from 'bun:test'
import { parseForecastDays } from './api.ts'

describe('parseForecastDays', () => {
  test('mapea el bloque daily a ForecastDay[]', () => {
    const days = parseForecastDays({
      daily: {
        time: ['2026-09-25', '2026-09-26'],
        weather_code: [0, 61],
        temperature_2m_max: [22.4, 18.2],
        temperature_2m_min: [11.6, 9.1],
      },
    })

    expect(days).toEqual([
      { date: '2026-09-25', weatherCode: 0, temperatureMax: 22.4, temperatureMin: 11.6 },
      { date: '2026-09-26', weatherCode: 61, temperatureMax: 18.2, temperatureMin: 9.1 },
    ])
  })

  test('usa valores por defecto cuando falta weather_code', () => {
    const days = parseForecastDays({
      daily: { time: ['2026-09-25'], temperature_2m_max: [20], temperature_2m_min: [10] },
    })

    expect(days).toEqual([
      { date: '2026-09-25', weatherCode: 0, temperatureMax: 20, temperatureMin: 10 },
    ])
  })

  test('lanza si la respuesta no trae datos diarios', () => {
    expect(() => parseForecastDays(null)).toThrow('datos diarios')
    expect(() => parseForecastDays({})).toThrow('datos diarios')
    expect(() => parseForecastDays({ daily: { time: [] } })).toThrow('datos diarios')
    expect(() => parseForecastDays({ daily: { time: ['2026-09-25'] } })).toThrow('datos diarios')
  })
})
