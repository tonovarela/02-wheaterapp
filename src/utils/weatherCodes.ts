export interface CodeInfo {
  description: string
  icon: string
}

/** Códigos WMO que devuelve OpenMeteo en `current.weather_code`. */
const WMO_CODES: Record<number, CodeInfo> = {
  0: { description: 'Despejado', icon: '☀️' },
  1: { description: 'Mayormente despejado', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Niebla', icon: '🌫️' },
  48: { description: 'Niebla con escarcha', icon: '🌫️' },
  51: { description: 'Llovizna ligera', icon: '🌦️' },
  53: { description: 'Llovizna moderada', icon: '🌦️' },
  55: { description: 'Llovizna intensa', icon: '🌧️' },
  56: { description: 'Llovizna helada ligera', icon: '🌧️' },
  57: { description: 'Llovizna helada intensa', icon: '🌧️' },
  61: { description: 'Lluvia ligera', icon: '🌦️' },
  63: { description: 'Lluvia moderada', icon: '🌧️' },
  65: { description: 'Lluvia intensa', icon: '🌧️' },
  66: { description: 'Lluvia helada ligera', icon: '🌧️' },
  67: { description: 'Lluvia helada intensa', icon: '🌧️' },
  71: { description: 'Nevada ligera', icon: '🌨️' },
  73: { description: 'Nevada moderada', icon: '🌨️' },
  75: { description: 'Nevada intensa', icon: '❄️' },
  77: { description: 'Granos de nieve', icon: '🌨️' },
  80: { description: 'Chubascos ligeros', icon: '🌦️' },
  81: { description: 'Chubascos moderados', icon: '🌧️' },
  82: { description: 'Chubascos violentos', icon: '⛈️' },
  85: { description: 'Chubascos de nieve ligeros', icon: '🌨️' },
  86: { description: 'Chubascos de nieve intensos', icon: '❄️' },
  95: { description: 'Tormenta eléctrica', icon: '⛈️' },
  96: { description: 'Tormenta con granizo ligero', icon: '⛈️' },
  99: { description: 'Tormenta con granizo intenso', icon: '⛈️' },
}

const UNKNOWN: CodeInfo = { description: 'Desconocido', icon: '❓' }

export function describeWeatherCode(code: number): CodeInfo {
  return WMO_CODES[code] ?? UNKNOWN
}
