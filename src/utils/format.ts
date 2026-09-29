import type { Unit } from '../types/Weather.ts'
import { WEEKDAYS, WIDTH } from './constants.ts'

export function unitLabel(unit: Unit): string {
  return unit === 'C' ? '°C' : '°F'
}

export function windUnit(unit: Unit): string {
  return unit === 'C' ? 'km/h' : 'mph'
}

/** Centra un texto dentro del ancho fijo de las tarjetas. */
export function center(text: string): string {
  const padding = Math.max(0, Math.floor((WIDTH - text.length) / 2))
  return ' '.repeat(padding) + text
}

/** Recorta o rellena a un ancho fijo, para que las columnas queden alineadas. */
export function fit(text: string, width: number): string {
  return text.length > width ? `${text.slice(0, width - 1)}…` : text.padEnd(width)
}

/** `2026-09-26` → `sáb 26/09`. En UTC para no correr de día según la zona local. */
export function dayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return date

  const weekday = WEEKDAYS[parsed.getUTCDay()] ?? ''
  const day = String(parsed.getUTCDate()).padStart(2, '0')
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  return `${weekday} ${day}/${month}`
}

export function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
