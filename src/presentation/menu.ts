import { searchAndAddCity } from '../actions/addCity.ts'
import { getForecast } from '../actions/getForecast.ts'
import { getWeather } from '../actions/getWeather.ts'
import { listCities } from '../actions/listCities.ts'
import { deleteCity } from '../actions/removeCity.ts'
import { chooseDefaultCity } from '../actions/setDefaultCity.ts'
import { toggleUnit } from '../actions/toggleUnit.ts'
import { loadConfig } from '../storage/settingsStorage.ts'
import type { Config } from '../types/Config.ts'
import type { MenuOption } from '../types/MenuOption.ts'
import { color } from '../utils/colors.ts'
import { RULE } from '../utils/constants.ts'
import { center, unitLabel } from '../utils/format.ts'
import { ask, closePrompt } from './input.ts'
import { clear, error, info } from './output.ts'

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
        await getWeather(config)
        break
      case '2':
        await listCities(config)
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
        await getForecast(config)
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

export function renderMenu(config: Config): string {
  const options: MenuOption[] = [
    { key: '1', label: 'Clima de ciudad default' },
    { key: '2', label: `Clima de todas las ciudades (${config.cities.length})` },
    { key: '3', label: 'Buscar y agregar ciudad' },
    { key: '4', label: 'Eliminar ciudad' },
    { key: '5', label: 'Establecer ciudad default' },
    { key: '6', label: 'Pronóstico 7 días' },
    { key: '8', label: `Ajustes (${unitLabel(config.unit)})` },
    { key: '9', label: 'Salir' },
  ]

  return [
    color.cyan(RULE),
    color.bold(center('WEATHER CLI')),
    color.cyan(RULE),
    ...options.map(option => `  ${color.yellow(option.key)}. ${option.label}`),
    color.cyan(RULE),
  ].join('\n')
}
