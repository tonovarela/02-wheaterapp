import { createInterface, type Interface } from 'node:readline/promises'

/**
 * Lectura de líneas desde stdin.
 *
 * En una terminal se usa `node:readline`, que da edición de línea e historial.
 * Fuera de ella (pipes, tests, scripts) se usa el iterador asíncrono de
 * `console`, el idiom nativo de Bun: en Bun 1.4 readline cierra la interfaz
 * tras la primera línea cuando stdin no es un TTY, así que ese camino no sirve.
 */
const interactive = process.stdin.isTTY === true

let terminal: { iface: Interface; closed: Promise<null> } | null = null
let lines: AsyncIterator<string> | null = null

function getTerminal() {
  if (!terminal) {
    const iface = createInterface({ input: process.stdin, output: process.stdout })
    // `question()` nunca resuelve si la interfaz se cierra (Ctrl+C / Ctrl+D),
    // así que se compite contra el evento `close`.
    const closed = new Promise<null>(resolve => iface.once('close', () => resolve(null)))
    terminal = { iface, closed }
  }
  return terminal
}

function getLines(): AsyncIterator<string> {
  lines ??= (console as unknown as AsyncIterable<string>)[Symbol.asyncIterator]()
  return lines
}

/** Devuelve la línea escrita, o `null` si stdin se cerró (EOF / Ctrl+D). */
export async function ask(question: string): Promise<string | null> {
  if (interactive) {
    const { iface, closed } = getTerminal()
    const answer = await Promise.race([iface.question(question), closed])
    return answer === null ? null : answer.trim()
  }

  process.stdout.write(question)
  const { value, done } = await getLines().next()
  if (done || value === undefined) {
    process.stdout.write('\n')
    return null
  }
  return value.trim()
}

/** Libera stdin para que el proceso pueda terminar. */
export function closePrompt(): void {
  terminal?.iface.close()
  terminal = null
}
