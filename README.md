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

```
index.ts                  punto de entrada
src/api.ts                clientes de Geocoding y Forecast (OpenMeteo)
src/storage.ts            carga/guardado de la config y operaciones sobre ciudades
src/menu.ts               bucle del menú y manejo de cada opción
src/prompt.ts             lectura de líneas desde stdin
src/ui.ts                 colores y render del menú / tarjetas de clima
src/weather-codes.ts      códigos WMO -> descripción e ícono
src/types.ts              tipos compartidos
```
