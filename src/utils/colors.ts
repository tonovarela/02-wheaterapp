/** Solo se colorea en una terminal real: al redirigir a un archivo o pipe estorba. */
const enabled = process.stdout.isTTY === true && !process.env.NO_COLOR

function paint(code: string) {
  return (text: string) => (enabled ? `\x1b[${code}m${text}\x1b[0m` : text)
}

export const color = {
  bold: paint('1'),
  dim: paint('2'),
  red: paint('31'),
  green: paint('32'),
  yellow: paint('33'),
  blue: paint('34'),
  magenta: paint('35'),
  cyan: paint('36'),
}
