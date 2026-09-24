import { homedir } from 'node:os'
import { join } from 'node:path'
import type { City, Config, Unit } from './types.ts'
import { cityKey } from './types.ts'

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

/** Agrega la ciudad si no existe. La primera ciudad queda como default. */
export function addCity(config: Config, city: City): Config {
  const key = cityKey(city)
  if (config.cities.some(existing => cityKey(existing) === key)) {
    return config
  }

  return {
    ...config,
    cities: [...config.cities, city],
    defaultCity: config.defaultCity ?? key,
  }
}

export function removeCity(config: Config, key: string): Config {
  const cities = config.cities.filter(city => cityKey(city) !== key)
  const defaultCity =
    config.defaultCity === key ? (cities[0] ? cityKey(cities[0]) : null) : config.defaultCity

  return { ...config, cities, defaultCity }
}

export function setDefaultCity(config: Config, key: string): Config {
  if (!config.cities.some(city => cityKey(city) === key)) {
    return config
  }
  return { ...config, defaultCity: key }
}

export function getDefaultCity(config: Config): City | null {
  return config.cities.find(city => cityKey(city) === config.defaultCity) ?? null
}
