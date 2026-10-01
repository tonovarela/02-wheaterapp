import { test, expect } from 'bun:test'
import { describeWeatherCode } from '../../src/utils/weatherCodes.ts'

test('describeWeatherCode - código 0 (Despejado)', () => {
  const result = describeWeatherCode(0)
  expect(result.description).toBe('Despejado')
  expect(result.icon).toBe('☀️')
})

test('describeWeatherCode - código 2 (Parcialmente nublado)', () => {
  const result = describeWeatherCode(2)
  expect(result.description).toBe('Parcialmente nublado')
  expect(result.icon).toBe('⛅')
})

test('describeWeatherCode - código 61 (Lluvia ligera)', () => {
  const result = describeWeatherCode(61)
  expect(result.description).toBe('Lluvia ligera')
  expect(result.icon).toBe('🌦️')
})

test('describeWeatherCode - código 95 (Tormenta eléctrica)', () => {
  const result = describeWeatherCode(95)
  expect(result.description).toBe('Tormenta eléctrica')
  expect(result.icon).toBe('⛈️')
})

test('describeWeatherCode - código inválido retorna Desconocido', () => {
  const result = describeWeatherCode(999)
  expect(result.description).toBe('Desconocido')
  expect(result.icon).toBe('❓')
})

test('describeWeatherCode - código negativo retorna Desconocido', () => {
  const result = describeWeatherCode(-1)
  expect(result.description).toBe('Desconocido')
  expect(result.icon).toBe('❓')
})
