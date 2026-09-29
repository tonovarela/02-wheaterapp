import { saveConfig } from '../storage/settingsStorage.ts'
import { pick } from '../presentation/input.ts'
import { renderCityList, success, warn } from '../presentation/output.ts'
import { removeCity } from '../storage/citiesStorage.ts'
import { cityKey, cityLabel } from '../types/City.ts'
import type { Config } from '../types/Config.ts'

/** Elimina de la lista la ciudad elegida por el usuario. */
export async function deleteCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    warn('No hay ciudades para eliminar.')
    return config
  }

  console.log(renderCityList(config))
  const city = await pick(config.cities, '\n  Número de la ciudad a eliminar: ')
  if (!city) return config

  const updated = removeCity(config, cityKey(city))
  await saveConfig(updated)
  success(`${cityLabel(city)} eliminada.`)
  return updated
}
