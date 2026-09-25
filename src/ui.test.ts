import { describe, expect, test } from 'bun:test'
import type { City, Config, CurrentWeather, ForecastDay } from './types.ts'
import { cityKey } from './types.ts'
import { renderCityList, renderForecastCard, renderMenu, renderWeatherLine } from './ui.ts'

const ottawa: City = {
  name: 'Ottawa',
  country: 'Canadá',
  admin1: 'Ontario',
  latitude: 45.41117,
  longitude: -75.69812,
}

const config: Config = { cities: [ottawa], defaultCity: cityKey(ottawa), unit: 'C' }

describe('renderMenu', () => {
  test('usa la numeración del README (1-5, 8, 9)', () => {
    const lines = renderMenu(config)
      .split('\n')
      .map(line => line.trim())

    expect(lines).toContain('1. Clima de ciudad default')
    expect(lines).toContain('3. Buscar y agregar ciudad')
    expect(lines).toContain('4. Eliminar ciudad')
    expect(lines).toContain('5. Establecer ciudad default')
    expect(lines).toContain('6. Pronóstico 7 días')
    expect(lines).toContain('9. Salir')
  })

  test('muestra el número de ciudades y la unidad activa', () => {
    expect(renderMenu(config)).toContain('Clima de todas las ciudades (1)')
    expect(renderMenu(config)).toContain('Ajustes (°C)')
    expect(renderMenu({ ...config, unit: 'F' })).toContain('Ajustes (°F)')
  })
})

test('renderCityList marca la ciudad default', () => {
  expect(renderCityList(config)).toContain('★ default')
  expect(renderCityList({ ...config, defaultCity: null })).not.toContain('★')
})

test('renderWeatherLine incluye temperatura y descripción', () => {
  const weather: CurrentWeather = {
    temperature: 15.2,
    apparentTemperature: 15.2,
    humidity: 70,
    windSpeed: 4.3,
    weatherCode: 0,
    isDay: true,
    time: '2026-09-24T11:30',
  }

  const line = renderWeatherLine(ottawa, weather, 'C')
  expect(line).toContain('Ottawa, Ontario, Canadá')
  expect(line).toContain('15.2°C')
  expect(line).toContain('Despejado')
})

const forecast: ForecastDay[] = [
  { date: '2026-09-25', weatherCode: 0, temperatureMax: 22.4, temperatureMin: 11.6 },
  { date: '2026-09-26', weatherCode: 61, temperatureMax: -3.2, temperatureMin: -7.8 },
]

describe('renderForecastCard', () => {
  test('muestra la ciudad, la unidad y el día de hoy', () => {
    const card = renderForecastCard(ottawa, forecast, 'C')

    expect(card).toContain('Ottawa, Ontario, Canadá')
    expect(card).toContain('Pronóstico 7 días · máx/mín en °C')
    expect(card).toContain('Hoy')
    expect(card).toContain('Despejado')
    expect(renderForecastCard(ottawa, forecast, 'F')).toContain('máx/mín en °F')
  })

  test('etiqueta los demás días con weekday y fecha', () => {
    expect(renderForecastCard(ottawa, forecast, 'C')).toContain('sáb 26/09')
  })

  test('alinea las columnas de condición y temperatura', () => {
    const lines = renderForecastCard(ottawa, forecast, 'C').split('\n')
    const header = lines.find(line => line.includes('MÁX/MÍN'))
    const rows = lines.filter(line => /^\s{2}(Hoy|sáb)/.test(line))

    expect(header).toBeDefined()
    expect(rows).toHaveLength(2)

    const today = rows[0]!
    const tomorrow = rows[1]!
    expect(today.slice(-7)).toBe(' 22/ 12')
    expect(tomorrow.slice(-7)).toBe(' -3/ -8')
    expect(header!.indexOf('CONDICIÓN')).toBe(today.indexOf('Despejado'))
    expect(header!.endsWith('MÁX/MÍN')).toBe(true)
    // los íconos miden 2 columnas en terminal, aunque `.length` diga otra cosa
    expect(new Set(rows.map(visualWidth)).size).toBe(1)
    expect(visualWidth(header!)).toBe(visualWidth(today))
  })
})

/** Ancho aproximado en columnas: cada emoji cuenta como 2. */
function visualWidth(line: string): number {
  return line.replace(/\p{Extended_Pictographic}\uFE0F?/gu, 'xx').length
}
