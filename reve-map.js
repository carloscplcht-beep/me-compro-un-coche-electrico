(function initReveMapFeature() {
  const DEFAULT_PROXY_URL = "https://mapa-reve-proxy.carlospenalaguna.workers.dev";
  const PROXY_BASE_URL = (window.REVE_PROXY_BASE_URL || DEFAULT_PROXY_URL).replace(/\/$/, "");

  const CITY_COORDINATES = new Map([
    ["madrid", { label: "Madrid", lat: 40.4168, lon: -3.7038 }],
    ["barcelona", { label: "Barcelona", lat: 41.3874, lon: 2.1686 }],
    ["valencia", { label: "Valencia", lat: 39.4699, lon: -0.3763 }],
    ["sevilla", { label: "Sevilla", lat: 37.3891, lon: -5.9845 }],
    ["zaragoza", { label: "Zaragoza", lat: 41.6488, lon: -0.8891 }],
    ["malaga", { label: "Málaga", lat: 36.7213, lon: -4.4214 }],
    ["murcia", { label: "Murcia", lat: 37.9922, lon: -1.1307 }],
    ["palma", { label: "Palma", lat: 39.5696, lon: 2.6502 }],
    ["las palmas", { label: "Las Palmas de Gran Canaria", lat: 28.1235, lon: -15.4363 }],
    ["bilbao", { label: "Bilbao", lat: 43.263, lon: -2.935 }],
    ["alicante", { label: "Alicante", lat: 38.3452, lon: -0.481 }],
    ["cordoba", { label: "Córdoba", lat: 37.8882, lon: -4.7794 }],
    ["valladolid", { label: "Valladolid", lat: 41.6523, lon: -4.7245 }],
    ["vigo", { label: "Vigo", lat: 42.2406, lon: -8.7207 }],
    ["gijon", { label: "Gijón", lat: 43.5322, lon: -5.6611 }],
    ["hospitalet", { label: "L'Hospitalet de Llobregat", lat: 41.3662, lon: 2.1165 }],
    ["granada", { label: "Granada", lat: 37.1773, lon: -3.5986 }],
    ["vitoria", { label: "Vitoria-Gasteiz", lat: 42.8467, lon: -2.6716 }],
    ["a coruna", { label: "A Coruña", lat: 43.3623, lon: -8.4115 }],
    ["coruna", { label: "A Coruña", lat: 43.3623, lon: -8.4115 }],
    ["elche", { label: "Elche", lat: 38.2699, lon: -0.7126 }],
    ["oviedo", { label: "Oviedo", lat: 43.3619, lon: -5.8494 }],
    ["santa cruz de tenerife", { label: "Santa Cruz de Tenerife", lat: 28.4636, lon: -16.2518 }],
    ["pamplona", { label: "Pamplona", lat: 42.8125, lon: -1.6458 }],
    ["santander", { label: "Santander", lat: 43.4623, lon: -3.8099 }],
  ]);

  const dom = {};
  let lastCenter = null;
  let lastLocations = [];

  document.addEventListener("DOMContentLoaded", () => {
    bindDom();
    if (!dom.section) return;
    bindEvents();
  });

  function bindDom() {
    dom.section = document.querySelector("#recharge-network");
    dom.form = document.querySelector("#recharge-search-form");
    dom.input = document.querySelector("#recharge-location-input");
    dom.radius = document.querySelector("#recharge-radius-select");
    dom.geolocate = document.querySelector("#recharge-geolocate-button");
    dom.status = document.querySelector("#recharge-status");
    dom.count = document.querySelector("#recharge-count");
    dom.nearest = document.querySelector("#recharge-nearest");
    dom.power = document.querySelector("#recharge-power");
    dom.coverage = document.querySelector("#recharge-coverage");
    dom.mapPoints = document.querySelector("#recharge-map-points");
    dom.mapEmpty = document.querySelector("#recharge-map-empty");
    dom.updated = document.querySelector("#recharge-updated");
    dom.list = document.querySelector("#recharge-results-list");
  }

  function bindEvents() {
    dom.form.addEventListener("submit", handleSearchSubmit);
    dom.geolocate.addEventListener("click", handleGeolocation);
    dom.mapPoints.addEventListener("click", handleMapPointClick);
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();

    const locationText = dom.input.value.trim();
    const center = parseLocationInput(locationText);
    if (!center) {
      setStatus("No he podido localizar esa ubicación. Prueba con una ciudad española conocida o coordenadas tipo 40.4168, -3.7038.", "error");
      return;
    }

    await searchNearby(center);
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setStatus("Tu navegador no permite geolocalización.", "error");
      return;
    }

    setLoading(true, "Solicitando tu ubicación al navegador...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const center = {
          label: "Tu ubicación",
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        dom.input.value = `${formatCoord(center.lat)}, ${formatCoord(center.lon)}`;
        await searchNearby(center);
      },
      () => {
        setLoading(false);
        setStatus("No se ha podido obtener tu ubicación. Puedes introducir una ciudad o coordenadas manualmente.", "error");
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
    );
  }

  async function searchNearby(center) {
    const radiusKm = Number(dom.radius.value);
    lastCenter = center;
    setLoading(true, `Consultando puntos de recarga cerca de ${center.label}...`);

    try {
      const url = new URL(`${PROXY_BASE_URL}/locations/nearby`);
      url.searchParams.set("lat", String(center.lat));
      url.searchParams.set("lon", String(center.lon));
      url.searchParams.set("radius_km", String(radiusKm));
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "100");
      url.searchParams.set("max_pages", "3");

      const response = await fetch(url.toString(), { method: "GET" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || "El proxy no ha devuelto una respuesta válida.");
      }

      lastLocations = Array.isArray(payload?.data) ? payload.data : [];
      renderRechargeResults(lastLocations, center, radiusKm, payload?.meta);
    } catch (error) {
      setLoading(false);
      renderEmptyResults();
      setStatus(`No se ha podido consultar la red de recarga. ${error.message}`, "error");
    }
  }

  function parseLocationInput(value) {
    if (!value) return null;

    const coordsMatch = value.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
    if (coordsMatch) {
      const lat = Number(coordsMatch[1].replace(",", "."));
      const lon = Number(coordsMatch[2].replace(",", "."));
      if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return { label: "Coordenadas indicadas", lat, lon };
      }
    }

    return CITY_COORDINATES.get(normalizeText(value)) || null;
  }

  function renderRechargeResults(locations, center, radiusKm, meta) {
    setLoading(false);

    if (locations.length === 0) {
      renderEmptyResults();
      dom.updated.textContent = `Última consulta: ${formatDateTime(new Date())}`;
      setStatus(`No se han encontrado puntos en ${radiusKm} km con las páginas consultadas de Mapa REVE.`, "empty");
      return;
    }

    const nearest = locations[0];
    const maxPower = getMaxPowerWatts(locations);
    const coverage = getCoverage(locations.length, radiusKm);
    const latestUpdated = getLatestUpdated(locations);

    dom.count.textContent = String(locations.length);
    dom.nearest.textContent = `${getCompactLocationName(nearest)} · ${formatDistance(nearest.distance_km)} km`;
    dom.power.textContent = maxPower > 0 ? formatPower(maxPower) : "No disponible";
    dom.coverage.textContent = coverage.label;
    dom.coverage.dataset.tone = coverage.tone;
    dom.updated.textContent = latestUpdated
      ? `Última actualización API: ${formatDateTime(latestUpdated)}`
      : `Última consulta: ${formatDateTime(new Date())}`;

    renderMapPoints(locations, center);
    renderLocationCards(locations.slice(0, 6));
    setStatus(`Se han encontrado ${locations.length} puntos en un radio de ${radiusKm} km alrededor de ${center.label}.`, "success");

    if (meta?.note) {
      dom.status.textContent += ` ${meta.note}`;
    }
  }

  function renderEmptyResults() {
    dom.count.textContent = "--";
    dom.nearest.textContent = "--";
    dom.power.textContent = "--";
    dom.coverage.textContent = "--";
    delete dom.coverage.dataset.tone;
    dom.mapPoints.innerHTML = "";
    dom.mapEmpty.hidden = false;
    dom.list.innerHTML = `<p class="recharge-results-list__empty">Todavía no hay puntos para listar.</p>`;
  }

  function renderMapPoints(locations, center) {
    dom.mapPoints.innerHTML = "";
    dom.mapEmpty.hidden = locations.length > 0;

    const bounds = getBounds(locations, center);
    locations.slice(0, 40).forEach((location, index) => {
      const point = getLocationPoint(location);
      if (!point) return;

      const x = project(point.lon, bounds.minLon, bounds.maxLon);
      const y = 100 - project(point.lat, bounds.minLat, bounds.maxLat);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recharge-map__pin";
      button.style.left = `${x}%`;
      button.style.top = `${y}%`;
      button.dataset.locationIndex = String(index);
      button.setAttribute("aria-label", getLocationName(location));
      button.innerHTML = `<span>${index + 1}</span>`;
      dom.mapPoints.appendChild(button);
    });
  }

  function renderLocationCards(locations) {
    dom.list.innerHTML = locations.map((location, index) => {
      const name = escapeHtml(getLocationName(location));
      const address = escapeHtml([location.address, location.city].filter(Boolean).join(", ") || "Dirección no disponible");
      const distance = typeof location.distance_km === "number" ? `${formatDistance(location.distance_km)} km` : "Distancia no disponible";
      const power = getMaxPowerWatts([location]);
      const evseCount = Array.isArray(location.evses) ? location.evses.length : location.evses ? 1 : 0;

      return `
        <article class="recharge-location-card" data-location-card="${index}">
          <div>
            <span class="recharge-location-card__index">${index + 1}</span>
            <h4>${name}</h4>
            <p>${address}</p>
          </div>
          <dl>
            <div><dt>Distancia</dt><dd>${distance}</dd></div>
            <div><dt>Potencia</dt><dd>${power > 0 ? formatPower(power) : "N/D"}</dd></div>
            <div><dt>EVSE</dt><dd>${evseCount}</dd></div>
          </dl>
        </article>
      `;
    }).join("");
  }

  function handleMapPointClick(event) {
    const pin = event.target.closest("[data-location-index]");
    if (!pin) return;

    const index = Number(pin.dataset.locationIndex);
    const card = dom.list.querySelector(`[data-location-card="${index}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      card.classList.add("is-highlighted");
      setTimeout(() => card.classList.remove("is-highlighted"), 1200);
    }
  }

  function getBounds(locations, center) {
    const points = locations.map(getLocationPoint).filter(Boolean);
    points.push({ lat: center.lat, lon: center.lon });

    let minLat = Math.min(...points.map((point) => point.lat));
    let maxLat = Math.max(...points.map((point) => point.lat));
    let minLon = Math.min(...points.map((point) => point.lon));
    let maxLon = Math.max(...points.map((point) => point.lon));

    if (minLat === maxLat) {
      minLat -= 0.02;
      maxLat += 0.02;
    }
    if (minLon === maxLon) {
      minLon -= 0.02;
      maxLon += 0.02;
    }

    return { minLat, maxLat, minLon, maxLon };
  }

  function project(value, min, max) {
    return clamp(((value - min) / (max - min)) * 84 + 8, 6, 94);
  }

  function getLocationPoint(location) {
    const lat = Number(String(location?.coordinates?.latitude || "").replace(",", "."));
    const lon = Number(String(location?.coordinates?.longitude || "").replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  function getLocationName(location) {
    return location.name || location.address || location.id || "Punto de recarga";
  }

  function getCompactLocationName(location) {
    const name = getLocationName(location);
    return name.length > 28 ? `${name.slice(0, 25)}...` : name;
  }

  function getMaxPowerWatts(locations) {
    return locations.reduce((max, location) => {
      const evses = Array.isArray(location.evses) ? location.evses : location.evses ? [location.evses] : [];
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

    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps));
  }

  function collectDate(list, value) {
    if (!value) return;
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) list.push(timestamp);
  }

  function getCoverage(count, radiusKm) {
    const density = count / Math.max(radiusKm, 1);
    if (count >= 12 || density >= 1) return { label: "Alta", tone: "high" };
    if (count >= 4 || density >= 0.25) return { label: "Media", tone: "medium" };
    return { label: "Baja", tone: "low" };
  }

  function setLoading(isLoading, message = "") {
    dom.form.classList.toggle("is-loading", isLoading);
    dom.form.querySelectorAll("button, input, select").forEach((control) => {
      control.disabled = isLoading;
    });
    if (message) setStatus(message, "loading");
  }

  function setStatus(message, tone = "neutral") {
    dom.status.textContent = message;
    dom.status.dataset.tone = tone;
  }

  function normalizeText(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
