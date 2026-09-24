import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  addCity,
  getDefaultCity,
  loadConfig,
  removeCity,
  saveConfig,
  setDefaultCity,
} from './storage.ts'
import type { City, Config } from './types.ts'
import { cityKey } from './types.ts'

const ottawa: City = { name: 'Ottawa', country: 'Canadá', latitude: 45.41117, longitude: -75.69812 }
const merida: City = { name: 'Mérida', country: 'México', latitude: 20.97, longitude: -89.62 }

const empty: Config = { cities: [], defaultCity: null, unit: 'C' }

describe('operaciones sobre la config', () => {
  test('la primera ciudad agregada queda como default', () => {
    const config = addCity(empty, ottawa)
    expect(config.cities).toHaveLength(1)
    expect(config.defaultCity).toBe(cityKey(ottawa))
  })

  test('agregar una ciudad repetida no la duplica', () => {
    const config = addCity(addCity(empty, ottawa), ottawa)
    expect(config.cities).toHaveLength(1)
  })

  test('la segunda ciudad no reemplaza la default', () => {
    const config = addCity(addCity(empty, ottawa), merida)
    expect(getDefaultCity(config)).toEqual(ottawa)
  })

  test('eliminar la default promueve a la siguiente ciudad', () => {
    const config = removeCity(addCity(addCity(empty, ottawa), merida), cityKey(ottawa))
    expect(config.cities).toEqual([merida])
    expect(getDefaultCity(config)).toEqual(merida)
  })

  test('eliminar la última ciudad deja la default en null', () => {
    const config = removeCity(addCity(empty, ottawa), cityKey(ottawa))
    expect(config.defaultCity).toBeNull()
  })

  test('setDefaultCity ignora ciudades no registradas', () => {
    const config = setDefaultCity(addCity(empty, ottawa), cityKey(merida))
    expect(getDefaultCity(config)).toEqual(ottawa)
  })
})

describe('persistencia', () => {
  const path = join(tmpdir(), `weather-cli-test-${Date.now()}.json`)

  beforeEach(() => {
    process.env.WEATHER_CLI_CONFIG = path
  })

  afterEach(async () => {
    await rm(path, { force: true })
    delete process.env.WEATHER_CLI_CONFIG
  })

  test('devuelve una config vacía cuando el archivo no existe', async () => {
    expect(await loadConfig()).toEqual(empty)
  })

  test('guarda y recupera la config', async () => {
    const config = setDefaultCity(addCity(addCity(empty, ottawa), merida), cityKey(merida))
    await saveConfig({ ...config, unit: 'F' })

    const loaded = await loadConfig()
    expect(loaded.cities).toEqual([ottawa, merida])
    expect(getDefaultCity(loaded)).toEqual(merida)
    expect(loaded.unit).toBe('F')
  })

  test('descarta datos corruptos al cargar', async () => {
    await Bun.write(path, JSON.stringify({ cities: [{ name: 'X' }], defaultCity: 'nope', unit: 'K' }))

    const loaded = await loadConfig()
    expect(loaded).toEqual(empty)
  })
})
