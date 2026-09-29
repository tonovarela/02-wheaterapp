import { getCurrentWeather } from '../api/weather.ts'
import { ask } from '../presentation/input.ts'
import { error, info, renderWeatherCard, warn } from '../presentation/output.ts'
import { getDefaultCity } from '../storage/citiesStorage.ts'
import type { Config } from '../types/Config.ts'
import { cityLabel } from '../types/City.ts'
import { describeError } from '../utils/format.ts'

/** Muestra el clima actual de la ciudad default. */
export async function getWeather(config: Config): Promise<void> {
  const city = getDefaultCity(config)
  if (!city) {
    warn('No hay ciudad default. Usa la opción 3 para agregar una.')
    return
  }

  info(`Consultando ${cityLabel(city)}...`)
  try {
    const weather = await getCurrentWeather(city, config.unit)
    console.log()
    console.log(renderWeatherCard(city, weather, config.unit))
  } catch (err) {
    error(`No se pudo obtener el clima: ${describeError(err)}`)
  }
}
