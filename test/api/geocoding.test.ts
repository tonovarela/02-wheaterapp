import { test, expect, beforeEach, afterEach } from 'bun:test'
import { searchCities } from '../../src/api/geocoding.ts'

let originalFetch: typeof global.fetch

beforeEach(() => {
  originalFetch = global.fetch
})

afterEach(() => {
  global.fetch = originalFetch
})

test('searchCities - búsqueda exitosa retorna ciudades', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        results: [
          {
            name: 'Madrid',
            country: 'España',
            latitude: 40.4168,
            longitude: -3.7038,
          },
          {
            name: 'Madrid',
            country: 'Argentina',
            latitude: -34.6127,
            longitude: -58.4005,
          },
        ],
      }),
      { status: 200 }
    )

  const result = await searchCities('Madrid')

  expect(result).toHaveLength(2)
  expect(result[0]?.name).toBe('Madrid')
  expect(result[0]?.country).toBe('España')
  expect(result[1]?.country).toBe('Argentina')
})

test('searchCities - respuesta vacía retorna array vacío', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ results: [] }), { status: 200 })

  const result = await searchCities('CiudadInexistente')

  expect(result).toHaveLength(0)
})

test('searchCities - respuesta sin results retorna array vacío', async () => {
  global.fetch = async () => new Response(JSON.stringify({}), { status: 200 })

  const result = await searchCities('Madrid')

  expect(result).toHaveLength(0)
})

test('searchCities - incluye admin1 si está disponible', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        results: [
          {
            name: 'Madrid',
            country: 'España',
            admin1: 'Comunidad de Madrid',
            latitude: 40.4168,
            longitude: -3.7038,
          },
        ],
      }),
      { status: 200 }
    )

  const result = await searchCities('Madrid')

  expect(result[0]?.admin1).toBe('Comunidad de Madrid')
})

test('searchCities - maneja respuesta sin country', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        results: [
          {
            name: 'TestCity',
            latitude: 0,
            longitude: 0,
          },
        ],
      }),
      { status: 200 }
    )

  const result = await searchCities('Test')

  expect(result[0]?.country).toBe('')
})

test('searchCities - lanza error en respuesta con estado no OK', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })

  try {
    await searchCities('Madrid')
    expect.unreachable()
  } catch (err) {
    expect(err instanceof Error).toBe(true)
    expect((err as Error).message).toContain('500')
  }
})

test('searchCities - usa parámetro count', async () => {
  let capturedUrl: string | null = null

  global.fetch = async (url: string) => {
    capturedUrl = url
    return new Response(JSON.stringify({ results: [] }), { status: 200 })
  }

  await searchCities('Madrid', 10)

  expect(capturedUrl).toContain('count=10')
})

test('searchCities - encadena URL correctamente', async () => {
  let capturedUrl: string | null = null

  global.fetch = async (url: string) => {
    capturedUrl = url
    return new Response(JSON.stringify({ results: [] }), { status: 200 })
  }

  await searchCities('New York')

  expect(capturedUrl).toContain('New%20York') // URL encoded
  expect(capturedUrl).toContain('language=es')
  expect(capturedUrl).toContain('format=json')
})
