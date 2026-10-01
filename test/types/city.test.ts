import { test, expect } from 'bun:test'
import { cityKey, cityLabel } from '../../src/types/City.ts'

test('cityKey - clave estable con todos los campos', () => {
  const city = {
    name: 'Madrid',
    country: 'España',
    admin1: 'Comunidad de Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
  }

  const key = cityKey(city)
  expect(key).toBe('Madrid|España|40.4168,-3.7038')
})

test('cityKey - sin admin1', () => {
  const city = {
    name: 'Barcelona',
    country: 'España',
    latitude: 41.3851,
    longitude: 2.1734,
  }

  const key = cityKey(city)
  expect(key).toBe('Barcelona|España|41.3851,2.1734')
})

test('cityKey - ciudades diferentes generan claves diferentes', () => {
  const madrid = {
    name: 'Madrid',
    country: 'España',
    latitude: 40.4168,
    longitude: -3.7038,
  }

  const madrid_ar = {
    name: 'Madrid',
    country: 'Argentina',
    latitude: -34.6127,
    longitude: -58.4005,
  }

  expect(cityKey(madrid)).not.toBe(cityKey(madrid_ar))
})

test('cityLabel - con todos los campos', () => {
  const city = {
    name: 'Madrid',
    country: 'España',
    admin1: 'Comunidad de Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
  }

  const label = cityLabel(city)
  expect(label).toBe('Madrid, Comunidad de Madrid, España')
})

test('cityLabel - sin admin1', () => {
  const city = {
    name: 'Barcelona',
    country: 'España',
    latitude: 41.3851,
    longitude: 2.1734,
  }

  const label = cityLabel(city)
  expect(label).toBe('Barcelona, España')
})

test('cityLabel - solo name y country (country puede ser vacío)', () => {
  const city = {
    name: 'TestCity',
    country: '',
    latitude: 0,
    longitude: 0,
  }

  const label = cityLabel(city)
  expect(label).toBe('TestCity')
})
