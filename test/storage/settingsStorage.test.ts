import { test, expect, beforeEach, afterEach } from 'bun:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadConfig, saveConfig, configPath } from '../../src/storage/settingsStorage.ts'
import type { Config } from '../../src/types/Config.ts'

let tempConfigPath: string

beforeEach(() => {
  tempConfigPath = join(tmpdir(), `test-weather-${Date.now()}-${Math.random()}.json`)
  process.env.WEATHER_CLI_CONFIG = tempConfigPath
})

afterEach(() => {
  delete process.env.WEATHER_CLI_CONFIG
})

test('configPath - retorna ruta de WEATHER_CLI_CONFIG si está definida', () => {
  const path = configPath()
  expect(path).toBe(tempConfigPath)
})

test('loadConfig - retorna config por defecto si archivo no existe', async () => {
  const config = await loadConfig()

  expect(config.cities).toHaveLength(0)
  expect(config.defaultCity).toBe(null)
  expect(config.unit).toBe('C')
})

test('saveConfig - persiste config a archivo', async () => {
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

  await saveConfig(config)
  const loaded = await loadConfig()

  expect(loaded.cities).toHaveLength(1)
  expect(loaded.cities[0]?.name).toBe('Madrid')
  expect(loaded.defaultCity).toBe('Madrid|España|40.4168,-3.7038')
  expect(loaded.unit).toBe('C')
})

test('saveConfig - persiste unit F', async () => {
  const config: Config = {
    cities: [],
    defaultCity: null,
    unit: 'F',
  }

  await saveConfig(config)
  const loaded = await loadConfig()

  expect(loaded.unit).toBe('F')
})

test('loadConfig - normaliza datos inválidos', async () => {
  // Escribir JSON inválido directamente
  const invalidData = {
    cities: [{ name: 'Test' }], // Falta latitude/longitude
    defaultCity: 'invalid-key',
    unit: 'X', // Unidad inválida
  }

  await Bun.write(tempConfigPath, JSON.stringify(invalidData))

  const config = await loadConfig()

  expect(config.cities).toHaveLength(0) // Se filtra ciudad inválida
  expect(config.defaultCity).toBe(null) // Se resetea default inválido
  expect(config.unit).toBe('C') // Se normaliza a C
})

test('loadConfig - filtra ciudades sin campos requeridos', async () => {
  const invalidData = {
    cities: [
      { name: 'Madrid', country: 'España', latitude: 40.4168 }, // Falta longitude - INVÁLIDA
      { name: 'Barcelona', latitude: 41.3851, longitude: 2.1734 }, // Tiene name, latitude, longitude - VÁLIDA
      { name: 'Valid', country: 'Country', latitude: 0, longitude: 0 }, // Válida
    ],
    defaultCity: null,
    unit: 'C',
  }

  await Bun.write(tempConfigPath, JSON.stringify(invalidData))

  const config = await loadConfig()

  expect(config.cities).toHaveLength(2) // Barcelona y Valid
  expect(config.cities[0]?.name).toBe('Barcelona')
  expect(config.cities[1]?.name).toBe('Valid')
})

test('loadConfig - mantiene admin1 opcional', async () => {
  const data = {
    cities: [
      {
        name: 'Madrid',
        country: 'España',
        admin1: 'Comunidad de Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
      },
    ],
    defaultCity: null,
    unit: 'C',
  }

  await Bun.write(tempConfigPath, JSON.stringify(data))

  const config = await loadConfig()

  expect(config.cities[0]?.admin1).toBe('Comunidad de Madrid')
})

test('saveConfig - genera JSON válido con indentación', async () => {
  const config: Config = {
    cities: [
      {
        name: 'Test',
        country: 'Country',
        latitude: 0,
        longitude: 0,
      },
    ],
    defaultCity: null,
    unit: 'C',
  }

  await saveConfig(config)

  const content = await Bun.file(tempConfigPath).text()

  expect(content).toContain('"name": "Test"')
  expect(content).toContain('"unit": "C"')
})
