const REVE_BASE_URL = "https://www.mapareve.es/api/external/v1";
const PRODUCTION_ORIGIN = "https://carloscplcht-beep.github.io";
const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

const CACHE_TTL_SECONDS = {
  nearby: 30 * 60,
  location: 60 * 60,
  evse: 15 * 60,
  status: 5 * 60,
  tariffs: 10 * 60,
  operationalStatus: 5 * 60,
  cpos: 60 * 60,
};

const ID_PATTERN = /^[A-Za-z0-9._:-]{1,160}$/;
const PARTY_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      if (error instanceof PublicError) {
        return safeJson(error, error.status, request);
      }

      return safeJson(
        { error: { code: "internal_error", message: "No se ha podido procesar la solicitud." } },
        500,
        request,
      );
    }
  },
};

async function handleRequest(request, env, ctx) {
  if (request.method === "OPTIONS") {
    return handlePreflight(request);
  }

  if (request.method !== "GET") {
    return safeJson(
      { error: { code: "method_not_allowed", message: "Este proxy solo acepta peticiones GET." } },
      405,
      request,
      { Allow: "GET, OPTIONS" },
    );
  }

  const originCheck = validateOrigin(request);
  if (!originCheck.ok) {
    return safeJson(
      { error: { code: "cors_forbidden", message: "Origen no autorizado para consultar el proxy." } },
      403,
      request,
    );
  }

  if (!env.MAPA_REVE_API_KEY) {
    return safeJson(
      { error: { code: "missing_secret", message: "El proxy no tiene configurado el secreto de API." } },
      500,
      request,
    );
  }

  const url = new URL(request.url);
  const route = normalizeRoute(url.pathname);

  if (route === "/health") {
    rejectUnknownParams(url, []);
    return safeJson({ ok: true, service: "mapa-reve-proxy" }, 200, request);
  }

  if (route === "/locations/nearby") {
    rejectUnknownParams(url, [
      "lat",
      "lon",
      "radius_km",
      "page",
      "limit",
      "max_pages",
      "date_from",
      "party_id",
      "cpo_id",
      "only_dynamic_info",
    ]);
    return handleNearbyLocations(url, request, env, ctx);
  }

  const locationMatch = route.match(/^\/locations\/([^/]+)$/);
  if (locationMatch) {
    rejectUnknownParams(url, []);
    const locationId = validateId(decodeURIComponent(locationMatch[1]), "location_id");
    return proxyReveJson(`/locations/${encodeURIComponent(locationId)}`, {}, request, env, ctx, CACHE_TTL_SECONDS.location);
  }

  const evseStatusMatch = route.match(/^\/evses\/([^/]+)\/status$/);
  if (evseStatusMatch) {
    rejectUnknownParams(url, []);
    const evseId = validateId(decodeURIComponent(evseStatusMatch[1]), "evse_id");
    return proxyReveJson(`/evses/${encodeURIComponent(evseId)}/status`, {}, request, env, ctx, CACHE_TTL_SECONDS.status);
  }

  const evseMatch = route.match(/^\/evses\/([^/]+)$/);
  if (evseMatch) {
    rejectUnknownParams(url, []);
    const evseId = validateId(decodeURIComponent(evseMatch[1]), "evse_id");
    return proxyReveJson(`/evses/${encodeURIComponent(evseId)}`, {}, request, env, ctx, CACHE_TTL_SECONDS.evse);
  }

  if (route === "/evses/operational_status") {
    rejectUnknownParams(url, ["date_from", "page", "limit"]);
    const params = pickListParams(url, { allowDateFrom: true });
    return proxyReveJson("/evses/operational_status", params, request, env, ctx, CACHE_TTL_SECONDS.operationalStatus);
  }

  if (route === "/connectors/tariffs") {
    rejectUnknownParams(url, ["date_from", "page", "limit"]);
    const params = pickListParams(url, { allowDateFrom: true });
    return proxyReveJson("/connectors/tariffs", params, request, env, ctx, CACHE_TTL_SECONDS.tariffs);
  }

  if (route === "/cpos") {
    rejectUnknownParams(url, ["date_from", "page", "limit"]);
    const params = pickListParams(url, { allowDateFrom: true });
    return proxyReveJson("/cpos", params, request, env, ctx, CACHE_TTL_SECONDS.cpos);
  }

  const cpoMatch = route.match(/^\/cpos\/([^/]+)$/);
  if (cpoMatch) {
    rejectUnknownParams(url, []);
    const partyId = validatePartyId(decodeURIComponent(cpoMatch[1]));
    return proxyReveJson(`/cpos/${encodeURIComponent(partyId)}`, {}, request, env, ctx, CACHE_TTL_SECONDS.cpos);
  }

  return safeJson(
    { error: { code: "not_found", message: "Ruta no disponible en este proxy." } },
    404,
    request,
  );
}

async function handleNearbyLocations(url, request, env, ctx) {
  const lat = parseCoordinate(url.searchParams.get("lat"), -90, 90, "lat");
  const lon = parseCoordinate(url.searchParams.get("lon"), -180, 180, "lon");
  const radiusKm = parseNumber(url.searchParams.get("radius_km"), "radius_km", { min: 0.1, max: 250, defaultValue: 10 });
  const page = parseInteger(url.searchParams.get("page"), "page", { min: 1, max: 100000, defaultValue: 1 });
  const limit = parseInteger(url.searchParams.get("limit"), "limit", { min: 1, max: 100, defaultValue: 100 });
  const maxPages = parseInteger(url.searchParams.get("max_pages"), "max_pages", { min: 1, max: 5, defaultValue: 1 });

  const sharedParams = pickListParams(url, {
    allowDateFrom: true,
    allowParty: true,
    allowCpo: true,
    allowDynamicOnly: true,
  });

  const locations = [];
  const pagesFetched = [];

  for (let offset = 0; offset < maxPages; offset += 1) {
    const currentPage = page + offset;
    const upstreamParams = { ...sharedParams, page: String(currentPage), limit: String(limit) };
    const upstreamData = await fetchReveJson("/locations", upstreamParams, request, env, ctx, CACHE_TTL_SECONDS.nearby);
    const pageItems = Array.isArray(upstreamData) ? upstreamData : [];
    pagesFetched.push({ page: currentPage, count: pageItems.length });

    for (const location of pageItems) {
      const point = getLocationPoint(location);
      if (!point) continue;

      const distanceKm = haversineKm(lat, lon, point.lat, point.lon);
      if (distanceKm <= radiusKm) {
        locations.push({ ...location, distance_km: round(distanceKm, 3) });
      }
    }
  }

  locations.sort((a, b) => a.distance_km - b.distance_km);

  return safeJson(
    {
      data: locations,
      meta: {
        lat,
        lon,
        radius_km: radiusKm,
        page,
        limit,
        max_pages: maxPages,
        pages_fetched: pagesFetched,
        result_count: locations.length,
        source: "Mapa REVE /locations filtrado por el proxy",
        note: "La API externa no expone búsqueda nativa por radio; el proxy filtra las páginas solicitadas de /locations.",
      },
    },
    200,
    request,
    { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS.nearby}` },
  );
}

async function proxyReveJson(path, params, request, env, ctx, ttlSeconds) {
  const data = await fetchReveJson(path, params, request, env, ctx, ttlSeconds);
  return safeJson(data, 200, request, { "Cache-Control": `public, max-age=${ttlSeconds}` });
}

async function fetchReveJson(path, params, request, env, ctx, ttlSeconds) {
  const upstreamUrl = new URL(`${REVE_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  const cacheKey = new Request(upstreamUrl.toString(), { method: "GET" });
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached.json();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": env.MAPA_REVE_API_KEY,
    },
  });

  if (!upstreamResponse.ok) {
    throw new PublicError(
      "upstream_error",
      upstreamResponse.status === 429
        ? "Mapa REVE ha indicado límite de solicitudes. Inténtalo más tarde."
        : "Mapa REVE no ha devuelto una respuesta válida.",
      upstreamResponse.status,
    );
  }

  const data = await upstreamResponse.json();
  const cacheResponse = new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${ttlSeconds}`,
    },
  });
  ctx.waitUntil(caches.default.put(cacheKey, cacheResponse.clone()));
  return data;
}

function normalizeRoute(pathname) {
  let path = pathname.replace(/^\/+/, "/").replace(/\/+$/, "");
  if (path === "") return "/";
  if (path.startsWith("/api/reve")) path = path.slice("/api/reve".length) || "/";
  return path;
}

function pickListParams(url, options = {}) {
  const params = {
    page: String(parseInteger(url.searchParams.get("page"), "page", { min: 1, max: 100000, defaultValue: 1 })),
    limit: String(parseInteger(url.searchParams.get("limit"), "limit", { min: 1, max: 100, defaultValue: 100 })),
  };

  if (options.allowDateFrom && url.searchParams.has("date_from")) {
    params.date_from = validateDateFrom(url.searchParams.get("date_from"));
  }
  if (options.allowParty && url.searchParams.has("party_id")) {
    params.party_id = validatePartyId(url.searchParams.get("party_id"));
  }
  if (options.allowCpo && url.searchParams.has("cpo_id")) {
    params.cpo_id = validateId(url.searchParams.get("cpo_id"), "cpo_id");
  }
  if (options.allowDynamicOnly && url.searchParams.has("only_dynamic_info")) {
    params.only_dynamic_info = validateBoolean(url.searchParams.get("only_dynamic_info"), "only_dynamic_info");
  }

  return params;
}

function rejectUnknownParams(url, allowedParams) {
  const allowed = new Set(allowedParams);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key)) {
      throw new PublicError("invalid_parameter", `El parámetro ${key} no está permitido en esta ruta.`, 400);
    }
  }
}

function parseCoordinate(value, min, max, name) {
  return parseNumber(value, name, { min, max, required: true });
}

function parseNumber(value, name, { min, max, defaultValue, required = false }) {
  if ((value === null || value === "") && !required) return defaultValue;
  if (value === null || value === "") throw new PublicError("invalid_parameter", `Falta el parámetro ${name}.`, 400);

  const normalized = String(value).trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new PublicError("invalid_parameter", `El parámetro ${name} debe ser numérico.`, 400);
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new PublicError("invalid_parameter", `El parámetro ${name} debe estar entre ${min} y ${max}.`, 400);
  }
  return parsed;
}

function parseInteger(value, name, { min, max, defaultValue }) {
  if (value === null || value === "") return defaultValue;
  if (!/^\d+$/.test(String(value))) {
    throw new PublicError("invalid_parameter", `El parámetro ${name} debe ser un entero positivo.`, 400);
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new PublicError("invalid_parameter", `El parámetro ${name} debe estar entre ${min} y ${max}.`, 400);
  }
  return parsed;
}

function validateId(value, name) {
  if (!value || !ID_PATTERN.test(value)) {
    throw new PublicError("invalid_parameter", `El parámetro ${name} no tiene un formato válido.`, 400);
  }
  return value;
}

function validatePartyId(value) {
  if (!value || !PARTY_ID_PATTERN.test(value)) {
    throw new PublicError("invalid_parameter", "El parámetro party_id no tiene un formato válido.", 400);
  }
  return value;
}

function validateDateFrom(value) {
  if (!value || Number.isNaN(Date.parse(value))) {
    throw new PublicError("invalid_parameter", "El parámetro date_from debe ser una fecha ISO 8601 válida.", 400);
  }
  return value;
}

function validateBoolean(value, name) {
  if (value === "true" || value === "false") return value;
  throw new PublicError("invalid_parameter", `El parámetro ${name} debe ser true o false.`, 400);
}

function getLocationPoint(location) {
  const coordinates = location?.coordinates;
  if (!coordinates?.latitude || !coordinates?.longitude) return null;
  const lat = Number(String(coordinates.latitude).replace(",", "."));
  const lon = Number(String(coordinates.longitude).replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function round(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function validateOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return { ok: true, origin: null };
  if (origin === PRODUCTION_ORIGIN || LOCALHOST_ORIGIN_PATTERN.test(origin)) return { ok: true, origin };
  return { ok: false, origin };
}

function handlePreflight(request) {
  const originCheck = validateOrigin(request);
  if (!originCheck.ok) {
    return safeJson(
      { error: { code: "cors_forbidden", message: "Origen no autorizado para consultar el proxy." } },
      403,
      request,
    );
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    }),
  });
}

function safeJson(body, status, request, extraHeaders = {}) {
  const payload =
    body instanceof PublicError
      ? { error: { code: body.code, message: body.publicMessage } }
      : body;

  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders(request, {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    }),
  });
}

function corsHeaders(request, extraHeaders = {}) {
  const originCheck = validateOrigin(request);
  const headers = { ...extraHeaders, Vary: "Origin" };
  if (originCheck.ok && originCheck.origin) {
    headers["Access-Control-Allow-Origin"] = originCheck.origin;
  }
  return headers;
}

class PublicError extends Error {
  constructor(code, publicMessage, status = 400) {
    super(publicMessage);
    this.name = "PublicError";
    this.code = code;
    this.publicMessage = publicMessage;
    this.status = status;
  }
}
