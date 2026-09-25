import { getCurrentWeather, getDailyForecast, searchCities } from './api.ts'
import { ask, closePrompt } from './prompt.ts'
import {
  addCity,
  getDefaultCity,
  loadConfig,
  removeCity,
  saveConfig,
  setDefaultCity,
} from './storage.ts'
import type { City, Config } from './types.ts'
import { cityKey, cityLabel } from './types.ts'
import {
  clear,
  color,
  error,
  info,
  renderCityList,
  renderForecastCard,
  renderMenu,
  renderWeatherCard,
  renderWeatherLine,
  success,
  unitLabel,
  warn,
} from './ui.ts'

export async function run(): Promise<void> {
  try {
    await loop()
  } finally {
    closePrompt()
  }
}

async function loop(): Promise<void> {
  let config = await loadConfig()

  while (true) {
    clear()
    console.log(renderMenu(config))

    const choice = await ask('  Selecciona una opción: ')
    if (choice === null || choice === '9') break
    console.log()

    switch (choice) {
      case '1':
        await showDefaultCity(config)
        break
      case '2':
        await showAllCities(config)
        break
      case '3':
        config = await searchAndAddCity(config)
        break
      case '4':
        config = await deleteCity(config)
        break
      case '5':
        config = await chooseDefaultCity(config)
        break
      case '6':
        await showForecast(config)
        break
      case '8':
        config = await toggleUnit(config)
        break
      default:
        error('Opción inválida.')
    }

    if ((await ask(color.dim('\n  Presiona Enter para continuar...'))) === null) break
  }

  console.log()
  info('¡Hasta luego! 👋')
}

async function showDefaultCity(config: Config): Promise<void> {
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

async function showAllCities(config: Config): Promise<void> {
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

async function showForecast(config: Config): Promise<void> {
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

async function searchAndAddCity(config: Config): Promise<Config> {
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
  matches.forEach((city, index) => {
    console.log(`  ${color.yellow(String(index + 1))}. ${cityLabel(city)}`)
  })

  const city = await pick(matches, '\n  Selecciona la ciudad a agregar: ')
  if (!city) return config

  const updated = addCity(config, city)
  if (updated === config) {
    warn(`${cityLabel(city)} ya estaba registrada.`)
    return config
  }

  await saveConfig(updated)
  success(`${cityLabel(city)} agregada.`)
  return updated
}

async function deleteCity(config: Config): Promise<Config> {
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

async function chooseDefaultCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    warn('No hay ciudades registradas. Usa la opción 3 para agregar una.')
    return config
  }

  console.log(renderCityList(config))
  const city = await pick(config.cities, '\n  Número de la ciudad default: ')
  if (!city) return config

  const updated = setDefaultCity(config, cityKey(city))
  await saveConfig(updated)
  success(`${cityLabel(city)} es ahora la ciudad default.`)
  return updated
}

async function toggleUnit(config: Config): Promise<Config> {
  const updated: Config = { ...config, unit: config.unit === 'C' ? 'F' : 'C' }
  await saveConfig(updated)
  success(`Unidad cambiada a ${unitLabel(updated.unit)}.`)
  return updated
}

/** Pide un número de la lista (1-based) y devuelve el elemento, o `null` si es inválido. */
async function pick<T>(items: T[], question: string): Promise<T | null> {
  const answer = await ask(question)
  if (answer === null) return null

  const item = items[Number.parseInt(answer, 10) - 1]
  if (!item) {
    error('Selección inválida.')
    return null
  }
  return item
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
