import { test, expect } from 'bun:test'
import { addCity, removeCity, setDefaultCity, getDefaultCity } from '../../src/storage/citiesStorage.ts'
import type { Config } from '../../src/types/Config.ts'
import { cityKey } from '../../src/types/City.ts'

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

const newyork = {
  name: 'New York',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.006,
}

test('addCity - agrega ciudad a config vacía', () => {
  const config: Config = { cities: [], defaultCity: null, unit: 'C' }
  const result = addCity(config, madrid)

  expect(result.cities).toHaveLength(1)
  expect(result.cities[0]).toEqual(madrid)
  expect(result.defaultCity).toBe(cityKey(madrid))
})

test('addCity - agrega ciudad y no cambia default existente', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = addCity(config, barcelona)

  expect(result.cities).toHaveLength(2)
  expect(result.defaultCity).toBe(cityKey(madrid))
})

test('addCity - no agrega duplicados', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = addCity(config, madrid)

  expect(result.cities).toHaveLength(1)
  expect(result).toEqual(config)
})

test('removeCity - elimina ciudad de la lista', () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = removeCity(config, cityKey(barcelona))

  expect(result.cities).toHaveLength(1)
  expect(result.cities[0]).toEqual(madrid)
  expect(result.defaultCity).toBe(cityKey(madrid))
})

test('removeCity - ajusta default si se elimina la ciudad default', () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = removeCity(config, cityKey(madrid))

  expect(result.cities).toHaveLength(1)
  expect(result.cities[0]).toEqual(barcelona)
  expect(result.defaultCity).toBe(cityKey(barcelona))
})

test('removeCity - setea defaultCity a null si queda vacío', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = removeCity(config, cityKey(madrid))

  expect(result.cities).toHaveLength(0)
  expect(result.defaultCity).toBe(null)
})

test('removeCity - no afecta default si no es la eliminada', () => {
  const config: Config = {
    cities: [madrid, barcelona, newyork],
    defaultCity: cityKey(barcelona),
    unit: 'C',
  }
  const result = removeCity(config, cityKey(madrid))

  expect(result.defaultCity).toBe(cityKey(barcelona))
})

test('setDefaultCity - cambia la ciudad default', () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = setDefaultCity(config, cityKey(barcelona))

  expect(result.defaultCity).toBe(cityKey(barcelona))
})

test('setDefaultCity - no cambia si la ciudad no existe', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = setDefaultCity(config, 'invalid-key')

  expect(result).toEqual(config)
})

test('getDefaultCity - retorna la ciudad default', () => {
  const config: Config = {
    cities: [madrid, barcelona],
    defaultCity: cityKey(madrid),
    unit: 'C',
  }
  const result = getDefaultCity(config)

  expect(result).toEqual(madrid)
})

test('getDefaultCity - retorna null si no hay default', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: null,
    unit: 'C',
  }
  const result = getDefaultCity(config)

  expect(result).toBe(null)
})

test('getDefaultCity - retorna null si la clave no coincide con ninguna ciudad', () => {
  const config: Config = {
    cities: [madrid],
    defaultCity: 'nonexistent-key',
    unit: 'C',
  }
  const result = getDefaultCity(config)

  expect(result).toBe(null)
})
