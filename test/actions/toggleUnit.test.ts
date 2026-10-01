import { test, expect, beforeEach, afterEach } from 'bun:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { toggleUnit } from '../../src/actions/toggleUnit.ts'
import type { Config } from '../../src/types/Config.ts'

let tempConfigPath: string
let originalLog: typeof console.log

beforeEach(() => {
  tempConfigPath = join(tmpdir(), `test-weather-${Date.now()}-${Math.random()}.json`)
  process.env.WEATHER_CLI_CONFIG = tempConfigPath
  originalLog = console.log
  console.log = () => {} // Silenciar output
})

afterEach(() => {
  delete process.env.WEATHER_CLI_CONFIG
  console.log = originalLog
})

test('toggleUnit - alterna de C a F', async () => {
  const config: Config = {
    cities: [],
    defaultCity: null,
    unit: 'C',
  }

  const result = await toggleUnit(config)

  expect(result.unit).toBe('F')
})

test('toggleUnit - alterna de F a C', async () => {
  const config: Config = {
    cities: [],
    defaultCity: null,
    unit: 'F',
  }

  const result = await toggleUnit(config)

  expect(result.unit).toBe('C')
})

test('toggleUnit - persiste los cambios', async () => {
  const config: Config = {
    cities: [],
    defaultCity: null,
    unit: 'C',
  }

  const result = await toggleUnit(config)

  const saved = await Bun.file(tempConfigPath).json()
  expect(saved.unit).toBe('F')
})

test('toggleUnit - mantiene ciudades y default intactos', async () => {
  const config: Config = {
    cities: [
      {
        name: 'Madrid',
        country: 'España',
        latitude: 40.4168,
        longitude: -3.7038,
      },
    ],
    defaultCity: 'Madrid|España|40.4168,-3.7038',
    unit: 'C',
  }

  const result = await toggleUnit(config)

  expect(result.cities).toHaveLength(1)
  expect(result.defaultCity).toBe('Madrid|España|40.4168,-3.7038')
})
