# Testing Automatizado - Weather CLI

Documentación del sistema de testing automatizado con Bun.js para el proyecto Weather CLI.

## Descripción General

Este proyecto implementa un suite completo de testing automatizado usando **Bun.js** y su framework nativo `bun:test`. Los tests se ubican en la carpeta `/test/` con una estructura paralela a `/src/`.

**Objetivos:**
- ✅ Cobertura mínima: 70% de líneas
- ✅ Build gate: No compilar si los tests fallan
- ✅ Tests inline sin archivos de fixtures
- ✅ Solo validar errores críticos (no warnings)

## Resultados

**Cobertura Actual:**
- **83.08%** de líneas
- **88.00%** de funciones
- **85 tests** pasando

## Estructura de Tests

```
test/
├── api/
│   ├── geocoding.test.ts       (8 tests)
│   └── weather.test.ts         (15 tests)
├── storage/
│   ├── citiesStorage.test.ts   (13 tests)
│   └── settingsStorage.test.ts (11 tests)
├── types/
│   └── city.test.ts            (7 tests)
├── utils/
│   ├── format.test.ts          (12 tests)
│   └── weatherCodes.test.ts    (6 tests)
└── actions/
    ├── toggleUnit.test.ts      (4 tests)
    ├── addCity.test.ts         (7 tests)
    ├── removeCity.test.ts      (2 tests)
    └── setDefaultCity.test.ts  (3 tests)
```

## Comandos

### Ejecutar Tests
```bash
bun test
```

Ejecuta todos los tests en `/test/**/*.test.ts`.

**Salida:**
```
 85 pass
 0 fail
 147 expect() calls
Ran 85 tests across 11 files. [18.00ms]
```

### Ver Cobertura
```bash
bun test --coverage
```

Muestra tabla detallada de cobertura por módulo.

**Salida:**
```
File                            | % Funcs | % Lines | Uncovered Line #s
─────────────────────────────────────────────────────────────────────
All files                       |   88.00 |   83.08 |
src/api/geocoding.ts           |  100.00 |  100.00 |
src/storage/citiesStorage.ts   |  100.00 |  100.00 |
...
```

### Compilar con Validación
```bash
bun run build
```

Ejecuta:
1. `bun test` - Si falla, detiene la compilación
2. `bun build ./src/index.ts ...` - Compila binario si tests pasan

**Orden de ejecución:**
```bash
$ bun run build
$ bun run test && bun build ./src/index.ts --compile --minify --outfile ./dist/weather
```

## Estrategia de Testing

### 1. Tests Puros (Sin Dependencias Externas)

- **types/city.test.ts**: Functions puras `cityKey()`, `cityLabel()`
- **utils/format.test.ts**: Formateo y conversión de datos
- **utils/weatherCodes.test.ts**: Mapeo de códigos WMO
- **storage/citiesStorage.test.ts**: Lógica de gestión de ciudades

### 2. Tests con Storage Temporal

- **storage/settingsStorage.test.ts**: Usa `WEATHER_CLI_CONFIG` apuntando a archivo temporal
- Cada test recibe una ruta única usando `${tmpdir()}/test-weather-${Date.now()}-${Math.random()}.json`
- Limpieza automática con `afterEach()`

### 3. Tests con Mock de Fetch

- **api/geocoding.test.ts**: Mock de `global.fetch` para OpenMeteo Geocoding API
- **api/weather.test.ts**: Mock de `global.fetch` para OpenMeteo Forecast API

**Patrón:**
```typescript
beforeEach(() => {
  originalFetch = global.fetch
})

afterEach(() => {
  global.fetch = originalFetch
})

test('nombre', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({ ... }), { status: 200 })
  
  const result = await functionUnderTest()
  expect(result).toBe(...)
})
```

### 4. Tests de Actions

- **actions/toggleUnit.test.ts**: Lógica de alternancia de unidades
- **actions/addCity.test.ts**: Búsqueda, validación, persistencia
- **actions/removeCity.test.ts**: Gestión de ciudades
- **actions/setDefaultCity.test.ts**: Cambio de ciudad default

Nota: La interactividad completa (funciones `ask()`, `pick()`) no está mockeada,
por lo que estos tests se enfocan en la lógica pura.

## Ejemplos

### Test Básico (Función Pura)
```typescript
import { test, expect } from 'bun:test'
import { unitLabel } from '../../src/utils/format.ts'

test('unitLabel - retorna °C para unidad C', () => {
  expect(unitLabel('C')).toBe('°C')
})
```

### Test con Storage Temporal
```typescript
import { beforeEach, afterEach } from 'bun:test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadConfig, saveConfig } from '../../src/storage/settingsStorage.ts'

let tempConfigPath: string

beforeEach(() => {
  tempConfigPath = join(tmpdir(), `test-weather-${Date.now()}.json`)
  process.env.WEATHER_CLI_CONFIG = tempConfigPath
})

afterEach(() => {
  delete process.env.WEATHER_CLI_CONFIG
})

test('saveConfig - persiste a archivo', async () => {
  const config = { cities: [], defaultCity: null, unit: 'C' }
  await saveConfig(config)
  const loaded = await loadConfig()
  expect(loaded.unit).toBe('C')
})
```

### Test con Mock de Fetch
```typescript
import { beforeEach, afterEach } from 'bun:test'
import { searchCities } from '../../src/api/geocoding.ts'

let originalFetch: typeof global.fetch

beforeEach(() => {
  originalFetch = global.fetch
})

afterEach(() => {
  global.fetch = originalFetch
})

test('searchCities - búsqueda exitosa', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        results: [{ name: 'Madrid', country: 'España', latitude: 40, longitude: -3 }]
      }),
      { status: 200 }
    )

  const result = await searchCities('Madrid')
  expect(result).toHaveLength(1)
})
```

## Cobertura Detallada

### ✅ Completamente Cubierto (100%)

- `src/api/geocoding.ts` - Búsqueda de ciudades
- `src/storage/citiesStorage.ts` - Gestión de lista de ciudades
- `src/storage/settingsStorage.ts` - Persistencia de configuración
- `src/types/City.ts` - Helpers cityKey(), cityLabel()
- `src/utils/format.ts` - Formateo de salida
- `src/utils/weatherCodes.ts` - Códigos WMO
- `src/utils/colors.ts` - ANSI colors
- `src/actions/toggleUnit.ts` - Toggle C/F

### ⚠️ Parcialmente Cubierto

- `src/api/weather.ts` (98.36%) - Una línea no cubierta en manejo de fallbacks
- `src/actions/removeCity.ts` (52.94%) - Requiere mock de `pick()`
- `src/actions/setDefaultCity.ts` (52.94%) - Requiere mock de `pick()`

### 🚫 No Cubierto (Fuera del Scope)

- `src/presentation/input.ts` (19.05%) - Módulo interactivo TTY
- `src/presentation/output.ts` (22.86%) - Renderizado UI

Estos módulos fueron excluidos del testing automatizado porque:
1. Requieren interacción de usuario (readline, stdin)
2. Dependen del estado del terminal (TTY)
3. Su testing sería más propicio para tests de integración/E2E

## Mantenimiento

### Agregar Nuevo Test

1. Crear archivo en `/test/` con estructura paralela a `/src/`
2. Nombrar como `<module>.test.ts`
3. Usar `import { test, expect } from 'bun:test'`
4. Ejecutar `bun test` para validar

### Actualizar Tests Existentes

- Los tests se recargan automáticamente si modificas `/src/` o `/test/`
- No necesitas compilar primero

### Mantener Cobertura

- No dejes que cobertura caiga por debajo de **70%**
- El `bun run build` forzará esto (falla si tests no pasan)
- Revisa `bun test --coverage` regularmente

## Troubleshooting

### "Error: Cannot use suite as a test"
**Causa:** Intentaste usar `test()` dentro de otro `test()`
**Solución:** Mueve el `test()` al nivel superior

### "Error: ERR_USE_AFTER_CLOSE" (en settingsStorage)
**Causa:** Problema con readline en stdin no-TTY (Bun 1.4 issue)
**Solución:** Ya está implementado - los tests usan archivos temporales, no stdin

### Tests lentos
**Causa:** Múltiples operaciones de I/O (Bun.file, Bun.write)
**Solución:** Es normal. Usa `beforeEach/afterEach` para compartir setup

## Referencias

- [Bun Documentation](https://bun.sh/)
- [bun:test API](https://bun.sh/docs/test/overview)
- [Expect API](https://bun.sh/docs/test/expect)

## Cambios en package.json

```json
{
  "scripts": {
    "test": "bun test test/**/*.test.ts",
    "test:coverage": "bun test test/**/*.test.ts --coverage",
    "build": "bun run test && bun build ./src/index.ts --compile --minify --outfile ./dist/weather"
  }
}
```

## Historial

- **2026-10-01**: Implementación inicial con 85 tests, 83.08% cobertura
