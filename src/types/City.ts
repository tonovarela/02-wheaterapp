export interface City {
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

/** Clave estable de una ciudad: identifica la default y se usa para eliminar. */
export function cityKey(city: City): string {
  return `${city.name}|${city.country}|${city.latitude},${city.longitude}`
}

/** Etiqueta legible (`Ciudad, Región, País`) para mostrar en consola. */
export function cityLabel(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}
