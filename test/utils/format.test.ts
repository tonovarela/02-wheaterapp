import { test, expect } from 'bun:test'
import { unitLabel, windUnit, center, fit, dayLabel, describeError } from '../../src/utils/format.ts'

test('unitLabel - retorna °C para unidad C', () => {
  expect(unitLabel('C')).toBe('°C')
})

test('unitLabel - retorna °F para unidad F', () => {
  expect(unitLabel('F')).toBe('°F')
})

test('windUnit - retorna km/h para unidad C', () => {
  expect(windUnit('C')).toBe('km/h')
})

test('windUnit - retorna mph para unidad F', () => {
  expect(windUnit('F')).toBe('mph')
})

test('center - centra texto agregando padding izquierdo', () => {
  const result = center('Test')
  // WIDTH = 40, text.length = 4, padding = (40 - 4) / 2 = 18
  expect(result.length).toBe(22) // 18 spaces + 'Test'
  expect(result).toContain('Test')
  expect(result.endsWith('Test')).toBe(true)
})

test('center - texto vacío resulta en espacios centrados', () => {
  const result = center('')
  // WIDTH = 40, text.length = 0, padding = (40 - 0) / 2 = 20
  expect(result.length).toBe(20)
  expect(result).toBe(' '.repeat(20))
})

test('center - texto más largo que WIDTH retorna solo el texto', () => {
  const longText = 'Este es un texto muy largo que excede el ancho de 40'
  const result = center(longText)
  // Si WIDTH - text.length es negativo, padding = 0
  expect(result).toBe(longText)
  expect(result.length).toBe(longText.length)
})

test('fit - ajusta texto a ancho especificado', () => {
  const result = fit('Hello', 10)
  expect(result.length).toBe(10)
  expect(result).toBe('Hello     ')
})

test('fit - trunca texto muy largo con elipsis', () => {
  const longText = 'Este es un texto muy largo'
  const result = fit(longText, 10)
  expect(result.length).toBe(10)
  expect(result.endsWith('…')).toBe(true)
})

test('fit - texto exacto al ancho', () => {
  const result = fit('12345', 5)
  expect(result).toBe('12345')
})

test('dayLabel - convierte fecha ISO a etiqueta legible', () => {
  const result = dayLabel('2026-10-01')
  expect(result).toContain('01/10')
})

test('dayLabel - fecha inválida retorna la misma cadena', () => {
  const result = dayLabel('invalid-date')
  expect(result).toBe('invalid-date')
})

test('dayLabel - formato correcto con día de la semana', () => {
  const result = dayLabel('2026-10-03') // Sábado
  expect(result).toContain('sáb')
  expect(result).toContain('03/10')
})

test('describeError - extrae mensaje de Error', () => {
  const error = new Error('Algo salió mal')
  expect(describeError(error)).toBe('Algo salió mal')
})

test('describeError - convierte objeto desconocido a string', () => {
  const result = describeError({ foo: 'bar' })
  expect(result).toBe('[object Object]')
})

test('describeError - maneja null y undefined', () => {
  expect(describeError(null)).toBe('null')
  expect(describeError(undefined)).toBe('undefined')
})
