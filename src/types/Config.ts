import type { City } from './City.ts'
import type { Unit } from './Weather.ts'

export interface Config {
  cities: City[]
  /** Clave (`cityKey`) de la ciudad por defecto, o `null` si no hay ninguna. */
  defaultCity: string | null
  unit: Unit
}
