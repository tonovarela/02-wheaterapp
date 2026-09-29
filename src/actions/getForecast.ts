import { getDailyForecast } from '../api/weather.ts'
import { pick } from '../presentation/input.ts'
import { error, info, renderCityList, renderForecastCard, warn } from '../presentation/output.ts'
import type { City } from '../types/City.ts'
import { cityLabel } from '../types/City.ts'
import type { Config } from '../types/Config.ts'
import { describeError } from '../utils/format.ts'

/** Muestra el pronóstico de 7 días de una ciudad de la lista. */
export async function getForecast(config: Config): Promise<void> {
  const city = await pickForecastCity(config)
  if (!city) return

  info(`Consultando pronóstico de ${cityLabel(city)}...`)
  try {
    const days = await getDailyForecast(city, config.unit)
    console.log()
    console.log(renderForecastCard(city, days, config.unit))
  } catch (err) {
    error(`No se pudo obtener el pronóstico: ${describeError(err)}`)
  }
}

/** Con una ciudad registrada no hay nada que elegir; con varias, deja elegir. */
async function pickForecastCity(config: Config): Promise<City | null> {
  if (config.cities.length === 0) {
    warn('No hay ciudades registradas. Usa la opción 3 para agregar una.')
    return null
  }
  if (config.cities.length === 1) return config.cities[0] ?? null

  console.log(renderCityList(config))
  return pick(config.cities, '\n  Número de la ciudad a pronosticar: ')
}
