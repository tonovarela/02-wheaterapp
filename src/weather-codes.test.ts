import { describe, expect, test } from 'bun:test'
import { describeWeatherCode } from './weather-codes.ts'

describe('describeWeatherCode', () => {
  test('mapea un código conocido', () => {
    expect(describeWeatherCode(0).description).toBe('Despejado')
  })

  test('devuelve un valor por defecto para códigos desconocidos', () => {
    expect(describeWeatherCode(1234).description).toBe('Desconocido')
  })
})
