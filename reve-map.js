(function initReveMapFeature() {
  const DEFAULT_PROXY_URL = "https://mapa-reve-proxy.carlospenalaguna.workers.dev";
  const PROXY_BASE_URL = (window.REVE_PROXY_BASE_URL || DEFAULT_PROXY_URL).replace(/\/$/, "");
  const DEFAULT_RADIUS_KM = 10;
  const INITIAL_CENTER = { lat: 40.4168, lon: -3.7038, label: "Espana" };
  const INITIAL_STATUS = "Busca una localidad o usa tu ubicacion para ver ubicaciones de recarga cercanas.";
  const PAGE_SIZE = 6;

  const LOCALITIES = [
    city("Madrid", "Madrid", "Comunidad de Madrid", 40.4168, -3.7038, ["28001", "28013"]),
    city("Barcelona", "Barcelona", "Cataluna", 41.3874, 2.1686, ["08001", "08002"]),
    city("Valencia", "Valencia", "Comunitat Valenciana", 39.4699, -0.3763, ["46001"]),
    city("Sevilla", "Sevilla", "Andalucia", 37.3891, -5.9845, ["41001"]),
    city("Zaragoza", "Zaragoza", "Aragon", 41.6488, -0.8891, ["50001"]),
    city("Malaga", "Malaga", "Andalucia", 36.7213, -4.4214, ["29001"], ["Málaga"]),
    city("Murcia", "Murcia", "Region de Murcia", 37.9922, -1.1307, ["30001"]),
    city("Palma", "Illes Balears", "Illes Balears", 39.5696, 2.6502, ["07001"], ["Palma de Mallorca"]),
    city("Las Palmas de Gran Canaria", "Las Palmas", "Canarias", 28.1235, -15.4363, ["35001"], ["Las Palmas"]),
    city("Bilbao", "Bizkaia", "Pais Vasco", 43.263, -2.935, ["48001"]),
    city("Alicante", "Alicante", "Comunitat Valenciana", 38.3452, -0.481, ["03001"], ["Alacant"]),
    city("Cordoba", "Cordoba", "Andalucia", 37.8882, -4.7794, ["14001"], ["Córdoba"]),
    city("Valladolid", "Valladolid", "Castilla y Leon", 41.6523, -4.7245, ["47001"]),
    city("Vigo", "Pontevedra", "Galicia", 42.2406, -8.7207, ["36201"]),
    city("Gijon", "Asturias", "Asturias", 43.5322, -5.6611, ["33201"], ["Gijón"]),
    city("L'Hospitalet de Llobregat", "Barcelona", "Cataluna", 41.3662, 2.1165, ["08901"], ["Hospitalet"]),
    city("Granada", "Granada", "Andalucia", 37.1773, -3.5986, ["18001"]),
    city("Vitoria-Gasteiz", "Araba", "Pais Vasco", 42.8467, -2.6716, ["01001"], ["Vitoria"]),
    city("A Coruna", "A Coruna", "Galicia", 43.3623, -8.4115, ["15001"], ["A Coruña", "La Coruna", "La Coruña", "Coruna", "Coruña"]),
    city("Elche", "Alicante", "Comunitat Valenciana", 38.2699, -0.7126, ["03201"], ["Elx"]),
    city("Oviedo", "Asturias", "Asturias", 43.3619, -5.8494, ["33001"]),
    city("Santa Cruz de Tenerife", "Santa Cruz de Tenerife", "Canarias", 28.4636, -16.2518, ["38001"]),
    city("Pamplona", "Navarra", "Navarra", 42.8125, -1.6458, ["31001"], ["Iruna", "Iruña"]),
    city("Santander", "Cantabria", "Cantabria", 43.4623, -3.8099, ["39001"]),
    city("San Sebastian", "Gipuzkoa", "Pais Vasco", 43.3183, -1.9812, ["20001"], ["Donostia", "Donostia-San Sebastian", "San Sebastián"]),
    city("Burgos", "Burgos", "Castilla y Leon", 42.3439, -3.6969, ["09001"]),
    city("Albacete", "Albacete", "Castilla-La Mancha", 38.9943, -1.8585, ["02001"]),
    city("Almeria", "Almeria", "Andalucia", 36.834, -2.4637, ["04001"], ["Almería"]),
    city("Badajoz", "Badajoz", "Extremadura", 38.8794, -6.9707, ["06001"]),
    city("Castellon de la Plana", "Castellon", "Comunitat Valenciana", 39.9864, -0.0513, ["12001"], ["Castellon", "Castellón", "Castello", "Castelló"]),
    city("Cadiz", "Cadiz", "Andalucia", 36.5271, -6.2886, ["11001"], ["Cádiz"]),
    city("Cartagena", "Murcia", "Region de Murcia", 37.6257, -0.9966, ["30201"]),
    city("Ciudad Real", "Ciudad Real", "Castilla-La Mancha", 38.9848, -3.9273, ["13001"]),
    city("Cuenca", "Cuenca", "Castilla-La Mancha", 40.0704, -2.1374, ["16001"]),
    city("Caceres", "Caceres", "Extremadura", 39.4753, -6.3724, ["10001"], ["Cáceres"]),
    city("Girona", "Girona", "Cataluna", 41.9794, 2.8214, ["17001"], ["Gerona"]),
    city("Guadalajara", "Guadalajara", "Castilla-La Mancha", 40.6333, -3.1667, ["19001"]),
    city("Huelva", "Huelva", "Andalucia", 37.2614, -6.9447, ["21001"]),
    city("Huesca", "Huesca", "Aragon", 42.1401, -0.4089, ["22001"]),
    city("Jaen", "Jaen", "Andalucia", 37.7796, -3.7849, ["23001"], ["Jaén"]),
    city("Leon", "Leon", "Castilla y Leon", 42.5987, -5.5671, ["24001"], ["León"]),
    city("Lleida", "Lleida", "Cataluna", 41.6176, 0.62, ["25001"], ["Lerida", "Lérida"]),
    city("Logrono", "La Rioja", "La Rioja", 42.4627, -2.4449, ["26001"], ["Logroño"]),
    city("Lugo", "Lugo", "Galicia", 43.0097, -7.5568, ["27001"]),
    city("Ourense", "Ourense", "Galicia", 42.3358, -7.8639, ["32001"], ["Orense"]),
    city("Palencia", "Palencia", "Castilla y Leon", 42.0097, -4.5288, ["34001"]),
    city("Pontevedra", "Pontevedra", "Galicia", 42.431, -8.6444, ["36001"]),
    city("Salamanca", "Salamanca", "Castilla y Leon", 40.9701, -5.6635, ["37001"]),
    city("Segovia", "Segovia", "Castilla y Leon", 40.9429, -4.1088, ["40001"]),
    city("Soria", "Soria", "Castilla y Leon", 41.7636, -2.4649, ["42001"]),
    city("Tarragona", "Tarragona", "Cataluna", 41.1189, 1.2445, ["43001"]),
    city("Teruel", "Teruel", "Aragon", 40.3457, -1.1065, ["44001"]),
    city("Toledo", "Toledo", "Castilla-La Mancha", 39.8628, -4.0273, ["45001"]),
    city("Zamora", "Zamora", "Castilla y Leon", 41.5036, -5.7446, ["49001"]),
    city("Ceuta", "Ceuta", "Ceuta", 35.8894, -5.3213, ["51001"]),
    city("Melilla", "Melilla", "Melilla", 35.2923, -2.9381, ["52001"]),
  ];

  const dom = {};
  let map = null;
  let stationLayer = null;
  let centerLayer = null;
  let activeController = null;
  let searchSequence = 0;
  let lastCenter = null;
  let lastLocations = [];
  let visibleCount = PAGE_SIZE;
  let fastestLocationId = null;
  let suppressMapMovePrompt = false;

  document.addEventListener("DOMContentLoaded", () => {
    bindDom();
    if (!dom.section) return;
    bindEvents();
    populateDatalist();
    resetRechargeSearch({ keepInput: false });
  });

  function city(label, province, region, lat, lon, postalCodes = [], aliases = []) {
    return { label, province, region, lat, lon, postalCodes, aliases };
  }

  function bindDom() {
    dom.section = document.querySelector("#recharge-network");
    dom.form = document.querySelector("#recharge-search-form");
    dom.input = document.querySelector("#recharge-location-input");
    dom.suggestions = document.querySelector("#recharge-location-suggestions");
    dom.radius = document.querySelector("#recharge-radius-select");
    dom.radiusHelp = document.querySelector("#recharge-radius-help");
    dom.geolocate = document.querySelector("#recharge-geolocate-button");
    dom.reset = document.querySelector("#recharge-reset-button");
    dom.status = document.querySelector("#recharge-status");
    dom.count = document.querySelector("#recharge-count");
    dom.countDetail = document.querySelector("#recharge-count-detail");
    dom.connectorsCard = document.querySelector("#recharge-connectors-card");
    dom.connectorsCount = document.querySelector("#recharge-connectors-count");
    dom.connectorsDetail = document.querySelector("#recharge-connectors-detail");
    dom.nearestName = document.querySelector("#recharge-nearest-name");
    dom.nearestMeta = document.querySelector("#recharge-nearest-meta");
    dom.nearestAddress = document.querySelector("#recharge-nearest-address");
    dom.fastestPower = document.querySelector("#recharge-fastest-power");
    dom.fastestName = document.querySelector("#recharge-fastest-name");
    dom.fastestMeta = document.querySelector("#recharge-fastest-meta");
    dom.coverage = document.querySelector("#recharge-coverage");
    dom.coverageCopy = document.querySelector("#recharge-coverage-copy");
    dom.map = document.querySelector("#recharge-map");
    dom.mapEmpty = document.querySelector("#recharge-map-empty");
    dom.searchArea = document.querySelector("#recharge-search-area-button");
    dom.updated = document.querySelector("#recharge-updated");
    dom.list = document.querySelector("#recharge-results-list");
    dom.showMore = document.querySelector("#recharge-show-more-button");
  }

  function bindEvents() {
    dom.form.addEventListener("submit", handleSearchSubmit);
    dom.input.addEventListener("input", handleLocationTyping);
    dom.input.addEventListener("blur", () => setTimeout(hideSuggestions, 160));
    dom.radius.addEventListener("change", updateRadiusHelp);
    dom.geolocate.addEventListener("click", handleGeolocation);
    dom.reset.addEventListener("click", () => resetRechargeSearch({ keepInput: false }));
    dom.searchArea?.addEventListener("click", handleSearchCurrentMapArea);
    dom.showMore.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderLocationCards(lastLocations);
    });
    window.addEventListener("resize", () => map?.invalidateSize());
  }

  function populateDatalist() {
    const datalist = document.querySelector("#recharge-city-suggestions");
    if (!datalist) return;
    const existing = new Set(Array.from(datalist.options).map((option) => option.value));
    LOCALITIES.forEach((item) => {
      if (existing.has(item.label)) return;
      const option = document.createElement("option");
      option.value = item.label;
      datalist.appendChild(option);
    });
  }

  function ensureMap() {
    if (map || !dom.map || typeof window.L === "undefined") return;
    map = L.map(dom.map, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([INITIAL_CENTER.lat, INITIAL_CENTER.lon], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    stationLayer = L.layerGroup().addTo(map);
    centerLayer = L.layerGroup().addTo(map);
    bindMapInteractionPrompt();
    map.invalidateSize();
  }

  function bindMapInteractionPrompt() {
    if (!map) return;
    map.on("movestart zoomstart", () => {
      if (!suppressMapMovePrompt) showSearchAreaButton();
    });
  }

  function suppressMapPromptBriefly() {
    suppressMapMovePrompt = true;
    window.setTimeout(() => {
      suppressMapMovePrompt = false;
    }, 450);
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
    const resolved = resolveLocationInput(dom.input.value.trim());
    if (resolved.status === "empty") {
      setStatus("Introduce una localidad, un codigo postal reconocido o coordenadas tipo 40.4168, -3.7038.", "error");
      return;
    }
    if (resolved.status === "ambiguous") {
      renderSuggestions(resolved.matches, { force: true });
      setStatus("He encontrado varias coincidencias. Elige una de las sugerencias para afinar la busqueda.", "error");
      return;
    }
    if (resolved.status === "not_found") {
      renderSuggestions([], { force: true });
      setStatus("No encuentro esa localidad. Prueba con el nombre completo, provincia o usa tu ubicacion.", "error");
      return;
    }

    hideSuggestions();
    dom.input.value = resolved.center.label;
    await searchNearby(resolved.center);
  }

  async function handleSearchCurrentMapArea() {
    if (!map || dom.searchArea?.disabled) return;
    const center = map.getCenter();
    await searchNearby({
      label: "esta zona del mapa",
      lat: center.lat,
      lon: center.lng,
    });
  }

  function handleLocationTyping() {
    const value = dom.input.value.trim();
    if (isCoordinateText(value)) {
      hideSuggestions();
      return;
    }
    renderSuggestions(findLocalityMatches(value));
  }

  function renderSuggestions(matches, options = {}) {
    if (!dom.suggestions) return;
    dom.suggestions.innerHTML = "";
    if (matches.length === 0) {
      if (options.force) {
        dom.suggestions.innerHTML = `<p>No encuentro esa localidad. Prueba con el nombre completo, provincia o usa tu ubicacion.</p>`;
        dom.suggestions.hidden = false;
      } else {
        hideSuggestions();
      }
      return;
    }

    matches.slice(0, 7).forEach((match) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<strong>${escapeHtml(match.label)}</strong><span>${escapeHtml(match.province)} · ${escapeHtml(match.region)}</span>`;
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", async () => {
        dom.input.value = match.label;
        hideSuggestions();
        await searchNearby(toCenter(match));
      });
      dom.suggestions.appendChild(button);
    });
    dom.suggestions.hidden = false;
  }

  function hideSuggestions() {
    if (dom.suggestions) dom.suggestions.hidden = true;
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setStatus("Tu navegador no permite geolocalizacion. Puedes buscar por localidad o coordenadas.", "error");
      return;
    }

    setLoading(true, "Solicitando tu ubicacion al navegador...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const center = {
          label: "Tu ubicacion",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        dom.input.value = `${formatCoord(center.lat)}, ${formatCoord(center.lon)}`;
        await searchNearby(center);
      },
      () => {
        setLoading(false);
        setStatus("No se ha podido obtener tu ubicacion. Puedes introducir una localidad o coordenadas manualmente.", "error");
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
    );
  }

  async function searchNearby(center) {
    const radiusKm = Number(dom.radius.value);
    const currentSearch = ++searchSequence;
    activeController?.abort();
    activeController = new AbortController();
    lastCenter = center;
    visibleCount = PAGE_SIZE;

    ensureMap();
    hideSearchAreaButton();
    setLoading(true, `Consultando ubicaciones de recarga cerca de ${center.label}...`);
    updateRadiusHelp();

    try {
      const url = new URL(`${PROXY_BASE_URL}/locations/nearby`);
      url.searchParams.set("lat", String(center.lat));
      url.searchParams.set("lon", String(center.lon));
      url.searchParams.set("radius_km", String(radiusKm));
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "100");
      url.searchParams.set("max_pages", String(getMaxPagesForRadius(radiusKm)));

      const response = await fetch(url.toString(), { method: "GET", signal: activeController.signal });
      const payload = await response.json().catch(() => null);
      if (currentSearch !== searchSequence) return;

      if (!response.ok) {
        throw new Error(payload?.error?.message || "El proxy no ha devuelto una respuesta valida.");
      }

      lastLocations = Array.isArray(payload?.data) ? payload.data : [];
      renderRechargeResults(lastLocations, center, radiusKm, payload?.meta);
    } catch (error) {
      if (error.name === "AbortError") return;
      if (currentSearch !== searchSequence) return;
      setLoading(false);
      renderEmptyResults();
      setStatus(`No se ha podido consultar la red de recarga. ${error.message}`, "error");
    }
  }

  function renderRechargeResults(locations, center, radiusKm, meta) {
    setLoading(false);
    ensureMap();

    if (locations.length === 0) {
      renderEmptyResults();
      focusMap(center, radiusKm);
      dom.count.textContent = "0";
      dom.countDetail.textContent = `en un radio de ${radiusKm} km`;
      dom.coverage.textContent = "Baja";
      dom.coverage.dataset.tone = "low";
      dom.coverageCopy.textContent = "pocas ubicaciones disponibles en el radio seleccionado";
      dom.updated.textContent = getDatasetUpdatedText(meta);
      setConnectorsSummary([]);
      setStatus(`No se han encontrado ubicaciones en esta consulta para ${radiusKm} km alrededor de ${center.label}. Prueba a ampliar el radio o buscar otra ubicacion. ${getDataLimitationCopy(meta)}`, "empty");
      return;
    }

    locations.sort((a, b) => a.distance_km - b.distance_km);
    const nearest = locations[0];
    const fastest = getFastestLocation(locations);
    fastestLocationId = getLocationKey(fastest);
    const coverage = getCoverage(locations, radiusKm, fastest);
    const latestUpdated = getLatestUpdated(locations);

    dom.count.textContent = String(locations.length);
    dom.countDetail.textContent = `en un radio de ${radiusKm} km`;
    setConnectorsSummary(locations);

    const nearestPower = getMaxPowerWatts([nearest]);
    setTextWithTitle(dom.nearestName, getLocationName(nearest));
    dom.nearestMeta.textContent = `${formatDistance(nearest.distance_km)} km · ${nearestPower > 0 ? formatPower(nearestPower) : "potencia no disponible"}`;
    dom.nearestAddress.textContent = getAddress(nearest);

    const fastestPower = getMaxPowerWatts([fastest]);
    dom.fastestPower.textContent = fastestPower > 0 ? formatPower(fastestPower) : "No disponible";
    setTextWithTitle(dom.fastestName, getLocationName(fastest));
    dom.fastestMeta.textContent = `${formatDistance(fastest.distance_km)} km · ${getOperator(fastest)}`;

    dom.coverage.textContent = coverage.label;
    dom.coverage.dataset.tone = coverage.tone;
    dom.coverageCopy.textContent = coverage.copy;
    dom.updated.textContent = getDatasetUpdatedText(meta, latestUpdated);

    renderMapPoints(locations, center, radiusKm);
    renderLocationCards(locations);
    logSafeDiagnostics("resultado", {
      localidad: center.label,
      coordenadas: { lat: center.lat, lon: center.lon },
      radio_km: radiusKm,
      reve_registros_revisados: meta?.diagnostics?.reve_records_checked,
      cache_estado: meta?.cacheStatus,
      dataset_completo: meta?.datasetComplete,
      ultima_actualizacion_dataset: meta?.lastDatasetRefresh,
      paginas_revisadas: meta?.pages_fetched?.length,
      tras_filtro_distancia: locations.length,
      enviados_frontend: locations.length,
      pintados_mapa: locations.length,
      mostrados_lista: Math.min(visibleCount, locations.length),
    });

    setStatus(`Se han encontrado ${locations.length} ubicaciones disponibles en esta consulta para un radio de ${radiusKm} km alrededor de ${center.label}. ${getDataLimitationCopy(meta)}`, "success");

    if (radiusKm === 100) {
      dom.status.textContent += " Radio amplio: util para valorar rutas y desplazamientos cercanos, no solo carga cotidiana.";
    }
    if (meta?.note && meta.note !== meta?.dataLimitationMessage) {
      dom.status.textContent += ` ${meta.note}`;
    }
  }

  function renderEmptyResults() {
    dom.count.textContent = "--";
    dom.countDetail.textContent = "Sin busqueda activa";
    setConnectorsSummary([]);
    setTextWithTitle(dom.nearestName, "--");
    dom.nearestMeta.textContent = "Distancia y potencia no disponibles";
    dom.nearestAddress.textContent = "--";
    dom.fastestPower.textContent = "--";
    setTextWithTitle(dom.fastestName, "--");
    dom.fastestMeta.textContent = "Ubicacion y distancia no disponibles";
    dom.coverage.textContent = "--";
    dom.coverageCopy.textContent = "Sin busqueda activa";
    delete dom.coverage.dataset.tone;
    dom.updated.textContent = "Ultima consulta: --";
    dom.list.innerHTML = `<p class="recharge-results-list__empty">Todavia no hay ubicaciones para listar.</p>`;
    dom.showMore.hidden = true;
    clearMap();
  }

  function setConnectorsSummary(locations) {
    if (!dom.connectorsCard || !dom.connectorsCount || !dom.connectorsDetail) return;
    const total = getDeclaredConnectorCount(locations);
    const hasConnectorData = total > 0;
    dom.connectorsCard.hidden = !hasConnectorData;
    if (!hasConnectorData) {
      dom.connectorsCount.textContent = "--";
      dom.connectorsDetail.textContent = "según datos disponibles de la API";
      return;
    }
    dom.connectorsCount.textContent = String(total);
    dom.connectorsDetail.textContent = "según datos disponibles de la API";
  }

  function renderMapPoints(locations, center, radiusKm) {
    ensureMap();
    suppressMapPromptBriefly();
    clearMap();
    if (!map) return;

    const bounds = [];
    L.circleMarker([center.lat, center.lon], {
      radius: 8,
      color: "#0f766e",
      fillColor: "#0f766e",
      fillOpacity: 0.92,
      weight: 2,
    }).bindPopup(`<strong>${escapeHtml(center.label)}</strong><br>Centro de busqueda`).addTo(centerLayer);
    bounds.push([center.lat, center.lon]);

    locations.forEach((location, index) => {
      const point = getLocationPoint(location);
      if (!point) return;
      const power = getMaxPowerWatts([location]);
      const isFastest = getLocationKey(location) === fastestLocationId;
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: isFastest ? 9 : 6,
        color: isFastest ? "#b45309" : "#0e7490",
        fillColor: isFastest ? "#f59e0b" : "#22c1c3",
        fillOpacity: 0.9,
        weight: 2,
      }).bindPopup(`
        <strong>${escapeHtml(getLocationName(location))}</strong><br>
        ${formatDistance(location.distance_km)} km · ${power > 0 ? formatPower(power) : "Potencia N/D"}<br>
        ${escapeHtml(getAddress(location))}
      `);
      marker.on("click", () => highlightLocationCard(index));
      marker.addTo(stationLayer);
      bounds.push([point.lat, point.lon]);
    });

    dom.mapEmpty.hidden = locations.length > 0;
    const leafletBounds = L.latLngBounds(bounds);
    map.fitBounds(leafletBounds.pad(0.2), { animate: false, maxZoom: radiusKm <= 5 ? 14 : 11 });
    requestAnimationFrame(() => map.invalidateSize());
  }

  function focusMap(center, radiusKm) {
    ensureMap();
    suppressMapPromptBriefly();
    clearMap();
    if (!map) return;
    L.circleMarker([center.lat, center.lon], {
      radius: 8,
      color: "#0f766e",
      fillColor: "#0f766e",
      fillOpacity: 0.92,
      weight: 2,
    }).addTo(centerLayer);
    map.setView([center.lat, center.lon], radiusKm <= 10 ? 11 : 8, { animate: false });
    dom.mapEmpty.hidden = false;
    requestAnimationFrame(() => map.invalidateSize());
  }

  function clearMap() {
    stationLayer?.clearLayers();
    centerLayer?.clearLayers();
    if (dom.mapEmpty) dom.mapEmpty.hidden = false;
  }

  function renderLocationCards(locations) {
    const visibleLocations = locations.slice(0, visibleCount);
    dom.list.innerHTML = visibleLocations.map((location, index) => {
      const point = getLocationPoint(location);
      const name = escapeHtml(getLocationName(location));
      const address = escapeHtml(getAddress(location));
      const operator = escapeHtml(getOperator(location));
      const distance = typeof location.distance_km === "number" ? `${formatDistance(location.distance_km)} km` : "Distancia no disponible";
      const power = getMaxPowerWatts([location]);
      const isFastest = getLocationKey(location) === fastestLocationId;
      const mapsUrl = point ? `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lon}` : "";

      return `
        <article class="recharge-location-card ${isFastest ? "is-fastest" : ""}" data-location-card="${index}">
          <div>
            <span class="recharge-location-card__index">${index + 1}</span>
            ${isFastest ? `<span class="recharge-location-card__badge">Carga mas rapida detectada</span>` : ""}
            <h4 title="${name}">${name}</h4>
            <p>${address}</p>
          </div>
          <dl>
            <div><dt>Distancia</dt><dd>${distance}</dd></div>
            <div><dt>Potencia maxima declarada</dt><dd>${power > 0 ? formatPower(power) : "N/D"}</dd></div>
            <div><dt>Conectores declarados</dt><dd>${formatConnectorCount(getDeclaredConnectorCount(location))}</dd></div>
            <div><dt>Operador</dt><dd>${operator}</dd></div>
          </dl>
          ${mapsUrl ? `<a class="recharge-location-card__maps" href="${mapsUrl}" target="_blank" rel="noopener">Abrir en Google Maps</a>` : ""}
        </article>
      `;
    }).join("");

    dom.showMore.hidden = visibleCount >= locations.length;
    dom.showMore.textContent = `Ver mas ubicaciones (${Math.min(PAGE_SIZE, locations.length - visibleCount)} mas)`;
  }

  function highlightLocationCard(index) {
    const card = dom.list.querySelector(`[data-location-card="${index}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      card.classList.add("is-highlighted");
      setTimeout(() => card.classList.remove("is-highlighted"), 1400);
      return;
    }
    const location = lastLocations[index];
    if (location) {
      setStatus(`${getLocationName(location)} esta fuera de las primeras ubicaciones mostradas. Pulsa "Ver mas ubicaciones" para ampliar la lista.`, "success");
    }
  }

  function resetRechargeSearch({ keepInput }) {
    activeController?.abort();
    searchSequence += 1;
    lastCenter = null;
    lastLocations = [];
    visibleCount = PAGE_SIZE;
    fastestLocationId = null;
    hideSearchAreaButton();
    if (!keepInput) dom.input.value = "";
    dom.radius.value = String(DEFAULT_RADIUS_KM);
    hideSuggestions();
    renderEmptyResults();
    setStatus(INITIAL_STATUS, "neutral");
    updateRadiusHelp();
    if (map) {
      suppressMapPromptBriefly();
      map.setView([INITIAL_CENTER.lat, INITIAL_CENTER.lon], 5, { animate: false });
      requestAnimationFrame(() => map.invalidateSize());
    }
  }

  function resolveLocationInput(value) {
    if (!value) return { status: "empty" };

    const coords = parseCoordinates(value);
    if (coords) return { status: "ok", center: coords };

    const matches = findLocalityMatches(value);
    if (matches.length === 0) return { status: "not_found" };
    const normalized = normalizeText(value);
    const exact = matches.find((match) =>
      [match.label, match.province, ...match.aliases, ...match.postalCodes].some((term) => normalizeText(term) === normalized),
    );
    if (exact) return { status: "ok", center: toCenter(exact) };
    if (matches.length === 1) return { status: "ok", center: toCenter(matches[0]) };
    return { status: "ambiguous", matches };
  }

  function findLocalityMatches(value) {
    const normalized = normalizeText(value);
    if (normalized.length < 2) return [];

    const scored = LOCALITIES.map((item) => {
      const terms = [item.label, item.province, item.region, ...item.aliases, ...item.postalCodes].map(normalizeText);
      let score = 0;
      if (terms.some((term) => term === normalized)) score = 100;
      else if (terms.some((term) => term.startsWith(normalized))) score = 70;
      else if (terms.some((term) => term.includes(normalized))) score = 45;
      return { item, score };
    }).filter((entry) => entry.score > 0);

    return scored
      .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label, "es"))
      .map((entry) => entry.item);
  }

  function toCenter(item) {
    return { label: item.label, lat: item.lat, lon: item.lon };
  }

  function parseCoordinates(value) {
    const coordsMatch = value.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
    if (!coordsMatch) return null;
    const lat = Number(coordsMatch[1].replace(",", "."));
    const lon = Number(coordsMatch[2].replace(",", "."));
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { label: "Coordenadas indicadas", lat, lon };
    }
    return null;
  }

  function isCoordinateText(value) {
    return /^\s*-?\d+(?:[.,]\d+)?\s*[,;]\s*-?\d+(?:[.,]\d+)?\s*$/.test(value);
  }

  function getMaxPagesForRadius(radiusKm) {
    // La busqueda publicada usa KV; este limite solo aplica si el proxy necesita una ventana de fallback.
    return 2;
  }

  function getDatasetUpdatedText(meta, latestUpdated = null) {
    if (meta?.lastDatasetRefresh) {
      return `Datos consultados: ${formatDateTime(new Date(meta.lastDatasetRefresh))}`;
    }
    if (latestUpdated) {
      return `Ultima actualizacion API: ${formatDateTime(latestUpdated)}`;
    }
    return `Ultima consulta: ${formatDateTime(new Date())}`;
  }

  function getDataLimitationCopy(meta) {
    if (meta?.datasetComplete === true) return "";
    return "La API externa no permite busqueda geografica directa; los resultados se calculan sobre datos disponibles en cache y pueden no coincidir exactamente con el mapa oficial.";
  }

  function logSafeDiagnostics(event, data) {
    if (!window.REVE_DEBUG) return;
    console.info("[REVE diagnostico]", { event, ...data });
  }

  function getFastestLocation(locations) {
    return locations.reduce((best, location) => {
      if (!best) return location;
      const power = getMaxPowerWatts([location]);
      const bestPower = getMaxPowerWatts([best]);
      if (power > bestPower) return location;
      if (power === bestPower && location.distance_km < best.distance_km) return location;
      return best;
    }, null);
  }

  function getCoverage(locations, radiusKm, fastest) {
    const count = locations.length;
    const nearestDistance = Number(locations[0]?.distance_km ?? 999);
    const fastestPower = getMaxPowerWatts([fastest]);
    const density = count / Math.max(radiusKm, 1);

    if ((radiusKm <= 10 && count >= 8) || (radiusKm <= 25 && count >= 12) || (radiusKm <= 50 && count >= 18) || (radiusKm >= 100 && count >= 28 && nearestDistance <= 20)) {
      return { label: "Alta", tone: "high", copy: "buena disponibilidad de ubicaciones en el radio seleccionado" };
    }
    if (count >= 4 || density >= 0.12 || fastestPower >= 150000) {
      return { label: "Media", tone: "medium", copy: "red aceptable, conviene revisar ubicacion y potencia" };
    }
    return { label: "Baja", tone: "low", copy: "pocas ubicaciones disponibles en el radio seleccionado" };
  }

  function updateRadiusHelp() {
    if (!dom.radiusHelp) return;
    dom.radiusHelp.textContent = Number(dom.radius.value) === 100
      ? "Radio amplio: util para valorar rutas y desplazamientos cercanos, no solo carga cotidiana."
      : "Elige el alcance de la consulta.";
  }

  function setLoading(isLoading, message = "") {
    dom.form.classList.toggle("is-loading", isLoading);
    dom.form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = control === dom.reset ? false : isLoading;
    });
    if (dom.searchArea) dom.searchArea.disabled = isLoading;
    if (message) setStatus(message, "loading");
  }

  function showSearchAreaButton() {
    if (!dom.searchArea || !map) return;
    dom.searchArea.hidden = false;
    dom.searchArea.disabled = dom.form?.classList.contains("is-loading");
  }

  function hideSearchAreaButton() {
    if (!dom.searchArea) return;
    dom.searchArea.hidden = true;
    dom.searchArea.disabled = false;
  }

  function setStatus(message, tone = "neutral") {
    dom.status.textContent = message;
    dom.status.dataset.tone = tone;
  }

  function getLocationPoint(location) {
    const lat = Number(String(location?.coordinates?.latitude || "").replace(",", "."));
    const lon = Number(String(location?.coordinates?.longitude || "").replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  function getLocationName(location) {
    return location?.name || location?.address || location?.id || "Ubicacion de recarga";
  }

  function getAddress(location) {
    return [location?.address, location?.city].filter(Boolean).join(", ") || "Direccion no disponible";
  }

  function getOperator(location) {
    return location?.cpo_name || location?.owner || location?.party_id || "Operador no disponible";
  }

  function getLocationKey(location) {
    return location?.id || `${getLocationName(location)}-${location?.distance_km}`;
  }

  function getMaxPowerWatts(locations) {
    return locations.reduce((max, location) => {
      const evses = Array.isArray(location?.evses) ? location.evses : location?.evses ? [location.evses] : [];
      evses.forEach((evse) => {
        const connectors = Array.isArray(evse.connectors) ? evse.connectors : evse.connectors ? [evse.connectors] : [];
        connectors.forEach((connector) => {
          const power = Number(connector.max_electric_power);
          if (Number.isFinite(power)) max = Math.max(max, power);
        });
      });
      return max;
    }, 0);
  }

  function getDeclaredConnectorCount(input) {
    const locations = Array.isArray(input) ? input : input ? [input] : [];
    return locations.reduce((total, location) => {
      const evses = Array.isArray(location?.evses) ? location.evses : location?.evses ? [location.evses] : [];
      evses.forEach((evse) => {
        const connectors = Array.isArray(evse.connectors) ? evse.connectors : evse.connectors ? [evse.connectors] : [];
        total += connectors.length;
      });
      return total;
    }, 0);
  }

  function formatConnectorCount(value) {
    return value > 0 ? String(value) : "N/D";
  }

  function getLatestUpdated(locations) {
    const timestamps = [];
    locations.forEach((location) => {
      collectDate(timestamps, location.last_updated);
      const evses = Array.isArray(location.evses) ? location.evses : location.evses ? [location.evses] : [];
      evses.forEach((evse) => {
        collectDate(timestamps, evse.last_static_updated);
        const connectors = Array.isArray(evse.connectors) ? evse.connectors : evse.connectors ? [evse.connectors] : [];
        connectors.forEach((connector) => collectDate(timestamps, connector.last_static_updated));
      });
    });
    return timestamps.length ? new Date(Math.max(...timestamps)) : null;
  }

  function collectDate(list, value) {
    if (!value) return;
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) list.push(timestamp);
  }

  function setTextWithTitle(element, value) {
    element.textContent = value;
    element.title = value === "--" ? "" : value;
  }

  function normalizeText(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’]/g, "")
      .trim();
  }

  function formatCoord(value) {
    return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 6 }).format(value);
  }

  function formatDistance(value) {
    return new Intl.NumberFormat("es-ES", { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value);
  }

  function formatPower(watts) {
    if (watts >= 1000) {
      return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(watts / 1000)} kW`;
    }
    return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(watts)} W`;
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }
})();
