import { describe, expect, test } from 'bun:test'
import type { City, Config, CurrentWeather } from './types.ts'
import { cityKey } from './types.ts'
import { renderCityList, renderMenu, renderWeatherLine } from './ui.ts'

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
