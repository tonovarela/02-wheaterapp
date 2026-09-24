import type { City, Config, CurrentWeather, Unit } from './types.ts'
import { cityKey, cityLabel } from './types.ts'
import { describeWeatherCode } from './weather-codes.ts'

const WIDTH = 40
const RULE = '═'.repeat(WIDTH)

/** Solo se colorea en una terminal real: al redirigir a un archivo o pipe estorba. */
const enabled = process.stdout.isTTY === true && !process.env.NO_COLOR

function paint(code: string) {
  return (text: string) => (enabled ? `\x1b[${code}m${text}\x1b[0m` : text)
}

export const color = {
  bold: paint('1'),
  dim: paint('2'),
  red: paint('31'),
  green: paint('32'),
  yellow: paint('33'),
  blue: paint('34'),
  magenta: paint('35'),
  cyan: paint('36'),
}

export function clear(): void {
  process.stdout.write('\x1b[2J\x1b[H')
}

export function unitLabel(unit: Unit): string {
  return unit === 'C' ? '°C' : '°F'
}

export function windUnit(unit: Unit): string {
  return unit === 'C' ? 'km/h' : 'mph'
}

function center(text: string): string {
  const padding = Math.max(0, Math.floor((WIDTH - text.length) / 2))
  return ' '.repeat(padding) + text
}

export function renderMenu(config: Config): string {
  const options = [
    ['1', 'Clima de ciudad default'],
    ['2', `Clima de todas las ciudades (${config.cities.length})`],
    ['3', 'Buscar y agregar ciudad'],
    ['4', 'Eliminar ciudad'],
    ['5', 'Establecer ciudad default'],
    ['8', `Ajustes (${unitLabel(config.unit)})`],
    ['9', 'Salir'],
  ] as const

  return [
    color.cyan(RULE),
    color.bold(center('WEATHER CLI')),
    color.cyan(RULE),
    ...options.map(([key, label]) => `  ${color.yellow(key)}. ${label}`),
    color.cyan(RULE),
  ].join('\n')
}

export function renderCityList(config: Config): string {
  return config.cities
    .map((city, index) => {
      const marker = cityKey(city) === config.defaultCity ? color.green(' ★ default') : ''
      return `  ${color.yellow(String(index + 1))}. ${cityLabel(city)}${marker}`
    })
    .join('\n')
}

export function renderWeatherCard(city: City, weather: CurrentWeather, unit: Unit): string {
  const { description, icon } = describeWeatherCode(weather.weatherCode)
  const temp = `${weather.temperature.toFixed(1)}${unitLabel(unit)}`

  return [
    color.cyan(RULE),
    `  ${icon}  ${color.bold(cityLabel(city))}`,
    `  ${color.magenta(temp)}   ${description}`,
    color.dim(
      `  Sensación ${weather.apparentTemperature.toFixed(1)}${unitLabel(unit)}` +
        ` · Humedad ${weather.humidity}%` +
        ` · Viento ${weather.windSpeed.toFixed(1)} ${windUnit(unit)}`,
    ),
    color.dim(`  Actualizado: ${weather.time.replace('T', ' ')}`),
    color.cyan(RULE),
  ].join('\n')
}

/** Una línea compacta, para el listado de todas las ciudades. */
export function renderWeatherLine(city: City, weather: CurrentWeather, unit: Unit): string {
  const { description, icon } = describeWeatherCode(weather.weatherCode)
  const temp = `${weather.temperature.toFixed(1)}${unitLabel(unit)}`.padStart(8)
  return `  ${icon}  ${color.bold(fit(cityLabel(city), 30))} ${color.magenta(temp)}  ${color.dim(description)}`
}

/** Recorta o rellena a un ancho fijo, para que las columnas queden alineadas. */
function fit(text: string, width: number): string {
  return text.length > width ? `${text.slice(0, width - 1)}…` : text.padEnd(width)
}

export function info(message: string): void {
  console.log(color.cyan(`  ${message}`))
}

export function success(message: string): void {
  console.log(color.green(`  ✓ ${message}`))
}

export function warn(message: string): void {
  console.log(color.yellow(`  ! ${message}`))
}

export function error(message: string): void {
  console.log(color.red(`  ✗ ${message}`))
}
