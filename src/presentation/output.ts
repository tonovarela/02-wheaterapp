import { cityKey, cityLabel, type City } from '../types/City.ts'
import type { Config } from '../types/Config.ts'
import type { CurrentWeather, ForecastDay, Unit } from '../types/Weather.ts'
import { color } from '../utils/colors.ts'
import { RULE } from '../utils/constants.ts'
import { dayLabel, fit, unitLabel, windUnit } from '../utils/format.ts'
import { describeWeatherCode } from '../utils/weatherCodes.ts'

export function clear(): void {
  process.stdout.write('\x1b[2J\x1b[H')
}

export function renderCityList(config: Config): string {
  return config.cities
    .map((city, index) => {
      const marker = cityKey(city) === config.defaultCity ? color.green(' ★ default') : ''
      return `  ${color.yellow(String(index + 1))}. ${cityLabel(city)}${marker}`
    })
    .join('\n')
}

/** Listado numerado de ciudades, para elegir una de la lista. */
export function renderCityOptions(cities: City[]): string {
  return cities
    .map((city, index) => `  ${color.yellow(String(index + 1))}. ${cityLabel(city)}`)
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

/** Tarjeta con una fila por día: fecha, condición y máx/mín. */
export function renderForecastCard(city: City, days: ForecastDay[], unit: Unit): string {
  const header = `  ${fit('DÍA', 9)}    ${fit('CONDICIÓN', 16)} ${'MÁX/MÍN'}`

  const rows = days.map((day, index) => {
    const { description, icon } = describeWeatherCode(day.weatherCode)
    const label = index === 0 ? 'Hoy' : dayLabel(day.date)
    const temp =
      `${String(Math.round(day.temperatureMax)).padStart(3)}` +
      `/${String(Math.round(day.temperatureMin)).padStart(3)}`

    return (
      `  ${fit(label, 9)} ${icon} ` +
      `${color.dim(fit(description, 16))} ${color.magenta(temp)}`
    )
  })

  return [
    color.cyan(RULE),
    `  ${color.bold(cityLabel(city))}`,
    color.dim(`  Pronóstico 7 días · máx/mín en ${unitLabel(unit)}`),
    '',
    color.dim(header),
    ...rows,
    color.cyan(RULE),
  ].join('\n')
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
