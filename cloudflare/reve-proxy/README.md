# Proxy seguro para Mapa REVE

Este Worker consulta la API externa de Mapa REVE sin exponer la API key en el frontend. La clave se guarda como secreto de Cloudflare con el nombre `MAPA_REVE_API_KEY` y el Worker añade internamente el header `x-api-key`.

Documentación oficial consultada: https://www.mapareve.es/docs/api/external/v1

## Endpoints identificados

La API externa documenta base URL `https://www.mapareve.es/api/external/v1` y autenticación con header `x-api-key`.

- `GET /locations`: lista Locations. Permite `date_from`, `party_id`, `cpo_id`, `only_dynamic_info`, `page`, `limit`. La respuesta documentada es un array: no incluye `total`, cursor ni enlaces `next/prev`.
- `GET /locations/{location_id}`: detalle de una Location.
- `GET /evses/{evse_id}`: detalle de un punto EVSE.
- `GET /evses/{evse_id}/status`: estado dinámico de un EVSE.
- `GET /evses/operational_status`: estados operacionales de puntos de recarga.
- `GET /connectors/tariffs`: tarifas dinámicas de conectores.
- `GET /cpos` y `GET /cpos/{party_id}`: operadores de carga.

La documentación no expone un endpoint nativo de búsqueda por coordenadas/radio ni filtros por municipio, provincia o bounding box. Por eso este proxy añade `GET /locations/nearby`, que consulta páginas de `/locations` y filtra por distancia usando Haversine.

Para evitar que cada usuario dispare una descarga masiva, el Worker usa una cache progresiva en Cloudflare KV:

- Guarda páginas de `/locations` en `REVE_DATASET`.
- Lee todas las páginas ya cacheadas para cada búsqueda por radio.
- Las búsquedas normales no consultan Mapa REVE si hay dataset KV; solo filtran los datos cacheados.
- Un Cron Trigger ejecuta el refresco una vez por hora.
- El refresco usa por defecto 2 páginas por ciclo horario, por debajo del límite oficial de 5 solicitudes/hora.
- Si aparecen errores upstream repetidos, reduce temporalmente el lote a 1 página y aplica backoff.
- La respuesta indica `datasetComplete`, `cacheStatus`, `lastDatasetRefresh`, `recordsFetched`, `resultsAfterDistanceFilter` y `dataLimitationMessage`.

Mientras `datasetComplete` no sea `true`, los resultados deben leerse como resultados disponibles dentro de los datos consultados, no como un reflejo exhaustivo del mapa oficial.

## Endpoints del proxy

Base local o desplegada:

```text
https://TU_WORKER.workers.dev
```

Rutas:

- `GET /health`
- `GET /locations/nearby?lat=40.4168&lon=-3.7038&radius_km=10&page=1&limit=100&max_pages=2`
- `GET /dataset/status`
- `GET /dataset-status`
- `GET /locations/{location_id}`
- `GET /evses/{evse_id}`
- `GET /evses/{evse_id}/status`
- `GET /evses/operational_status?page=1&limit=100`
- `GET /connectors/tariffs?page=1&limit=100`
- `GET /cpos?page=1&limit=100`
- `GET /cpos/{party_id}`

Parámetros principales:

- `lat`: latitud decimal entre `-90` y `90`.
- `lon`: longitud decimal entre `-180` y `180`.
- `radius_km`: radio entre `0.1` y `250`.
- `page`: entero desde `1`.
- `limit`: entero entre `1` y `100`.
- `max_pages`: entero entre `1` y `2` para consultas sin dataset KV. En la web publicada las búsquedas normales usan KV, por lo que este parámetro no dispara peticiones a Mapa REVE.
- `date_from`: fecha ISO 8601.
- `only_dynamic_info`: `true` o `false`.

## Seguridad aplicada

- Solo se permite `GET` para consultas y `OPTIONS` para preflight CORS.
- No se aceptan URLs arbitrarias ni parámetros de ruta sin validar.
- La API key solo se lee desde `env.MAPA_REVE_API_KEY`.
- El Worker no devuelve ni registra la API key.
- CORS se limita a `https://carloscplcht-beep.github.io`.
- Para desarrollo se permite `localhost`, `127.0.0.1` y `[::1]`.
- Los errores devueltos son genéricos y no incluyen cuerpo crudo de la API externa.
- Se usa caché de Cloudflare para reducir consumo de la cuota de Mapa REVE.
- Se guarda un contador horario en KV para no superar el límite prudente de 5 solicitudes/hora.
- El endpoint `/dataset-status` expone solo métricas operativas seguras: registros cacheados, cursor, errores y recomendación de acción.

## Estrategia de resiliencia REVE

- `currentBatchPages` empieza en `2`.
- Si hay 1 error upstream, conserva cursor y reintenta en el siguiente ciclo horario.
- Si hay 2 errores consecutivos, reduce `currentBatchPages` a `1`.
- Si hay 3 errores consecutivos, mantiene `currentBatchPages=1` y espera `nextAllowedRefreshAt` cuando procede.
- Si una página devuelve menos de 100 registros, marca `datasetComplete=true`.
- Si una página devuelve 0 registros, marca `datasetComplete=true`.
- Nunca borra el dataset existente por un error upstream.
- Nunca recalcula desde cero salvo que se haga una acción manual explícita fuera de la web.

El refresco manual `/admin/refresh-dataset` queda pendiente de forma deliberada. Para implementarlo con seguridad debe protegerse con un secreto independiente (`REVE_ADMIN_TOKEN`) y seguir respetando el límite horario.

## Crear y desplegar el Worker

1. Instala dependencias locales del Worker:

```powershell
npm install
```

2. Entra en esta carpeta:

```powershell
cd C:\Users\carlo\OneDrive\Carlos\Codex\me-compro-un-vehiculo-electrico\cloudflare\reve-proxy
```

3. Copia la configuración de ejemplo:

```powershell
Copy-Item wrangler.toml.example wrangler.toml
```

4. Inicia sesión en Cloudflare:

```powershell
wrangler login
```

5. Añade el secreto de forma interactiva. No lo guardes en ningún archivo:

```powershell
npm run secret:mapa-reve
```

6. Despliega:

```powershell
npm run deploy
```

## Desarrollo local

Para probar localmente sin subir secretos al repositorio:

1. Crea `.dev.vars` en esta carpeta.
2. Añade esta línea, sustituyendo el valor real:

```text
MAPA_REVE_API_KEY=valor_real_solo_local
```

3. Ejecuta:

```powershell
npm run dev
```

`.dev.vars` está ignorado por Git.

## Ejemplos de prueba

Healthcheck:

```powershell
curl.exe "http://localhost:8787/health"
```

Búsqueda por radio usando cache compartida si `REVE_DATASET` está configurado:

```powershell
curl.exe "http://localhost:8787/locations/nearby?lat=40.4168&lon=-3.7038&radius_km=20&page=1&limit=100&max_pages=2"
```

Detalle de Location:

```powershell
curl.exe "http://localhost:8787/locations/LOCATION_ID"
```

Estado de EVSE:

```powershell
curl.exe "http://localhost:8787/evses/EVSE_ID/status"
```

Tarifas de conectores:

```powershell
curl.exe "http://localhost:8787/connectors/tariffs?page=1&limit=100"
```

## Conectar la web con el Worker

La web consulta el proxy desde `reve-map.js`. Por defecto usa:

```text
https://mapa-reve-proxy.carlospenalaguna.workers.dev
```

Si Cloudflare te da otro dominio, cambia la constante `DEFAULT_PROXY_URL` en `reve-map.js`. No uses un script inline para configurarlo, porque la CSP de la web bloquea scripts inline por seguridad.

No pongas nunca la API key en `reve-map.js`, `index.html` ni ningún archivo estático. El navegador debe llamar únicamente al Worker.

## Pruebas manuales documentadas

Consulta correcta:

- Ejecuta `/health`.
- Ejecuta `/locations/nearby` con `lat`, `lon`, `radius_km`, `page` y `limit` válidos.
- Resultado esperado: JSON con `data` y `meta`, sin cabeceras ni campos que contengan la API key.

Parámetros inválidos:

- Ejecuta `/locations/nearby?lat=abc&lon=-3.7038&radius_km=10`.
- Resultado esperado: HTTP `400` con `error.code = invalid_parameter`.

Error de API:

- Ejecuta una consulta real sin configurar `MAPA_REVE_API_KEY`.
- Resultado esperado: HTTP `500` con `error.code = missing_secret`.
- Si Mapa REVE devuelve límite de cuota, resultado esperado: error seguro indicando límite de solicitudes.

CORS:

- Desde `https://carloscplcht-beep.github.io`, una petición `fetch` debe recibir `Access-Control-Allow-Origin` con ese origen.
- Desde un dominio no autorizado, debe devolver `403` o no exponer una respuesta usable por CORS.
- Desde `http://localhost:8787` o un frontend local, debe permitirse para desarrollo.

Ausencia de API key en Network:

- Abre DevTools en el navegador.
- Lanza una petición del frontend al Worker, no directamente a Mapa REVE.
- Verifica que la request del navegador no contiene `x-api-key`.
- Verifica que la response del Worker no contiene `MAPA_REVE_API_KEY` ni el valor de la clave.
- Verifica que no existe ningún archivo `service-account.json`, `.dev.vars`, `.env`, `keystore.properties`, `*.jks` o `*.keystore` subido al repositorio.
