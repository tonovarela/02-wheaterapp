## Weather CLI APP

El objetivo de esta aplicación es que creemos una aplicación de consola que pida que ingresemos la ciudad, Al final, generaremos un binario ejecutable.

### Opciones:

- Ingresar el nombre de una ciudad.
- Guardar la ciudad por defecto.
- Registrar varias otras ciudades para buscar el clima en esas otras ciudades.

## Stack

- Bun.js
- OpenMeteo

## Ejemplo de petición http:

1. Paso 1: Geocoding API.
2. Paso 2: OpenMeteo API.

```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7
```

## Inicializar proyecto

```bash
bun init
```

### Ejemplo del menú
Esta es la apariencia que deseamos crear

```bash
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Pronóstico 7 días
  8. Ajustes (°C)
  9. Salir
════════════════════════════════════════
  Selecciona una opción: 5
```

## Uso

```bash
bun install          # instalar dependencias
bun start            # ejecutar la app
bun test             # correr las pruebas
bun run typecheck    # verificar tipos
bun run build        # generar el binario en ./dist/weather
```

El binario es autocontenido: `./dist/weather` se puede copiar a cualquier parte
(por ejemplo `/usr/local/bin/weather`) y ejecutar sin tener Bun instalado.

## Persistencia

Las ciudades, la ciudad default y la unidad (°C/°F) se guardan en
`~/.weather-cli.json`. La variable de entorno `WEATHER_CLI_CONFIG` permite
apuntar a otra ruta (se usa en las pruebas).

## Estructura

La estructura detallada vive en [`docs/file-system.md`](docs/file-system.md).

```
src/
├── actions/            acciones del menú
│   ├── getWeather.ts       clima de la ciudad default
│   ├── listCities.ts       clima de todas las ciudades
│   ├── getForecast.ts      pronóstico de 7 días
│   ├── addCity.ts          buscar y agregar una ciudad
│   ├── removeCity.ts       eliminar una ciudad
│   ├── setDefaultCity.ts   cambiar la ciudad default
│   └── toggleUnit.ts       alternar °C/°F
├── presentation/       interacción con la consola
│   ├── menu.ts             bucle del menú y render de opciones
│   ├── output.ts           mensajes y tarjetas de clima
│   └── input.ts            lectura y validación de stdin
├── storage/            datos locales (~/.weather-cli.json)
│   ├── citiesStorage.ts    operaciones sobre la lista de ciudades
│   └── settingsStorage.ts  carga/guardado de la config
├── types/              contratos globales (City, Config, Weather, MenuOption)
├── api/                clientes de OpenMeteo (geocoding.ts, weather.ts)
├── utils/              helpers (colors, format, constants, weatherCodes)
└── index.ts            punto de entrada
```
