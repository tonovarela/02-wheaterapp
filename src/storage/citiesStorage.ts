import { cityKey, type City } from '../types/City.ts'
import type { Config } from '../types/Config.ts'

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
