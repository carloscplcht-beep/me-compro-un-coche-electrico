const STORAGE_KEY = "vehiculo-electrico-analisis-draft-v1";
const SETTINGS_KEY = "vehiculo-electrico-settings-v1";

const DRIVING_CONSUMPTION = {
  ciudad: 14,
  mixto: 16.5,
  carretera: 19,
};

const TRIP_FREQUENCY_TEXT = {
  nunca: "los viajes largos son casi inexistentes",
  "1-2-ano": "los viajes largos son puntuales",
  mensual: "existen viajes largos mensuales",
  frecuente: "hay viajes largos varias veces al mes",
  semanal: "los viajes largos forman parte de la rutina",
};

const FORM_SECTIONS = [
  {
    id: "uso",
    title: "Uso del vehículo",
    subtitle: "Analizamos intensidad de uso, kilómetros y exigencia de viaje.",
    questions: [
      { id: "kmYear", number: 1, type: "number", label: "¿Cuántos kilómetros recorres al año?", placeholder: "Ej. 18.000", unit: "km/año", min: 1, format: "integer" },
      { id: "kmDaily", number: 2, type: "number", label: "¿Cuántos kilómetros haces en un día habitual?", placeholder: "Ej. 55", unit: "km/día", min: 1, format: "integer" },
      {
        id: "longTripFrequency",
        number: 3,
        type: "select",
        label: "¿Cada cuánto realizas viajes largos de más de 300 km?",
        placeholder: "Selecciona una frecuencia",
        options: [
          { value: "nunca", label: "Nunca" },
          { value: "1-2-ano", label: "1-2 veces al año" },
          { value: "mensual", label: "1 vez al mes" },
          { value: "frecuente", label: "Varias veces al mes" },
          { value: "semanal", label: "Semanalmente" },
        ],
      },
      {
        id: "drivingType",
        number: 4,
        type: "select",
        label: "¿Qué tipo de conducción predomina en tu uso habitual?",
        placeholder: "Selecciona el tipo de conducción",
        options: [
          { value: "ciudad", label: "Ciudad" },
          { value: "mixto", label: "Mixto" },
          { value: "carretera", label: "Carretera/autovía" },
        ],
      },
    ],
  },
  {
    id: "carga",
    title: "Infraestructura de carga",
    subtitle: "Identificamos la comodidad real para recargar el vehículo.",
    questions: [
      { id: "ownGarage", number: 5, type: "choice", label: "¿Dispones de plaza de garaje propia?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      { id: "canInstallCharger", number: 6, type: "choice", label: "¿Puedes instalar un punto de carga en tu plaza?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "no-se", label: "No lo sé" }] },
      { id: "nightCharging", number: 7, type: "choice", label: "¿Podrías cargar el coche de forma habitual por la noche?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      { id: "workCharging", number: 8, type: "choice", label: "¿Tienes posibilidad de cargar en el trabajo?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      { id: "publicChargingWillingness", number: 9, type: "choice", label: "Si no tuvieras carga propia, ¿estarías dispuesto a usar cargadores públicos de forma regular?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
    ],
  },
  {
    id: "vehiculo-actual",
    title: "Vehículo y coste actual",
    subtitle: "Calculamos el coste por kilómetro de tu coche actual.",
    questions: [
      {
        id: "currentFuelType",
        number: 10,
        type: "select",
        label: "¿Qué tipo de combustible utiliza tu coche actual?",
        placeholder: "Selecciona una opción",
        options: [
          { value: "gasolina", label: "Gasolina" },
          { value: "diesel", label: "Diésel" },
          { value: "hibrido-no-enchufable", label: "Híbrido no enchufable" },
          { value: "hibrido-enchufable", label: "Híbrido enchufable" },
          { value: "glp", label: "GLP" },
          { value: "otro", label: "Otro" },
        ],
      },
      { id: "currentConsumption", number: 11, type: "number", label: "¿Cuál es el consumo medio mixto de tu coche actual?", placeholder: "Ej. 5,8", unit: "l/100 km", min: 0.5, format: "decimal" },
      { id: "currentFuelPrice", number: 12, type: "number", label: "¿A qué precio por litro estás repostando habitualmente ahora mismo?", placeholder: "Ej. 1,62", unit: "€/litro", min: 0.5, format: "currency-decimal" },
    ],
  },
  {
    id: "energia",
    title: "Energía y coste eléctrico",
    subtitle: "Ajustamos el coste estimado del eléctrico según tu energía disponible.",
    questions: [
      { id: "homeElectricityPriceCents", number: 13, type: "number", label: "¿Cuál es el precio de tu electricidad en casa?", placeholder: "Ej. 16,5", unit: "c€/kWh", min: 1, format: "decimal" },
      { id: "timeOfUseTariff", number: 14, type: "choice", label: "¿Tienes tarifa con discriminación horaria?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "no-se", label: "No lo sé" }] },
      { id: "solarPanels", number: 15, type: "choice", label: "¿Dispones de placas solares?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
    ],
  },
  {
    id: "economia",
    title: "Economía de la decisión",
    subtitle: "Comparamos presupuesto, precio de compra y amortización esperada.",
    questions: [
      { id: "maxBudget", number: 16, type: "number", label: "¿Qué presupuesto máximo tienes para comprar el vehículo?", placeholder: "Ej. 32.000", unit: "€", min: 1, format: "currency" },
      { id: "evPrice", number: 17, type: "number", label: "¿Cuál es el precio aproximado del vehículo eléctrico que estás valorando?", placeholder: "Ej. 36.500", unit: "€", min: 1, format: "currency" },
      { id: "iceAlternativePrice", number: 18, type: "number", label: "¿Cuál sería el precio de un coche equivalente de combustión que considerarías como alternativa?", placeholder: "Ej. 28.000", unit: "€", min: 1, format: "currency" },
      { id: "willingPayMoreUpfront", number: 19, type: "choice", label: "¿Aceptarías pagar más al inicio si a medio plazo reduces claramente tu coste de uso?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
    ],
  },
  {
    id: "encaje",
    title: "Uso real y tolerancia",
    subtitle: "Determinamos el nivel de fricción que asumirías en el uso cotidiano.",
    questions: [
      { id: "mainVehicle", number: 20, type: "choice", label: "¿El coche será tu vehículo principal?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      { id: "comfortablePlanningCharges", number: 21, type: "choice", label: "¿Te sentirías cómodo planificando paradas de carga en viajes largos?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
    ],
  },
];

const QUESTIONS = FORM_SECTIONS.flatMap((section) => section.questions);
let currentSectionIndex = 0;

const dom = {
  form: document.querySelector("#analysis-form"),
  groups: document.querySelector("#question-groups"),
  sectionNav: document.querySelector("#section-nav"),
  progressText: document.querySelector("#progress-text"),
  progressBar: document.querySelector("#progress-bar"),
  resultsSection: document.querySelector("#results-section"),
  resultsContent: document.querySelector("#results-content"),
  printButton: document.querySelector("#print-button"),
  formWarning: document.querySelector("#form-warning"),
  coherenceWarning: document.querySelector("#coherence-warning"),
  storageToggle: document.querySelector("#storage-toggle"),
  resetFormButton: document.querySelector("#reset-form-button"),
  resetResultsButton: document.querySelector("#reset-results-button"),
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderSections();
  setActiveSection(0, { skipScroll: true, skipAnimation: true, force: true });
  restoreSettings();
  bindEvents();
  restoreDraft();
  updateProgress();
  initRevealObserver();
}

function renderSections() {
  dom.sectionNav.setAttribute("role", "tablist");
  dom.sectionNav.setAttribute("aria-orientation", "horizontal");

  dom.sectionNav.innerHTML = FORM_SECTIONS.map((section, index) => `
    <button
      type="button"
      id="tab-${section.id}"
      class="section-chip ${index === 0 ? "is-active" : ""}"
      role="tab"
      aria-selected="${index === 0 ? "true" : "false"}"
      aria-controls="section-${section.id}"
      tabindex="${index === 0 ? "0" : "-1"}"
      data-tab-trigger
      data-section-index="${index}"
    >
      <span class="section-chip__index">${index + 1}</span>
      <span class="section-chip__meta">
        <span class="section-chip__title">${section.title}</span>
        <span class="section-chip__count" id="nav-count-${section.id}">0 / ${section.questions.length}</span>
      </span>
    </button>
  `).join("");

  dom.groups.innerHTML = FORM_SECTIONS.map((section, index) => `
    <section
      id="section-${section.id}"
      class="question-group reveal ${index === 0 ? "is-active-section" : "is-hidden-section"}"
      role="tabpanel"
      aria-labelledby="tab-${section.id}"
      aria-hidden="${index === 0 ? "false" : "true"}"
      data-section-id="${section.id}"
      data-section-index="${index}"
      tabindex="${index === 0 ? "0" : "-1"}"
    >
      <div class="question-group__head">
        <div>
          <p class="panel__eyebrow">Bloque ${index + 1}</p>
          <h3 class="question-group__title">${section.title}</h3>
          <p class="question-group__subtitle">${section.subtitle}</p>
        </div>
        <div class="question-group__badge" id="badge-${section.id}">0 / ${section.questions.length}</div>
      </div>
      <div class="question-list">
        ${section.questions.map(renderQuestion).join("")}
      </div>
      ${renderSectionNavigation(index)}
    </section>
  `).join("");
}

function renderSectionNavigation(index) {
  const isFirst = index === 0;
  const isLast = index === FORM_SECTIONS.length - 1;

  return `
    <div class="question-group__navigation">
      <button
        type="button"
        class="button button--ghost"
        data-step-direction="previous"
        data-section-index="${index}"
        ${isFirst ? "disabled" : ""}
      >
        Anterior
      </button>
      <p class="question-group__step">Bloque ${index + 1} de ${FORM_SECTIONS.length}</p>
      <button
        type="button"
        class="button button--secondary"
        data-step-direction="next"
        data-section-index="${index}"
        ${isLast ? "disabled" : ""}
      >
        Siguiente
      </button>
    </div>
  `;
}

function renderQuestion(question) {
  if (question.type === "number") {
    return `
      <div class="field" data-field="${question.id}">
        <div class="field__header">
          <span class="field__index">${pad(question.number)}</span>
          <div>
            <p class="field__title">${question.label}</p>
            <p class="field__hint">Dato obligatorio. Se admiten decimales cuando tenga sentido.</p>
          </div>
        </div>
        <div class="input-shell">
          <input class="field__control" type="text" inputmode="decimal" autocomplete="off" id="${question.id}" name="${question.id}" placeholder="${question.placeholder}" data-question-id="${question.id}" data-format="${question.format}">
          <span class="field__unit">${question.unit}</span>
        </div>
        <p class="field__message" id="message-${question.id}"></p>
      </div>
    `;
  }

  if (question.type === "select") {
    return `
      <div class="field" data-field="${question.id}">
        <div class="field__header">
          <span class="field__index">${pad(question.number)}</span>
          <div>
            <p class="field__title">${question.label}</p>
            <p class="field__hint">Selecciona una única opción.</p>
          </div>
        </div>
        <div class="select-shell">
          <select class="field__select" id="${question.id}" name="${question.id}" data-question-id="${question.id}">
            <option value="">${question.placeholder}</option>
            ${question.options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("")}
          </select>
        </div>
        <p class="field__message" id="message-${question.id}"></p>
      </div>
    `;
  }

  return `
    <fieldset class="field" data-field="${question.id}">
      <div class="field__header">
        <span class="field__index">${pad(question.number)}</span>
        <div>
          <p class="field__title">${question.label}</p>
          <p class="field__hint">Selecciona la respuesta que mejor describa tu situación.</p>
        </div>
      </div>
      <div class="choice-grid">
        ${question.options.map((option) => `
          <label>
            <input type="radio" name="${question.id}" value="${option.value}" data-question-id="${question.id}">
            <span class="choice-chip">${option.label}</span>
          </label>
        `).join("")}
      </div>
      <p class="field__message" id="message-${question.id}"></p>
    </fieldset>
  `;
}

function bindEvents() {
  dom.form.addEventListener("submit", handleSubmit);
  dom.printButton.addEventListener("click", () => window.print());
  dom.storageToggle.addEventListener("change", handleStorageToggle);
  dom.resetFormButton.addEventListener("click", resetAnalysis);
  dom.resetResultsButton.addEventListener("click", resetAnalysis);
  dom.sectionNav.addEventListener("click", handleTabNavigation);
  dom.groups.addEventListener("click", handleSequentialNavigation);

  QUESTIONS.forEach((question) => {
    if (question.type === "number") {
      const input = getInputElement(question.id);
      input.addEventListener("focus", () => unformatNumberInput(input));
      input.addEventListener("blur", () => {
        validateField(question.id);
        formatNumberInput(input, question);
        persistDraftIfEnabled();
      });
      input.addEventListener("input", () => {
        clearFieldState(question.id);
        updateProgress();
        persistDraftIfEnabled();
      });
      return;
    }

    if (question.type === "select") {
      const select = getInputElement(question.id);
      select.addEventListener("change", () => {
        validateField(question.id);
        updateProgress();
        persistDraftIfEnabled();
      });
      return;
    }

    document.querySelectorAll(`[name="${question.id}"]`).forEach((input) => {
      input.addEventListener("change", () => {
        validateField(question.id);
        updateProgress();
        persistDraftIfEnabled();
      });
    });
  });
}

function handleTabNavigation(event) {
  const trigger = event.target.closest("[data-tab-trigger]");
  if (!trigger) return;

  setActiveSection(Number(trigger.dataset.sectionIndex));
}

function handleSequentialNavigation(event) {
  const trigger = event.target.closest("[data-step-direction]");
  if (!trigger || trigger.disabled) return;

  const direction = trigger.dataset.stepDirection === "next" ? 1 : -1;
  const sectionIndex = Number(trigger.dataset.sectionIndex);
  setActiveSection(sectionIndex + direction);
}

function setActiveSection(targetIndex, options = {}) {
  if (targetIndex < 0 || targetIndex >= FORM_SECTIONS.length) return;
  if (!options.force && targetIndex === currentSectionIndex) return;

  currentSectionIndex = targetIndex;

  const panels = Array.from(dom.groups.querySelectorAll(".question-group"));
  const tabs = Array.from(dom.sectionNav.querySelectorAll("[data-tab-trigger]"));
  const activePanel = panels[targetIndex];

  panels.forEach((panel, index) => {
    const isActive = index === targetIndex;
    panel.classList.toggle("is-hidden-section", !isActive);
    panel.classList.toggle("is-active-section", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
    panel.tabIndex = isActive ? 0 : -1;

    if (isActive) {
      if (options.skipAnimation) {
        panel.classList.add("is-without-transition");
        requestAnimationFrame(() => panel.classList.remove("is-without-transition"));
      }
      panel.classList.add("is-visible");
    }
  });

  tabs.forEach((tab, index) => {
    const isActive = index === targetIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  if (!options.skipScroll && activePanel) {
    activePanel.scrollIntoView({
      behavior: options.skipAnimation ? "auto" : "smooth",
      block: "start",
    });
  }
}

function handleSubmit(event) {
  event.preventDefault();
  dom.formWarning.classList.add("is-hidden");
  dom.coherenceWarning.classList.add("is-hidden");

  const allValid = QUESTIONS.every((question) => validateField(question.id));
  if (!allValid) {
    dom.formWarning.textContent = "Faltan campos por completar o revisar. Corrige los avisos marcados antes de calcular.";
    dom.formWarning.classList.remove("is-hidden");
    const firstInvalid = document.querySelector(".field.is-invalid");
    if (firstInvalid) {
      const invalidSection = firstInvalid.closest(".question-group");
      if (invalidSection) {
        setActiveSection(Number(invalidSection.dataset.sectionIndex), { skipScroll: true });
      }
      requestAnimationFrame(() => {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    return;
  }

  const answers = collectAnswers();
  const economic = calculateEconomicAnalysis(answers);
  const scoring = calculateViabilityScore(answers, economic);
  const verdict = determineVerdict(answers, economic, scoring);
  const coherenceWarnings = getCoherenceWarnings(answers);
  const narrative = buildQualitativeAnalysis(answers, economic, scoring, verdict, coherenceWarnings);

  renderResults({ answers, economic, scoring, verdict, coherenceWarnings, narrative });
  persistDraftIfEnabled();
  dom.resultsSection.classList.remove("is-hidden");
  dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateField(questionId) {
  const question = QUESTIONS.find((item) => item.id === questionId);
  const value = getFieldValue(question);
  let message = "";

  if (value === "" || value === null || typeof value === "undefined") {
    message = "Este campo es obligatorio.";
  } else if (question.type === "number") {
    if (value < 0) {
      message = "No se permiten valores negativos.";
    } else if (value === 0) {
      message = "Introduce un valor mayor que cero.";
    } else if (question.id === "currentConsumption" && (value < 0.5 || value > 20)) {
      message = "Revisa el consumo: introduce un valor razonable entre 0,5 y 20 l/100 km.";
    } else if (question.id === "currentFuelPrice" && (value < 0.5 || value > 4)) {
      message = "Revisa el precio del combustible: usa una cifra razonable entre 0,5 y 4 €/litro.";
    } else if (question.id === "homeElectricityPriceCents" && (value < 1 || value > 100)) {
      message = "Introduce un precio eléctrico razonable entre 1 y 100 c€/kWh.";
    } else if ((question.id === "evPrice" || question.id === "iceAlternativePrice") && value <= 0) {
      message = "El precio del vehículo debe ser mayor que cero.";
    }
  }

  setFieldState(questionId, message);
  return message === "";
}

function setFieldState(questionId, message) {
  const field = document.querySelector(`[data-field="${questionId}"]`);
  const messageNode = document.querySelector(`#message-${questionId}`);
  field.classList.remove("is-invalid", "is-valid");

  if (message) {
    field.classList.add("is-invalid");
    messageNode.textContent = message;
    return;
  }

  if (isQuestionAnswered(QUESTIONS.find((question) => question.id === questionId))) {
    field.classList.add("is-valid");
  }
  messageNode.textContent = "";
}

function clearFieldState(questionId) {
  const field = document.querySelector(`[data-field="${questionId}"]`);
  const messageNode = document.querySelector(`#message-${questionId}`);
  field.classList.remove("is-invalid", "is-valid");
  messageNode.textContent = "";
}

function collectAnswers() {
  const answers = {};
  QUESTIONS.forEach((question) => {
    answers[question.id] = getFieldValue(question);
  });
  return answers;
}

function calculateEconomicAnalysis(answers) {
  const priceElectricityEurKwh = answers.homeElectricityPriceCents / 100;
  const currentCostPerKm = (answers.currentConsumption * answers.currentFuelPrice) / 100;
  const estimatedElectricConsumption = DRIVING_CONSUMPTION[answers.drivingType];
  const electricCostPerKmBase = (estimatedElectricConsumption * priceElectricityEurKwh) / 100;

  let electricCostPerKmAdjusted = electricCostPerKmBase;
  const adjustments = [];

  if (answers.timeOfUseTariff === "si") {
    electricCostPerKmAdjusted *= 0.9;
    adjustments.push("descuento del 10% por discriminación horaria");
  }

  if (answers.solarPanels === "si") {
    electricCostPerKmAdjusted *= 0.8;
    adjustments.push("descuento del 20% por autoconsumo solar");
  }

  if (
    answers.nightCharging === "no" &&
    answers.workCharging === "no" &&
    answers.publicChargingWillingness === "si"
  ) {
    electricCostPerKmAdjusted *= 1.25;
    adjustments.push("recargo del 25% por dependencia de carga pública");
  }

  const currentAnnualCost = answers.kmYear * currentCostPerKm;
  const estimatedElectricAnnualCost = answers.kmYear * electricCostPerKmAdjusted;
  const annualSavings = currentAnnualCost - estimatedElectricAnnualCost;
  const monthlySavings = annualSavings / 12;
  const savingsPerKm = currentCostPerKm - electricCostPerKmAdjusted;
  const initialPremium = answers.evPrice - answers.iceAlternativePrice;

  let amortizationYears = null;
  let amortizationMessage = "No hay amortización económica en las condiciones introducidas.";

  if (initialPremium <= 0) {
    amortizationYears = 0;
    amortizationMessage = "No existe sobrecoste frente a la alternativa térmica.";
  } else if (annualSavings > 0) {
    amortizationYears = initialPremium / annualSavings;
    amortizationMessage = `Amortización estimada en ${formatYears(amortizationYears)}.`;
  }

  return {
    currentCostPerKm,
    estimatedElectricConsumption,
    priceElectricityEurKwh,
    electricCostPerKmBase,
    electricCostPerKmAdjusted,
    currentAnnualCost,
    estimatedElectricAnnualCost,
    annualSavings,
    monthlySavings,
    savingsPerKm,
    initialPremium,
    amortizationYears,
    amortizationMessage,
    adjustments,
  };
}

function calculateViabilityScore(answers, economic) {
  let infrastructure = 0;
  let usage = 0;
  let energy = 0;
  let economics = 0;
  let fit = 0;
  let penalties = 0;

  if (answers.ownGarage === "si") infrastructure += 10;
  if (answers.canInstallCharger === "si") infrastructure += 10;
  if (answers.nightCharging === "si") infrastructure += 10;
  if (answers.workCharging === "si") infrastructure += 5;

  if (answers.ownGarage === "no" && answers.nightCharging === "no") {
    penalties -= 10;
  }

  if (
    answers.nightCharging === "no" &&
    answers.workCharging === "no" &&
    answers.publicChargingWillingness === "no"
  ) {
    penalties -= 15;
  }

  if (answers.kmDaily <= 80) {
    usage += 10;
  } else if (answers.kmDaily <= 150) {
    usage += 6;
  } else {
    usage += 2;
  }

  if (answers.longTripFrequency === "nunca" || answers.longTripFrequency === "1-2-ano") {
    usage += 10;
  } else if (answers.longTripFrequency === "mensual") {
    usage += 5;
  } else if (answers.longTripFrequency === "frecuente") {
    usage += 2;
  }

  if (answers.drivingType === "ciudad" || answers.drivingType === "mixto") {
    usage += 5;
  } else {
    usage += 2;
  }

  if (economic.priceElectricityEurKwh <= 0.15) {
    energy += 8;
  } else if (economic.priceElectricityEurKwh <= 0.25) {
    energy += 5;
  } else {
    energy += 2;
  }

  if (answers.timeOfUseTariff === "si") energy += 3;
  if (answers.solarPanels === "si") energy += 4;

  if (economic.annualSavings > 1200) {
    economics += 15;
  } else if (economic.annualSavings >= 700) {
    economics += 10;
  } else if (economic.annualSavings >= 300) {
    economics += 6;
  } else if (economic.annualSavings > 0) {
    economics += 3;
  }

  if (answers.mainVehicle === "si") fit += 3;
  if (answers.comfortablePlanningCharges === "si") fit += 4;
  if (answers.willingPayMoreUpfront === "si") fit += 3;

  if (
    answers.mainVehicle === "si" &&
    (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") &&
    answers.comfortablePlanningCharges === "no"
  ) {
    penalties -= 10;
  }

  if (
    answers.nightCharging === "no" &&
    answers.workCharging === "no" &&
    answers.publicChargingWillingness === "no"
  ) {
    penalties -= 20;
  }

  if (answers.evPrice > answers.maxBudget * 1.2) {
    penalties -= 15;
  }

  return {
    total: clamp(infrastructure + usage + energy + economics + fit + penalties, 0, 100),
    breakdown: { infrastructure, usage, energy, economics, fit, penalties },
  };
}

function determineVerdict(answers, economic, scoring) {
  const criticalChargingBlock =
    answers.nightCharging === "no" &&
    answers.workCharging === "no" &&
    answers.publicChargingWillingness === "no";

  const budgetBlock = answers.evPrice > answers.maxBudget * 1.2;
  const demandingUseBlock =
    answers.mainVehicle === "si" &&
    answers.longTripFrequency === "semanal" &&
    answers.comfortablePlanningCharges === "no";

  const noSavings = economic.annualSavings <= 0;
  const limitedProfitability =
    scoring.total >= 60 &&
    economic.annualSavings > 0 &&
    (economic.annualSavings < 700 || (economic.amortizationYears !== null && economic.amortizationYears > 8));

  let label = "No recomendable actualmente";
  let tone = "risk";

  if (scoring.total < 40 || criticalChargingBlock || noSavings || (budgetBlock && noSavings) || (demandingUseBlock && noSavings)) {
    label = "No recomendable actualmente";
  } else if (limitedProfitability) {
    label = "Viable pero poco rentable";
    tone = "warning";
  } else if (scoring.total >= 75 && economic.annualSavings > 0 && !criticalChargingBlock) {
    label = "Muy viable";
    tone = "positive";
  } else if (scoring.total >= 60 && !criticalChargingBlock) {
    label = "Viable con condiciones";
    tone = "positive";
  } else if (scoring.total >= 40) {
    label = "Poco viable";
    tone = "warning";
  }

  return {
    label,
    tone,
    criticalChargingBlock,
    budgetBlock,
    demandingUseBlock,
    noSavings,
    limitedProfitability,
    recommendation: buildRecommendation(label, {
      criticalChargingBlock,
      budgetBlock,
      noSavings,
    }),
  };
}

function buildRecommendation(label, flags) {
  if (label === "Muy viable") {
    return "El vehículo eléctrico encaja muy bien con tu patrón de uso.";
  }

  if (label === "Viable con condiciones") {
    if (flags.criticalChargingBlock) {
      return "Podría ser una buena opción, pero depende de resolver primero la carga habitual.";
    }
    return "Podría ser una buena opción, pero conviene asegurar primero la rutina de carga y el encaje económico.";
  }

  if (label === "Viable pero poco rentable") {
    return "La compra podría tener sentido ambiental o tecnológico, pero no por ahorro.";
  }

  if (label === "Poco viable") {
    return "En tu caso, hoy por hoy, un eléctrico puro puede no ser la alternativa más cómoda.";
  }

  if (flags.noSavings || flags.budgetBlock) {
    return "Conviene esperar o valorar una alternativa híbrida o térmica eficiente.";
  }

  return "Podría ser una buena opción, pero depende de resolver primero la carga habitual.";
}

function buildQualitativeAnalysis(answers, economic, scoring, verdict, coherenceWarnings) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (answers.nightCharging === "si") strengths.push("Tienes una opción de carga habitual por la noche, que es el escenario más cómodo para un eléctrico.");
  if (answers.workCharging === "si") strengths.push("La carga en el trabajo aporta una red de seguridad operativa muy valiosa.");
  if (answers.kmDaily <= 80) strengths.push("Tu kilometraje diario encaja bien con la autonomía habitual de un vehículo eléctrico moderno.");
  if (answers.longTripFrequency === "nunca" || answers.longTripFrequency === "1-2-ano") strengths.push("Los viajes largos son poco frecuentes, por lo que las paradas de carga tendrían un impacto bajo.");
  if (economic.annualSavings >= 700) strengths.push("El ahorro anual estimado es suficientemente relevante como para apoyar la decisión por coste de uso.");
  if (answers.solarPanels === "si") strengths.push("Las placas solares mejoran el coste operativo y elevan la coherencia económica del cambio.");

  if (answers.nightCharging === "no" && answers.workCharging === "no") weaknesses.push("No aparece una fuente de carga habitual clara, lo que reduce comodidad y previsibilidad.");
  if (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") weaknesses.push("La frecuencia de viajes largos introduce una exigencia operativa superior a la media.");
  if (answers.comfortablePlanningCharges === "no") weaknesses.push("La baja tolerancia a planificar recargas puede hacer que el uso real se perciba más incómodo.");
  if (economic.annualSavings <= 0) weaknesses.push("Con los precios introducidos no aparece ahorro de uso frente a tu coche actual.");
  if (economic.amortizationYears !== null && economic.amortizationYears > 8) weaknesses.push("La amortización del sobrecoste inicial se alarga bastante en el tiempo.");
  if (answers.evPrice > answers.maxBudget * 1.2) weaknesses.push("El precio del eléctrico se sitúa claramente por encima del presupuesto máximo declarado.");

  if (answers.canInstallCharger === "no-se") recommendations.push("Confirma primero si la instalación de un punto de carga en tu plaza es viable y en qué condiciones.");
  if (answers.nightCharging === "no" && answers.workCharging === "no" && answers.publicChargingWillingness === "si") recommendations.push("Antes de decidir, revisa disponibilidad, precios y fiabilidad de la red pública en tus trayectos habituales.");
  if (economic.annualSavings > 0 && economic.annualSavings < 700) recommendations.push("Si priorizas la rentabilidad, compara modelos eléctricos más eficientes o con mejor precio de compra.");
  if (answers.evPrice > answers.maxBudget * 1.2) recommendations.push("Puede tener más sentido esperar ayudas, ofertas o valorar un modelo eléctrico más accesible.");
  if (answers.mainVehicle === "si" && (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") && answers.comfortablePlanningCharges === "no") recommendations.push("Si buscas máxima despreocupación en viaje, merece la pena comparar también híbridos enchufables o térmicos eficientes.");
  if (recommendations.length === 0) recommendations.push("El siguiente paso razonable es comparar modelos concretos, autonomía real y coste de seguro antes de decidir.");
  if (strengths.length === 0) strengths.push("No aparecen ventajas dominantes muy claras, lo que ya es una señal de prudencia en la decisión.");
  if (weaknesses.length === 0) weaknesses.push("No destacan barreras críticas evidentes en los datos introducidos.");

  const paragraphs = [
    `${verdict.label} para tu escenario actual. El encaje práctico se apoya en que ${buildOperationalLead(answers)}, mientras que ${buildOperationalRisk(answers)}.`,
    `Desde el punto de vista operativo, el nivel de comodidad esperado es ${getComfortLevel(answers)}. En tu caso ${TRIP_FREQUENCY_TEXT[answers.longTripFrequency]} y la conducción predominante es ${humanizeDrivingType(answers.drivingType)}, dos factores que pesan bastante en el uso real.`,
    `Económicamente, la valoración general es ${getEconomicView(economic)}: el coste actual estimado es de ${formatCurrency(economic.currentAnnualCost)} al año frente a ${formatCurrency(economic.estimatedElectricAnnualCost)} en el escenario eléctrico. ${buildAmortizationSentence(economic)}`,
    `La conclusión final es que ${buildFinalConclusion(verdict, scoring, coherenceWarnings.length > 0)}.`,
  ];

  return { strengths, weaknesses, recommendations, paragraphs };
}

function renderResults(payload) {
  const { answers, economic, scoring, verdict, coherenceWarnings, narrative } = payload;
  const analysisDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date());

  dom.resultsContent.innerHTML = `
    <div class="results-grid">
      <div class="result-stack">
        <article class="result-card result-card--hero reveal">
          <span class="verdict-badge ${getVerdictBadgeClass(verdict.tone)}">${verdict.label}</span>
          <h3 class="verdict-title">${verdict.recommendation}</h3>
          <p class="recommendation">Resultado generado el ${analysisDate}. La lectura combina viabilidad práctica, economía y nivel de fricción esperado.</p>
          <p class="executive-copy">${narrative.paragraphs[0]}</p>
          <div class="tag-list">
            ${buildExecutiveTags(payload).map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
        </article>

        <article class="result-card reveal">
          <h4>Métricas principales</h4>
          <div class="metric-grid">
            ${renderMetric("Ahorro anual estimado", formatSignedCurrency(economic.annualSavings))}
            ${renderMetric("Ahorro mensual estimado", formatSignedCurrency(economic.monthlySavings))}
            ${renderMetric("Coste actual por km", formatCurrencyPerKm(economic.currentCostPerKm))}
            ${renderMetric("Coste eléctrico por km", formatCurrencyPerKm(economic.electricCostPerKmAdjusted))}
            ${renderMetric("Sobrecoste inicial vs. térmico", formatSignedCurrency(economic.initialPremium))}
            ${renderMetric("Amortización estimada", getAmortizationDisplay(economic))}
          </div>
          <p class="executive-copy">Ajustes de coste eléctrico: ${economic.adjustments.length > 0 ? economic.adjustments.join(", ") : "sin ajustes adicionales relevantes."}</p>
        </article>

        <article class="result-card reveal">
          <h4>Comparativa anual de coste de uso</h4>
          <div class="comparison-chart">
            ${buildCostChartMarkup(economic.currentAnnualCost, economic.estimatedElectricAnnualCost)}
          </div>
        </article>

        <article class="result-card reveal">
          <h4>Análisis cualitativo</h4>
          <div class="narrative">
            ${narrative.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          </div>
        </article>
      </div>

      <div class="result-stack">
        <article class="result-card reveal">
          <div class="score-panel">
            <div class="score-ring" style="--angle: 0deg;" data-score-ring>
              <div class="score-ring__content">
                <span class="score-ring__value" data-score-value>0</span>
                <span class="score-ring__label">score de viabilidad</span>
              </div>
            </div>
            <p class="score-summary">${getScoreSummary(scoring.total)}</p>
          </div>
          <div class="score-breakdown">
            ${renderScoreRow("Infraestructura de carga", scoring.breakdown.infrastructure, 35)}
            ${renderScoreRow("Patrón de uso", scoring.breakdown.usage, 25)}
            ${renderScoreRow("Condiciones energéticas", scoring.breakdown.energy, 15)}
            ${renderScoreRow("Viabilidad económica", scoring.breakdown.economics, 15)}
            ${renderScoreRow("Tolerancia y encaje", scoring.breakdown.fit, 10)}
            ${renderScoreRow("Penalizaciones prácticas", Math.abs(scoring.breakdown.penalties), 20, true)}
          </div>
        </article>

        <article class="result-card reveal">
          <h4>Puntos clave</h4>
          <div class="analysis-columns">
            <section class="insight-card insight-card--positive">
              <h4>Puntos fuertes</h4>
              <ul class="insight-list">
                ${narrative.strengths.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </section>
            <section class="insight-card insight-card--negative">
              <h4>Puntos débiles</h4>
              <ul class="insight-list">
                ${narrative.weaknesses.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </section>
            <section class="insight-card insight-card--advice">
              <h4>Recomendaciones</h4>
              <ul class="insight-list">
                ${narrative.recommendations.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </section>
          </div>
        </article>
      </div>
    </div>
  `;

  if (coherenceWarnings.length > 0) {
    dom.coherenceWarning.textContent = "Algunos datos parecen poco coherentes entre sí. El resultado se ha calculado igualmente, pero conviene revisar las cifras para obtener una estimación más precisa.";
    dom.coherenceWarning.classList.remove("is-hidden");
  } else {
    dom.coherenceWarning.classList.add("is-hidden");
  }

  animateResultVisuals(scoring.total, economic.currentAnnualCost, economic.estimatedElectricAnnualCost);
  initRevealObserver();
}

function animateResultVisuals(score, currentAnnualCost, electricAnnualCost) {
  const ring = dom.resultsContent.querySelector("[data-score-ring]");
  const scoreValue = dom.resultsContent.querySelector("[data-score-value]");
  const fills = Array.from(dom.resultsContent.querySelectorAll("[data-fill-width]"));
  const costMax = Math.max(currentAnnualCost, electricAnnualCost, 1);
  const duration = 820;
  const start = performance.now();

  requestAnimationFrame(function animate(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentScore = Math.round(score * eased);
    ring.style.setProperty("--angle", `${currentScore * 3.6}deg`);
    scoreValue.textContent = `${currentScore}`;

    fills.forEach((fill) => {
      fill.style.width = `${Number(fill.dataset.fillWidth) * eased}%`;
    });

    dom.resultsContent.querySelector("[data-chart-current]").style.width = `${(currentAnnualCost / costMax) * 100 * eased}%`;
    dom.resultsContent.querySelector("[data-chart-electric]").style.width = `${(electricAnnualCost / costMax) * 100 * eased}%`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  });
}

function resetAnalysis() {
  const shouldReset = window.confirm("Se borrarán los datos introducidos y el guardado local de este análisis. ¿Quieres continuar?");
  if (!shouldReset) return;

  dom.form.reset();
  QUESTIONS.forEach((question) => {
    const field = document.querySelector(`[data-field="${question.id}"]`);
    const messageNode = document.querySelector(`#message-${question.id}`);
    if (field) field.classList.remove("is-invalid", "is-valid");
    if (messageNode) messageNode.textContent = "";
    if (question.type === "number") {
      const input = getInputElement(question.id);
      input.value = "";
      delete input.dataset.numericValue;
    }
  });

  dom.formWarning.classList.add("is-hidden");
  dom.coherenceWarning.classList.add("is-hidden");
  dom.resultsSection.classList.add("is-hidden");
  dom.resultsContent.innerHTML = "";
  clearDraft();
  setActiveSection(0, { skipScroll: true, skipAnimation: true, force: true });
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restoreDraft() {
  if (!dom.storageToggle.checked) return;

  const draft = readStorage(STORAGE_KEY);
  if (!draft) return;

  QUESTIONS.forEach((question) => {
    const rawValue = draft[question.id];
    if (typeof rawValue === "undefined" || rawValue === null || rawValue === "") return;

    if (question.type === "number") {
      const input = getInputElement(question.id);
      const numericValue = parseFlexibleNumber(rawValue);
      if (numericValue !== null) {
        input.dataset.numericValue = String(numericValue);
        formatNumberInput(input, question, numericValue);
      } else {
        input.value = rawValue;
      }
      return;
    }

    if (question.type === "select") {
      getInputElement(question.id).value = rawValue;
      return;
    }

    const radio = document.querySelector(`[name="${question.id}"][value="${rawValue}"]`);
    if (radio) radio.checked = true;
  });

  updateProgress();
}

function persistDraftIfEnabled() {
  if (!dom.storageToggle.checked) return;

  const draft = {};
  QUESTIONS.forEach((question) => {
    const value = getRawFieldValue(question);
    if (value !== "" && value !== null && typeof value !== "undefined") {
      draft[question.id] = value;
    }
  });

  writeStorage(STORAGE_KEY, draft);
}

function handleStorageToggle() {
  writeStorage(SETTINGS_KEY, { storageEnabled: dom.storageToggle.checked });
  if (!dom.storageToggle.checked) {
    clearDraft();
    return;
  }
  persistDraftIfEnabled();
}

function restoreSettings() {
  const settings = readStorage(SETTINGS_KEY);
  dom.storageToggle.checked = settings?.storageEnabled ?? true;
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

function updateProgress() {
  const answered = QUESTIONS.filter((question) => isQuestionAnswered(question)).length;
  dom.progressText.textContent = `${answered} de ${QUESTIONS.length} respuestas completadas`;
  dom.progressBar.style.width = `${(answered / QUESTIONS.length) * 100}%`;

  FORM_SECTIONS.forEach((section) => {
    const answeredInSection = section.questions.filter((question) => isQuestionAnswered(question)).length;
    const label = `${answeredInSection} / ${section.questions.length}`;
    const countNode = document.querySelector(`#nav-count-${section.id}`);
    const badgeNode = document.querySelector(`#badge-${section.id}`);
    if (countNode) countNode.textContent = label;
    if (badgeNode) badgeNode.textContent = label;
  });
}

function isQuestionAnswered(question) {
  const value = getFieldValue(question);
  return value !== "" && value !== null && typeof value !== "undefined";
}

function getFieldValue(question) {
  if (question.type === "number") {
    const input = getInputElement(question.id);
    return parseFlexibleNumber(input.dataset.numericValue ?? input.value);
  }

  if (question.type === "select") {
    return getInputElement(question.id).value || "";
  }

  const checked = document.querySelector(`[name="${question.id}"]:checked`);
  return checked ? checked.value : "";
}

function getRawFieldValue(question) {
  if (question.type === "number") {
    const input = getInputElement(question.id);
    return input.dataset.numericValue ?? input.value.trim();
  }

  return getFieldValue(question);
}

function getInputElement(id) {
  return document.querySelector(`#${id}`);
}

function getCoherenceWarnings(answers) {
  const warnings = [];

  if (answers.kmYear < answers.kmDaily * 80 || answers.kmYear > answers.kmDaily * 365) warnings.push("La relación entre kilómetros diarios y anuales parece atípica.");
  if (answers.nightCharging === "si" && answers.ownGarage === "no") warnings.push("Indicas carga nocturna habitual pese a no disponer de plaza propia.");
  if (answers.canInstallCharger === "si" && answers.ownGarage === "no") warnings.push("Aparece instalación de carga viable sin plaza de garaje propia.");
  if (answers.currentConsumption < 2 && answers.currentFuelType !== "hibrido-enchufable") warnings.push("El consumo declarado es muy bajo para un vehículo no enchufable.");
  if (answers.homeElectricityPriceCents > 45 && answers.timeOfUseTariff === "si") warnings.push("El precio eléctrico parece alto incluso con discriminación horaria.");
  if (answers.evPrice <= answers.iceAlternativePrice && answers.willingPayMoreUpfront === "no") warnings.push("No existe sobrecoste inicial, pero indicas que no aceptarías pagar más al inicio.");

  return warnings;
}

function getComfortLevel(answers) {
  if ((answers.nightCharging === "si" || answers.workCharging === "si") && answers.comfortablePlanningCharges === "si") return "alto";
  if (answers.publicChargingWillingness === "si" || answers.comfortablePlanningCharges === "si") return "medio";
  return "bajo";
}

function getEconomicView(economic) {
  if (economic.annualSavings > 1200) return "claramente favorable";
  if (economic.annualSavings >= 700) return "positiva";
  if (economic.annualSavings > 0) return "ajustada";
  return "débil o negativa";
}

function buildOperationalLead(answers) {
  if (answers.nightCharging === "si" && answers.kmDaily <= 80) return "tu rutina diaria es muy compatible con la lógica de carga doméstica";
  if (answers.workCharging === "si") return "dispones de una alternativa práctica para mantener el coche cargado";
  if (answers.publicChargingWillingness === "si") return "aceptarías apoyarte en la red pública si fuera necesario";
  return "no hay un gran problema de autonomía en el uso diario declarado";
}

function buildOperationalRisk(answers) {
  if (answers.nightCharging === "no" && answers.workCharging === "no") return "la ausencia de una carga habitual añade fricción operativa";
  if (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") return "la frecuencia de viajes largos obliga a convivir mejor con la planificación";
  return "los condicionantes operativos están relativamente contenidos";
}

function buildAmortizationSentence(economic) {
  if (economic.initialPremium <= 0) return "Además, no existe sobrecoste inicial frente a la alternativa térmica considerada.";
  if (economic.annualSavings <= 0) return "Con estas cifras no aparece una amortización económica del sobrecoste inicial.";
  return `El sobrecoste inicial se recuperaría en torno a ${formatYears(economic.amortizationYears)}.`;
}

function buildFinalConclusion(verdict, scoring, hasCoherenceWarnings) {
  const coherenceClause = hasCoherenceWarnings
    ? "aunque conviene revisar algunos datos de entrada para afinar la estimación"
    : "con una base suficientemente coherente en los datos introducidos";

  if (verdict.label === "Muy viable") return `el eléctrico encaja bien y ofrece un equilibrio sólido entre uso diario, coste operativo y comodidad, ${coherenceClause}`;
  if (verdict.label === "Viable con condiciones") return `la decisión puede tener sentido si aseguras bien la infraestructura de carga y aceptas algunas condiciones prácticas, ${coherenceClause}`;
  if (verdict.label === "Viable pero poco rentable") return `el encaje práctico existe, pero la compra no destaca por rentabilidad y debería justificarse por otros motivos además del ahorro, ${coherenceClause}`;
  if (verdict.label === "Poco viable") return `el cambio sería posible solo con concesiones operativas relevantes y no aparece hoy como la alternativa más cómoda, ${coherenceClause}`;
  return `el contexto actual acumula barreras prácticas y económicas suficientes como para recomendar prudencia o una alternativa distinta, ${coherenceClause}`;
}

function buildExecutiveTags(payload) {
  const { answers, economic, scoring, verdict } = payload;
  const tags = [];
  tags.push(`${Math.round(scoring.total)}/100 de viabilidad`);
  tags.push(answers.nightCharging === "si" ? "Carga nocturna disponible" : "Sin carga nocturna habitual");
  tags.push(economic.annualSavings > 0 ? `${formatCurrency(economic.annualSavings)} de ahorro anual` : "Sin ahorro económico directo");
  if (verdict.criticalChargingBlock) tags.push("Bloqueo crítico de carga");
  else if (answers.workCharging === "si") tags.push("Apoyo adicional en carga laboral");
  return tags.slice(0, 4);
}

function getScoreSummary(score) {
  if (score >= 75) return "El contexto operativo y económico es fuerte. El cambio a un eléctrico tiene una base clara para funcionar bien.";
  if (score >= 60) return "Hay un encaje razonable, aunque conviene cerrar bien algunos condicionantes antes de comprar.";
  if (score >= 40) return "El caso presenta fricciones relevantes. La decisión podría funcionar, pero no sería especialmente cómoda.";
  return "El escenario actual reúne demasiadas barreras para recomendar un eléctrico puro con tranquilidad.";
}

function buildCostChartMarkup(currentAnnualCost, electricAnnualCost) {
  return `
    <div class="chart-row">
      <div class="chart-row__meta">
        <span class="chart-row__label">Coste anual actual</span>
        <span class="chart-row__value">${formatCurrency(currentAnnualCost)}</span>
      </div>
      <div class="chart-row__track">
        <div class="chart-row__fill chart-row__fill--current" data-chart-current></div>
      </div>
    </div>
    <div class="chart-row">
      <div class="chart-row__meta">
        <span class="chart-row__label">Coste anual estimado en eléctrico</span>
        <span class="chart-row__value">${formatCurrency(electricAnnualCost)}</span>
      </div>
      <div class="chart-row__track">
        <div class="chart-row__fill chart-row__fill--electric" data-chart-electric></div>
      </div>
    </div>
  `;
}

function renderMetric(label, value) {
  return `
    <div class="metric">
      <span class="metric__label">${label}</span>
      <span class="metric__value">${value}</span>
    </div>
  `;
}

function renderScoreRow(label, value, max, isPenalty = false) {
  const width = clamp((value / max) * 100, 0, 100);
  const shownValue = isPenalty ? `-${value}` : `${value}`;
  return `
    <div class="score-row">
      <div class="score-row__meta">
        <span>${label}</span>
        <strong>${shownValue}</strong>
      </div>
      <div class="score-row__track">
        <div class="score-row__fill" data-fill-width="${width}"></div>
      </div>
    </div>
  `;
}

function parseFlexibleNumber(value) {
  if (value === null || typeof value === "undefined") return null;

  let normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/[€c]/g, "")
    .replace(/km\/año|km\/día|l\/100km|l\/100 km|\/litro|\/kWh/gi, "")
    .replace(/[^\d,.\-]/g, "");

  if (!normalized) return null;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (hasComma) {
    const decimalPart = normalized.split(",").pop();
    normalized = decimalPart.length <= 2
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized.replace(/,/g, "");
  } else if (hasDot) {
    const decimalPart = normalized.split(".").pop();
    normalized = decimalPart.length <= 2
      ? normalized
      : normalized.replace(/\./g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberInput(input, question, explicitValue = null) {
  const value = explicitValue ?? parseFlexibleNumber(input.dataset.numericValue ?? input.value);
  if (value === null) return;

  input.dataset.numericValue = String(value);

  if (question.format === "currency" || question.format === "integer") {
    input.value = formatPlainNumber(value, 0);
    return;
  }

  if (question.format === "currency-decimal") {
    input.value = formatPlainNumber(value, value % 1 === 0 ? 0 : 2);
    return;
  }

  input.value = formatPlainNumber(value, value % 1 === 0 ? 0 : 1);
}

function unformatNumberInput(input) {
  if (!input.dataset.numericValue) return;
  input.value = String(input.dataset.numericValue).replace(".", ",");
}

function formatPlainNumber(value, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value) {
  if (value === 0) return "0 €";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    signDisplay: "always",
  }).format(value);
}

function formatCurrencyPerKm(value) {
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)} €/km`;
}

function formatYears(value) {
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} años`;
}

function getAmortizationDisplay(economic) {
  if (economic.initialPremium <= 0) return "Sin sobrecoste";
  if (economic.annualSavings <= 0 || economic.amortizationYears === null) return "Sin amortización";
  return formatYears(economic.amortizationYears);
}

function getVerdictBadgeClass(tone) {
  if (tone === "warning") return "verdict-badge--warning";
  if (tone === "risk") return "verdict-badge--risk";
  return "";
}

function humanizeDrivingType(value) {
  if (value === "ciudad") return "urbana";
  if (value === "mixto") return "mixta";
  return "de carretera/autovía";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignoramos fallos de almacenamiento para no romper el flujo principal.
  }
}

function initRevealObserver() {
  const elements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((element) => {
    if (!element.classList.contains("is-visible")) observer.observe(element);
  });
}
