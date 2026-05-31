const REVE_BASE_URL = "https://www.mapareve.es/api/external/v1";
const PRODUCTION_ORIGIN = "https://carloscplcht-beep.github.io";
const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

const CACHE_TTL_SECONDS = {
  nearby: 6 * 60 * 60,
  location: 60 * 60,
  evse: 15 * 60,
  status: 5 * 60,
  tariffs: 10 * 60,
  operationalStatus: 5 * 60,
  cpos: 60 * 60,
};

const DATASET_CACHE = {
  metaKey: "locations:v2:meta",
  pageKeyPrefix: "locations:v2:page:",
  lockKey: "locations:v2:refresh-lock",
  rateKey: "locations:v2:hourly-requests",
  limit: 100,
  maxPages: 50,
  defaultBatchPages: 2,
  minimumBatchPages: 1,
  hourlyRequestLimit: 5,
  staleAfterMs: 12 * 60 * 60 * 1000,
  lockTtlSeconds: 10 * 60,
  backoffAfterErrors: 3,
  backoffMs: 2 * 60 * 60 * 1000,
};

const ID_PATTERN = /^[A-Za-z0-9._:-]{1,160}$/;
const PARTY_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      if (error instanceof PublicError) return safeJson(error, error.status, request);
      return safeJson(
        { error: { code: "internal_error", message: "No se ha podido procesar la solicitud." } },
        500,
        request,
      );
    }
  },

  async scheduled(event, env, ctx) {
    if (!env.MAPA_REVE_API_KEY || !env.REVE_DATASET) return;
    ctx.waitUntil(refreshDatasetBatch(env, ctx, new Request("https://internal.worker/scheduled-refresh"), { source: "scheduled" }));
  },
};

async function handleRequest(request, env, ctx) {
  if (request.method === "OPTIONS") return handlePreflight(request);

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

  if (route === "/dataset/status" || route === "/dataset-status") {
    rejectUnknownParams(url, []);
    return handleDatasetStatus(request, env);
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

  return safeJson({ error: { code: "not_found", message: "Ruta no disponible en este proxy." } }, 404, request);
}

async function handleNearbyLocations(url, request, env, ctx) {
  const lat = parseCoordinate(url.searchParams.get("lat"), -90, 90, "lat");
  const lon = parseCoordinate(url.searchParams.get("lon"), -180, 180, "lon");
  const radiusKm = parseNumber(url.searchParams.get("radius_km"), "radius_km", { min: 0.1, max: 250, defaultValue: 10 });
  const page = parseInteger(url.searchParams.get("page"), "page", { min: 1, max: 100000, defaultValue: 1 });
  const limit = parseInteger(url.searchParams.get("limit"), "limit", { min: 1, max: 100, defaultValue: 100 });
  const maxPages = parseInteger(url.searchParams.get("max_pages"), "max_pages", { min: 1, max: DATASET_CACHE.defaultBatchPages, defaultValue: 1 });

  const canUseDataset =
    env.REVE_DATASET &&
    !url.searchParams.has("date_from") &&
    !url.searchParams.has("party_id") &&
    !url.searchParams.has("cpo_id") &&
    !url.searchParams.has("only_dynamic_info");

  if (canUseDataset) {
    return handleNearbyLocationsFromDataset({ lat, lon, radiusKm, page }, request, env, ctx);
  }

  const sharedParams = pickListParams(url, {
    allowDateFrom: true,
    allowParty: true,
    allowCpo: true,
    allowDynamicOnly: true,
  });
  const scanned = await scanLocationsWindow({ lat, lon, radiusKm, page, limit, maxPages }, sharedParams, request, env, ctx);

  return safeJson(
    buildNearbyPayload(scanned.locations, {
      lat,
      lon,
      radiusKm,
      page,
      limit,
      maxPages,
      pagesFetched: scanned.pagesFetched,
      recordsChecked: scanned.recordsChecked,
      recordsWithCoordinates: scanned.recordsWithCoordinates,
      recordsWithoutCoordinates: scanned.recordsWithoutCoordinates,
      stoppedBecauseLastPage: scanned.stoppedBecauseLastPage,
      cacheStatus: "bypass",
      datasetComplete: false,
      lastDatasetRefresh: null,
      dataLimitationMessage: "La API externa no permite busqueda geografica directa; esta respuesta usa una ventana paginada limitada.",
    }),
    200,
    request,
    { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS.nearby}` },
  );
}

async function handleNearbyLocationsFromDataset(options, request, env, ctx) {
  const dataset = await getLocationsDataset(env, ctx, request);
  const locations = filterLocationsByDistance(dataset.locations, options.lat, options.lon, options.radiusKm);

  return safeJson(
    buildNearbyPayload(locations, {
      lat: options.lat,
      lon: options.lon,
      radiusKm: options.radiusKm,
      page: options.page,
      limit: DATASET_CACHE.limit,
      maxPages: dataset.meta.pagesCached || 0,
      pagesFetched: dataset.pagesFetched,
      recordsChecked: dataset.recordsFetched,
      recordsWithCoordinates: dataset.recordsWithCoordinates,
      recordsWithoutCoordinates: dataset.recordsWithoutCoordinates,
      stoppedBecauseLastPage: Boolean(dataset.meta.complete),
      cacheStatus: dataset.cacheStatus,
      datasetComplete: dataset.meta.complete ? true : false,
      lastDatasetRefresh: dataset.meta.lastRefresh || null,
      dataLimitationMessage: dataset.meta.complete
        ? null
        : "La API externa no permite busqueda geografica directa. Los resultados se calculan sobre los datos disponibles consultados y pueden no coincidir exactamente con el mapa oficial.",
    }),
    200,
    request,
    { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS.nearby}` },
  );
}

async function getLocationsDataset(env, ctx, request) {
  const rawMeta = await env.REVE_DATASET.get(DATASET_CACHE.metaKey, "json");
  let meta = normalizeDatasetMeta(rawMeta);

  const isStale = !meta.lastRefresh || Date.now() - Date.parse(meta.lastRefresh) > DATASET_CACHE.staleAfterMs;
  const pages = await readDatasetPages(env, meta.pagesCached);

  const locations = [];
  const pagesFetched = [];
  let recordsWithCoordinates = 0;
  let recordsWithoutCoordinates = 0;

  pages.forEach((items, index) => {
    pagesFetched.push({ page: index + 1, count: items.length, source: "kv" });
    items.forEach((location) => {
      const point = getLocationPoint(location);
      if (point) recordsWithCoordinates += 1;
      else recordsWithoutCoordinates += 1;
      locations.push(location);
    });
  });

  return {
    locations,
    meta,
    pagesFetched,
    recordsFetched: locations.length,
    recordsWithCoordinates,
    recordsWithoutCoordinates,
    cacheStatus: rawMeta ? (isStale ? "stale" : "hit") : "miss",
  };
}

async function refreshDatasetBatch(env, ctx, request, options = {}) {
  const lockValue = await env.REVE_DATASET.get(DATASET_CACHE.lockKey);
  if (lockValue) {
    return normalizeDatasetMeta(await env.REVE_DATASET.get(DATASET_CACHE.metaKey, "json"));
  }

  await env.REVE_DATASET.put(DATASET_CACHE.lockKey, new Date().toISOString(), { expirationTtl: DATASET_CACHE.lockTtlSeconds });
  let activeMeta = normalizeDatasetMeta(options.meta || await env.REVE_DATASET.get(DATASET_CACHE.metaKey, "json"));
  let failedPage = activeMeta.nextPage || activeMeta.pagesCached + 1 || 1;
  try {
    let meta = activeMeta;
    if (meta.complete) {
      const completedMeta = {
        ...meta,
        lastRefreshStatus: "complete",
        currentBatchPages: DATASET_CACHE.minimumBatchPages,
      };
      await env.REVE_DATASET.put(DATASET_CACHE.metaKey, JSON.stringify(completedMeta));
      return completedMeta;
    }

    if (isRefreshBlockedByBackoff(meta)) return meta;

    const currentBatchPages = getCurrentBatchPages(meta);
    const startPage = meta.nextPage || meta.pagesCached + 1 || 1;
    const endPage = Math.min(startPage + currentBatchPages - 1, DATASET_CACHE.maxPages);
    let pagesCached = meta.pagesCached;
    let recordsFetched = meta.recordsFetched;
    let complete = false;

    for (let page = startPage; page <= endPage; page += 1) {
      failedPage = page;
      const upstreamData = await fetchReveJson(
        "/locations",
        { page: String(page), limit: String(DATASET_CACHE.limit) },
        request,
        env,
        ctx,
        CACHE_TTL_SECONDS.nearby,
      );
      const pageItems = Array.isArray(upstreamData) ? upstreamData : [];
      await env.REVE_DATASET.put(`${DATASET_CACHE.pageKeyPrefix}${page}`, JSON.stringify(pageItems));
      pagesCached = Math.max(pagesCached, page);
      recordsFetched += pageItems.length;

      if (pageItems.length === 0 || pageItems.length < DATASET_CACHE.limit) {
        complete = true;
        break;
      }
    }

    const newMeta = {
      ...meta,
      version: 2,
      limit: DATASET_CACHE.limit,
      maxPages: DATASET_CACHE.maxPages,
      batchPages: DATASET_CACHE.defaultBatchPages,
      pagesCached,
      recordsFetched,
      complete,
      reachedConfiguredLimit: pagesCached >= DATASET_CACHE.maxPages && !complete,
      nextPage: complete ? pagesCached : pagesCached + 1,
      lastRefresh: new Date().toISOString(),
      lastError: null,
      lastRefreshStatus: "success",
      lastUpstreamStatus: 200,
      lastUpstreamErrorType: null,
      lastFailedPage: null,
      lastFailedRefresh: null,
      consecutiveUpstreamErrors: 0,
      nextAllowedRefreshAt: null,
      currentBatchPages: DATASET_CACHE.defaultBatchPages,
    };
    await env.REVE_DATASET.put(DATASET_CACHE.metaKey, JSON.stringify(newMeta));
    return newMeta;
  } catch (error) {
    const meta = normalizeDatasetMeta(await env.REVE_DATASET.get(DATASET_CACHE.metaKey, "json")) || activeMeta;
    const consecutiveUpstreamErrors = (meta.consecutiveUpstreamErrors || 0) + 1;
    const nextAllowedRefreshAt = getNextAllowedRefreshAt(error, consecutiveUpstreamErrors);
    const failedMeta = {
      ...meta,
      lastError: error instanceof PublicError ? error.code : "refresh_failed",
      lastRefreshStatus: "error",
      lastUpstreamStatus: error instanceof PublicError ? error.upstreamStatus || error.status : null,
      lastUpstreamErrorType: error instanceof PublicError ? error.upstreamErrorType || error.code : "refresh_failed",
      lastFailedPage: failedPage,
      lastFailedRefresh: new Date().toISOString(),
      consecutiveUpstreamErrors,
      nextAllowedRefreshAt,
      currentBatchPages: consecutiveUpstreamErrors >= 2 ? DATASET_CACHE.minimumBatchPages : getCurrentBatchPages(meta),
    };
    await env.REVE_DATASET.put(DATASET_CACHE.metaKey, JSON.stringify(failedMeta));
    return failedMeta;
  } finally {
    await env.REVE_DATASET.delete(DATASET_CACHE.lockKey);
  }
}

async function readDatasetPages(env, pagesCached) {
  const pages = [];
  for (let page = 1; page <= pagesCached; page += 1) {
    const items = await env.REVE_DATASET.get(`${DATASET_CACHE.pageKeyPrefix}${page}`, "json");
    pages.push(Array.isArray(items) ? items : []);
  }
  return pages;
}

function normalizeDatasetMeta(meta) {
  if (!meta || typeof meta !== "object") {
    return {
      version: 2,
      limit: DATASET_CACHE.limit,
      maxPages: DATASET_CACHE.maxPages,
      batchPages: DATASET_CACHE.defaultBatchPages,
      pagesCached: 0,
      recordsFetched: 0,
      complete: false,
      reachedConfiguredLimit: false,
      nextPage: 1,
      lastRefresh: null,
      lastRefreshStatus: "empty",
      lastUpstreamStatus: null,
      lastUpstreamErrorType: null,
      lastFailedPage: null,
      lastFailedRefresh: null,
      consecutiveUpstreamErrors: 0,
      nextAllowedRefreshAt: null,
      currentBatchPages: DATASET_CACHE.defaultBatchPages,
    };
  }
  return {
    ...meta,
    batchPages: DATASET_CACHE.defaultBatchPages,
    pagesCached: Number(meta.pagesCached) || 0,
    recordsFetched: Number(meta.recordsFetched) || 0,
    nextPage: Number(meta.nextPage) || (Number(meta.pagesCached) || 0) + 1,
    complete: meta.complete === true,
    consecutiveUpstreamErrors: Number(meta.consecutiveUpstreamErrors) || 0,
    currentBatchPages: Number(meta.currentBatchPages) || DATASET_CACHE.defaultBatchPages,
  };
}

async function handleDatasetStatus(request, env) {
  const meta = env.REVE_DATASET ? normalizeDatasetMeta(await env.REVE_DATASET.get(DATASET_CACHE.metaKey, "json")) : null;
  const isStale = meta?.lastRefresh ? Date.now() - Date.parse(meta.lastRefresh) > DATASET_CACHE.staleAfterMs : true;
  return safeJson(
    {
      ok: true,
      kvAvailable: Boolean(env.REVE_DATASET),
      datasetComplete: meta?.complete === true,
      recordsCached: meta?.recordsFetched || 0,
      pagesCached: meta?.pagesCached || 0,
      nextPageToFetch: meta?.complete ? null : meta?.nextPage || 1,
      lastRefreshAt: meta?.lastRefresh || null,
      lastRefreshStatus: meta?.lastRefreshStatus || (meta?.lastError ? "error" : meta?.lastRefresh ? "success" : "unknown"),
      lastUpstreamStatus: meta?.lastUpstreamStatus || null,
      lastUpstreamErrorType: meta?.lastUpstreamErrorType || meta?.lastError || null,
      lastFailedPage: meta?.lastFailedPage || null,
      lastFailedRefresh: meta?.lastFailedRefresh || null,
      consecutiveUpstreamErrors: meta?.consecutiveUpstreamErrors || 0,
      currentBatchPages: getCurrentBatchPages(meta),
      hourlyRequestLimit: DATASET_CACHE.hourlyRequestLimit,
      estimatedRecordsPerHour: getCurrentBatchPages(meta) * DATASET_CACHE.limit,
      nextAllowedRefreshAt: meta?.nextAllowedRefreshAt || null,
      cacheStatus: meta ? (isStale ? "stale" : "hit") : "miss",
      limitationMessage: meta?.complete
        ? null
        : "La API externa no permite busqueda geografica directa. Los resultados se calculan sobre los datos disponibles en cache y pueden no coincidir exactamente con el mapa oficial.",
      recommendedAction: getDatasetRecommendedAction(meta),
      meta,
      strategy: "KV progressive cache over /locations pages; normal searches only filter cached dataset by distance. Cron warms the dataset with conservative backoff.",
    },
    200,
    request,
  );
}

async function scanLocationsWindow({ lat, lon, radiusKm, page, limit, maxPages }, sharedParams, request, env, ctx) {
  const locations = [];
  const pagesFetched = [];
  let recordsChecked = 0;
  let recordsWithCoordinates = 0;
  let recordsWithoutCoordinates = 0;
  let stoppedBecauseLastPage = false;

  for (let offset = 0; offset < maxPages; offset += 1) {
    const currentPage = page + offset;
    const upstreamParams = { ...sharedParams, page: String(currentPage), limit: String(limit) };
    const upstreamData = await fetchReveJson("/locations", upstreamParams, request, env, ctx, CACHE_TTL_SECONDS.nearby);
    const pageItems = Array.isArray(upstreamData) ? upstreamData : [];
    pagesFetched.push({ page: currentPage, count: pageItems.length, source: "upstream_or_cache" });
    recordsChecked += pageItems.length;

    for (const location of pageItems) {
      const point = getLocationPoint(location);
      if (!point) {
        recordsWithoutCoordinates += 1;
        continue;
      }
      recordsWithCoordinates += 1;
      const distanceKm = haversineKm(lat, lon, point.lat, point.lon);
      if (distanceKm <= radiusKm) locations.push({ ...location, distance_km: round(distanceKm, 3) });
    }

    if (pageItems.length < limit) {
      stoppedBecauseLastPage = true;
      break;
    }
  }

  locations.sort((a, b) => a.distance_km - b.distance_km);
  return { locations, pagesFetched, recordsChecked, recordsWithCoordinates, recordsWithoutCoordinates, stoppedBecauseLastPage };
}

function filterLocationsByDistance(locations, lat, lon, radiusKm) {
  return locations
    .map((location) => {
      const point = getLocationPoint(location);
      if (!point) return null;
      const distanceKm = haversineKm(lat, lon, point.lat, point.lon);
      if (distanceKm > radiusKm) return null;
      return { ...location, distance_km: round(distanceKm, 3) };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance_km - b.distance_km);
}

function buildNearbyPayload(locations, options) {
  const datasetComplete = options.datasetComplete === true;
  const limitation = options.dataLimitationMessage || null;
  return {
    data: locations,
    meta: {
      lat: options.lat,
      lon: options.lon,
      radius_km: options.radiusKm,
      page: options.page,
      limit: options.limit,
      max_pages: options.maxPages,
      pages_fetched: options.pagesFetched,
      pagesFetched: options.pagesFetched,
      recordsFetched: options.recordsChecked,
      datasetComplete,
      cacheStatus: options.cacheStatus,
      lastDatasetRefresh: options.lastDatasetRefresh,
      resultsAfterDistanceFilter: locations.length,
      resultsReturnedToFrontend: locations.length,
      dataLimitationMessage: limitation,
      result_count: locations.length,
      diagnostics: {
        reve_endpoint: "/locations",
        reve_records_checked: options.recordsChecked,
        records_with_coordinates: options.recordsWithCoordinates,
        records_without_coordinates: options.recordsWithoutCoordinates,
        records_after_distance_filter: locations.length,
        records_sent_to_frontend: locations.length,
        pagination_limit_reached: !options.stoppedBecauseLastPage,
        stopped_because_last_page: options.stoppedBecauseLastPage,
        cache_ttl_seconds: CACHE_TTL_SECONDS.nearby,
        dataset_complete: datasetComplete,
        cache_status: options.cacheStatus,
        last_dataset_refresh: options.lastDatasetRefresh,
      },
      source: "Mapa REVE /locations filtrado por el proxy",
      note: limitation || "Dataset de /locations consultado desde cache compartida del Worker.",
    },
  };
}

async function proxyReveJson(path, params, request, env, ctx, ttlSeconds) {
  const data = await fetchReveJson(path, params, request, env, ctx, ttlSeconds);
  return safeJson(data, 200, request, { "Cache-Control": `public, max-age=${ttlSeconds}` });
}

async function fetchReveJson(path, params, request, env, ctx, ttlSeconds) {
  const upstreamUrl = new URL(`${REVE_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") upstreamUrl.searchParams.set(key, value);
  }

  const cacheKey = new Request(upstreamUrl.toString(), { method: "GET" });
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached.json();

  await reserveHourlyReveRequest(env);

  const upstreamResponse = await fetch(upstreamUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-api-key": env.MAPA_REVE_API_KEY,
    },
  });

  if (!upstreamResponse.ok) {
    const retryAfterAt = getRetryAfterAt(upstreamResponse.headers.get("Retry-After"));
    throw new PublicError(
      "upstream_error",
      upstreamResponse.status === 429
        ? "Mapa REVE ha indicado limite de solicitudes. Intentalo mas tarde."
        : "Mapa REVE no ha devuelto una respuesta valida.",
      upstreamResponse.status,
      {
        upstreamStatus: upstreamResponse.status,
        upstreamErrorType: upstreamResponse.status === 429 ? "rate_limited" : `http_${upstreamResponse.status}`,
        retryAfterAt,
      },
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

async function reserveHourlyReveRequest(env) {
  if (!env.REVE_DATASET) return;
  const now = Date.now();
  const cutoff = now - 60 * 60 * 1000;
  const raw = await env.REVE_DATASET.get(DATASET_CACHE.rateKey, "json");
  const requests = Array.isArray(raw?.requests) ? raw.requests.filter((value) => Number(value) > cutoff) : [];
  if (requests.length >= DATASET_CACHE.hourlyRequestLimit) {
    const oldest = Math.min(...requests);
    throw new PublicError(
      "rate_limited",
      "Se ha alcanzado el limite prudente de consultas horarias a Mapa REVE.",
      429,
      {
        upstreamStatus: 429,
        upstreamErrorType: "local_hourly_limit",
        retryAfterAt: new Date(oldest + 60 * 60 * 1000).toISOString(),
      },
    );
  }
  requests.push(now);
  await env.REVE_DATASET.put(DATASET_CACHE.rateKey, JSON.stringify({ requests }));
}

function getCurrentBatchPages(meta) {
  if (!meta) return DATASET_CACHE.minimumBatchPages;
  if (meta.consecutiveUpstreamErrors >= 2) return DATASET_CACHE.minimumBatchPages;
  return Math.max(
    DATASET_CACHE.minimumBatchPages,
    Math.min(Number(meta.currentBatchPages) || DATASET_CACHE.defaultBatchPages, DATASET_CACHE.defaultBatchPages),
  );
}

function isRefreshBlockedByBackoff(meta) {
  if (!meta?.nextAllowedRefreshAt) return false;
  const nextAllowed = Date.parse(meta.nextAllowedRefreshAt);
  return Number.isFinite(nextAllowed) && Date.now() < nextAllowed;
}

function getNextAllowedRefreshAt(error, consecutiveUpstreamErrors) {
  if (error instanceof PublicError && error.retryAfterAt) return error.retryAfterAt;
  if (consecutiveUpstreamErrors >= DATASET_CACHE.backoffAfterErrors) {
    return new Date(Date.now() + DATASET_CACHE.backoffMs).toISOString();
  }
  return null;
}

function getRetryAfterAt(value) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return new Date(Date.now() + seconds * 1000).toISOString();
  const date = Date.parse(value);
  return Number.isFinite(date) ? new Date(date).toISOString() : null;
}

function getDatasetRecommendedAction(meta) {
  if (!meta) return "Esperar al primer ciclo de cron para calentar la cache.";
  if (meta.complete) return "Dataset completado; mantener consultas desde cache.";
  if (isRefreshBlockedByBackoff(meta)) return "Esperar a nextAllowedRefreshAt antes de reintentar para respetar la cuota de Mapa REVE.";
  if ((meta.consecutiveUpstreamErrors || 0) >= 3) return "Mantener currentBatchPages=1 y revisar si Mapa REVE sigue limitando paginas posteriores.";
  if ((meta.consecutiveUpstreamErrors || 0) > 0) return "Reintentar en el siguiente ciclo horario conservando la cache previa.";
  return "Continuar calentando la cache mediante cron horario.";
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

  if (options.allowDateFrom && url.searchParams.has("date_from")) params.date_from = validateDateFrom(url.searchParams.get("date_from"));
  if (options.allowParty && url.searchParams.has("party_id")) params.party_id = validatePartyId(url.searchParams.get("party_id"));
  if (options.allowCpo && url.searchParams.has("cpo_id")) params.cpo_id = validateId(url.searchParams.get("cpo_id"), "cpo_id");
  if (options.allowDynamicOnly && url.searchParams.has("only_dynamic_info")) params.only_dynamic_info = validateBoolean(url.searchParams.get("only_dynamic_info"), "only_dynamic_info");
  return params;
}

function rejectUnknownParams(url, allowedParams) {
  const allowed = new Set(allowedParams);
  for (const key of url.searchParams.keys()) {
    if (!allowed.has(key)) throw new PublicError("invalid_parameter", `El parametro ${key} no esta permitido en esta ruta.`, 400);
  }
}

function parseCoordinate(value, min, max, name) {
  return parseNumber(value, name, { min, max, required: true });
}

function parseNumber(value, name, { min, max, defaultValue, required = false }) {
  if ((value === null || value === "") && !required) return defaultValue;
  if (value === null || value === "") throw new PublicError("invalid_parameter", `Falta el parametro ${name}.`, 400);

  const normalized = String(value).trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new PublicError("invalid_parameter", `El parametro ${name} debe ser numerico.`, 400);

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new PublicError("invalid_parameter", `El parametro ${name} debe estar entre ${min} y ${max}.`, 400);
  }
  return parsed;
}

function parseInteger(value, name, { min, max, defaultValue }) {
  if (value === null || value === "") return defaultValue;
  if (!/^\d+$/.test(String(value))) throw new PublicError("invalid_parameter", `El parametro ${name} debe ser un entero positivo.`, 400);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new PublicError("invalid_parameter", `El parametro ${name} debe estar entre ${min} y ${max}.`, 400);
  }
  return parsed;
}

function validateId(value, name) {
  if (!value || !ID_PATTERN.test(value)) throw new PublicError("invalid_parameter", `El parametro ${name} no tiene un formato valido.`, 400);
  return value;
}

function validatePartyId(value) {
  if (!value || !PARTY_ID_PATTERN.test(value)) throw new PublicError("invalid_parameter", "El parametro party_id no tiene un formato valido.", 400);
  return value;
}

function validateDateFrom(value) {
  if (!value || Number.isNaN(Date.parse(value))) throw new PublicError("invalid_parameter", "El parametro date_from debe ser una fecha ISO 8601 valida.", 400);
  return value;
}

function validateBoolean(value, name) {
  if (value === "true" || value === "false") return value;
  throw new PublicError("invalid_parameter", `El parametro ${name} debe ser true o false.`, 400);
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
    return safeJson({ error: { code: "cors_forbidden", message: "Origen no autorizado para consultar el proxy." } }, 403, request);
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
  const payload = body instanceof PublicError ? { error: { code: body.code, message: body.publicMessage } } : body;

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
  if (originCheck.ok && originCheck.origin) headers["Access-Control-Allow-Origin"] = originCheck.origin;
  return headers;
}

class PublicError extends Error {
  constructor(code, publicMessage, status = 400, details = {}) {
    super(publicMessage);
    this.name = "PublicError";
    this.code = code;
    this.publicMessage = publicMessage;
    this.status = status;
    this.upstreamStatus = details.upstreamStatus || null;
    this.upstreamErrorType = details.upstreamErrorType || null;
    this.retryAfterAt = details.retryAfterAt || null;
  }
}
