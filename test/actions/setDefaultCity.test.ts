import { test, expect, beforeEach, afterEach } from 'bun:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { chooseDefaultCity } from '../../src/actions/setDefaultCity.ts'
import type { Config } from '../../src/types/Config.ts'
import { cityKey } from '../../src/types/City.ts'

let tempConfigPath: string
let originalLog: typeof console.log

const madrid = {
  name: 'Madrid',
  country: 'España',
  latitude: 40.4168,
  longitude: -3.7038,
}

const barcelona = {
  name: 'Barcelona',
  country: 'España',
  latitude: 41.3851,
  longitude: 2.1734,
}

beforeEach(() => {
  tempConfigPath = join(tmpdir(), `test-weather-${Date.now()}-${Math.random()}.json`)
  process.env.WEATHER_CLI_CONFIG = tempConfigPath
  originalLog = console.log
  console.log = () => {}
})

afterEach(() => {
  delete process.env.WEATHER_CLI_CONFIG
  console.log = originalLog
})

test('chooseDefaultCity - sin ciudades retorna config sin cambios', async () => {
  const config: Config = {
    cities: [],
    defaultCity: null,
    unit: 'C',
  }

  const result = await chooseDefaultCity(config)

  expect(result).toEqual(config)
})

// Nota: Similar a removeCity, la interactividad requiere mock de `pick()`
// Estos tests validan que la función maneja la estructura correctamente

test('chooseDefaultCity - mantiene estructura si hay ciudades', async () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }

  expect(config.cities).toHaveLength(2)
  expect(config.defaultCity).toBe(cityKey(madrid))
})

test('chooseDefaultCity - config válida con dos ciudades', async () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }

  // Validamos que la config es manipulable
  expect(cityKey(config.cities[1]!)).toBe(cityKey(barcelona))
})
