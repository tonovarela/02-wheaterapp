import { searchCities } from '../api/geocoding.ts'
import { addCity as addCityToConfig } from '../storage/citiesStorage.ts'
import { saveConfig } from '../storage/settingsStorage.ts'
import { ask, pick } from '../presentation/input.ts'
import { error, renderCityOptions, success, warn } from '../presentation/output.ts'
import type { City } from '../types/City.ts'
import { cityLabel } from '../types/City.ts'
import type { Config } from '../types/Config.ts'
import { describeError } from '../utils/format.ts'

/** Busca ciudades por nombre y agrega la elegida a la lista. */
export async function searchAndAddCity(config: Config): Promise<Config> {
  const query = await ask('  Nombre de la ciudad: ')
  if (!query) {
    warn('Búsqueda cancelada.')
    return config
  }

  let matches: City[]
  try {
    matches = await searchCities(query)
  } catch (err) {
    error(`Error en la búsqueda: ${describeError(err)}`)
    return config
  }

  if (matches.length === 0) {
    warn(`No se encontró ninguna ciudad con el nombre "${query}".`)
    return config
  }

  console.log()
  console.log(renderCityOptions(matches))

  const city = await pick(matches, '\n  Selecciona la ciudad a agregar: ')
  if (!city) return config

  const updated = addCityToConfig(config, city)
  if (updated === config) {
    warn(`${cityLabel(city)} ya estaba registrada.`)
    return config
  }

  await saveConfig(updated)
  success(`${cityLabel(city)} agregada.`)
  return updated
}
