import { pick } from '../presentation/input.ts'
import { renderCityList, success, warn } from '../presentation/output.ts'
import { setDefaultCity as applyDefaultCity } from '../storage/citiesStorage.ts'
import { saveConfig } from '../storage/settingsStorage.ts'
import { cityKey, cityLabel } from '../types/City.ts'
import type { Config } from '../types/Config.ts'

/** Marca como default la ciudad elegida por el usuario. */
export async function chooseDefaultCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    warn('No hay ciudades registradas. Usa la opción 3 para agregar una.')
    return config
  }

  console.log(renderCityList(config))
  const city = await pick(config.cities, '\n  Número de la ciudad default: ')
  if (!city) return config

  const updated = applyDefaultCity(config, cityKey(city))
  await saveConfig(updated)
  success(`${cityLabel(city)} es ahora la ciudad default.`)
  return updated
}
