import { homedir } from 'node:os'
import { join } from 'node:path'
import { cityKey, type City } from '../types/City.ts'
import type { Config } from '../types/Config.ts'
import type { Unit } from '../types/Weather.ts'

const DEFAULT_CONFIG: Config = { cities: [], defaultCity: null, unit: 'C' }

/**
 * El binario puede ejecutarse desde cualquier carpeta, así que la config vive en
 * el home del usuario. `WEATHER_CLI_CONFIG` permite sobreescribirla (tests).
 */
export function configPath(): string {
  return process.env.WEATHER_CLI_CONFIG ?? join(homedir(), '.weather-cli.json')
}

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await Bun.file(configPath()).json()
    return normalize(raw)
  } catch {
    return { ...DEFAULT_CONFIG, cities: [] }
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(configPath(), `${JSON.stringify(config, null, 2)}\n`)
}

function normalize(raw: unknown): Config {
  const value = (raw ?? {}) as Partial<Config>
  const cities = Array.isArray(value.cities) ? value.cities.filter(isCity) : []
  const unit: Unit = value.unit === 'F' ? 'F' : 'C'
  const defaultCity =
    typeof value.defaultCity === 'string' && cities.some(city => cityKey(city) === value.defaultCity)
      ? value.defaultCity
      : null

  return { cities, defaultCity, unit }
}

function isCity(value: unknown): value is City {
  const city = value as Partial<City> | null
  return (
    !!city &&
    typeof city.name === 'string' &&
    typeof city.latitude === 'number' &&
    typeof city.longitude === 'number'
  )
}
