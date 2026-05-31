# Proxy seguro para Mapa REVE

Este Worker consulta la API externa de Mapa REVE sin exponer la API key en el frontend. La clave se guarda como secreto de Cloudflare con el nombre `MAPA_REVE_API_KEY` y el Worker añade internamente el header `x-api-key`.

Documentación oficial consultada: https://www.mapareve.es/docs/api/external/v1

## Endpoints identificados

La API externa documenta base URL `https://www.mapareve.es/api/external/v1` y autenticación con header `x-api-key`.

- `GET /locations`: lista Locations. Permite `date_from`, `party_id`, `cpo_id`, `only_dynamic_info`, `page`, `limit`.
- `GET /locations/{location_id}`: detalle de una Location.
- `GET /evses/{evse_id}`: detalle de un punto EVSE.
- `GET /evses/{evse_id}/status`: estado dinámico de un EVSE.
- `GET /evses/operational_status`: estados operacionales de puntos de recarga.
- `GET /connectors/tariffs`: tarifas dinámicas de conectores.
- `GET /cpos` y `GET /cpos/{party_id}`: operadores de carga.

La documentación no expone un endpoint nativo de búsqueda por coordenadas/radio. Por eso este proxy añade `GET /locations/nearby`, que consulta páginas de `/locations` y filtra por distancia usando Haversine. Es útil para una primera fase, pero no debe tratarse como búsqueda global exhaustiva si no se recorren suficientes páginas.

## Endpoints del proxy

Base local o desplegada:

```text
https://TU_WORKER.workers.dev
```

Rutas:

- `GET /health`
- `GET /locations/nearby?lat=40.4168&lon=-3.7038&radius_km=10&page=1&limit=100&max_pages=1`
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
- `max_pages`: entero entre `1` y `5`. Cada página puede consumir una petición upstream si no está cacheada.
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

Búsqueda por radio sobre la primera página de Locations:

```powershell
curl.exe "http://localhost:8787/locations/nearby?lat=40.4168&lon=-3.7038&radius_km=20&page=1&limit=100&max_pages=1"
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
