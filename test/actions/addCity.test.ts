import { test, expect, beforeEach, afterEach } from 'bun:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

let tempConfigPath: string
let originalFetch: typeof global.fetch
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
  originalFetch = global.fetch
  originalLog = console.log
  console.log = () => {}
})

afterEach(() => {
  delete process.env.WEATHER_CLI_CONFIG
  global.fetch = originalFetch
  console.log = originalLog
})

// Nota: searchAndAddCity requiere `ask()` y `pick()` del módulo de input,
// que son funciones interactivas. Para testearlas completamente,
// necesitaríamos mockear esas funciones también.
// Aquí probamos la lógica subyacente con tests de las funciones base.

test('addCity - búsqueda exitosa obtiene ciudades', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        results: [madrid, barcelona],
      }),
      { status: 200 }
    )

  const { searchCities } = await import('../../src/api/geocoding.ts')
  const result = await searchCities('Madrid')

  expect(result).toHaveLength(2)
  expect(result[0]?.name).toBe('Madrid')
})

test('addCity - búsqueda sin resultados retorna vacío', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ results: [] }), { status: 200 })

  const { searchCities } = await import('../../src/api/geocoding.ts')
  const result = await searchCities('CiudadInexistente')

  expect(result).toHaveLength(0)
  
})

test('addCity - error en API lanza excepción', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })

  const { searchCities } = await import('../../src/api/geocoding.ts')

  try {
    await searchCities('Madrid')
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
  }
})

test('addCity - lógica: agregar ciudad a config vacía', async () => {
  const { addCity } = await import('../../src/storage/citiesStorage.ts')
  const { cityKey } = await import('../../src/types/City.ts')
  const type = await import('../../src/types/Config.ts')

  const config: typeof type.Config = {
    cities: [],
    defaultCity: null,
    unit: 'C',
  }

  const result = addCity(config, madrid)

  expect(result.cities).toHaveLength(1)
  expect(result.defaultCity).toBe(cityKey(madrid))
})

test('addCity - lógica: no agregar duplicados', async () => {
  const { addCity } = await import('../../src/storage/citiesStorage.ts')
  const { cityKey } = await import('../../src/types/City.ts')
  const type = await import('../../src/types/Config.ts')

  const config: typeof type.Config = {
    cities: [madrid],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }

  const result = addCity(config, madrid)

  expect(result.cities).toHaveLength(1)
  expect(result).toEqual(config)
})

test('addCity - lógica: persistencia en storage', async () => {
  const { saveConfig } = await import('../../src/storage/settingsStorage.ts')
  const { addCity } = await import('../../src/storage/citiesStorage.ts')
  const { cityKey } = await import('../../src/types/City.ts')
  const type = await import('../../src/types/Config.ts')

  const config: typeof type.Config = {
    cities: [],
    defaultCity: null,
    unit: 'C',
  }

  const updated = addCity(config, madrid)
  await saveConfig(updated)

  const { loadConfig } = await import('../../src/storage/settingsStorage.ts')
  const loaded = await loadConfig()

  expect(loaded.cities).toHaveLength(1)
  expect(loaded.cities[0]?.name).toBe('Madrid')
})
