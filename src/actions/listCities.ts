import { getCurrentWeather } from '../api/weather.ts'
import { error, info, renderWeatherLine, warn } from '../presentation/output.ts'
import type { Config } from '../types/Config.ts'
import { cityLabel } from '../types/City.ts'
import { describeError } from '../utils/format.ts'

/** Muestra el clima actual de todas las ciudades registradas. */
export async function listCities(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    warn('No hay ciudades registradas. Usa la opción 3 para agregar una.')
    return
  }

  info(`Consultando ${config.cities.length} ciudad(es)...`)
  console.log()

  const results = await Promise.allSettled(
    config.cities.map(city => getCurrentWeather(city, config.unit)),
  )

  results.forEach((result, index) => {
    const city = config.cities[index]
    if (!city) return

    if (result.status === 'fulfilled') {
      console.log(renderWeatherLine(city, result.value, config.unit))
    } else {
      error(`${cityLabel(city)}: ${describeError(result.reason)}`)
    }
  })
}
