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
      {
        id: "canInstallCharger",
        number: 6,
        type: "choice",
        label: "¿Puedes instalar un punto de carga en tu plaza?",
        help: "En garajes comunitarios, la instalación de un punto de recarga para uso privado suele requerir comunicación previa a la comunidad y asumir el coste de instalación y consumo. Comprueba siempre las condiciones técnicas de tu garaje y la normativa aplicable.",
        options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "no-se", label: "No lo sé" }]
      },
      { id: "nightCharging", number: 7, type: "choice", label: "¿Podrías cargar el coche de forma habitual por la noche?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      { id: "workCharging", number: 8, type: "choice", label: "¿Tienes posibilidad de cargar en el trabajo?", options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] },
      {
        id: "publicChargingWillingness",
        number: 9,
        type: "choice",
        label: "Si no tuvieras carga propia, ¿estarías dispuesto a usar cargadores públicos de forma regular?",
        help: "Algunos operadores ofrecen tarifas o suscripciones que pueden reducir el coste de la recarga pública o rápida. Usa en el cálculo un precio medio realista según el uso que esperas hacer.",
        options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }]
      },
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
      {
        id: "evPrice",
        number: 17,
        type: "number",
        label: "¿Cuál es el precio aproximado del vehículo eléctrico que estás valorando?",
        placeholder: "Ej. 36.500",
        unit: "€",
        min: 1,
        format: "currency",
        help: "Introduce el precio aproximado de compra antes de ayudas. Si quieres considerar ayudas públicas, usa también la pregunta específica sobre ayudas. Si no sabes el precio, consulta una fuente externa de precios de vehículos y vuelve a introducir una cifra aproximada."
      },
      {
        id: "iceAlternativePrice",
        number: 18,
        type: "number",
        label: "¿Cuál sería el precio de un coche equivalente de combustión que considerarías como alternativa?",
        placeholder: "Ej. 28.000",
        unit: "€",
        min: 1,
        format: "currency",
        help: "Introduce el precio aproximado de una alternativa térmica razonablemente comparable en tamaño, uso y equipamiento. No es necesario que sea exacto; la herramienta mostrará una estimación orientativa. Si no sabes el precio, consulta una fuente externa de precios de vehículos y vuelve a introducir una cifra aproximada."
      },
      {
        id: "publicAidConsidered",
        number: "18A",
        type: "choice",
        label: "¿Estás considerando alguna ayuda pública o incentivo para la compra?",
        help: "Las ayudas públicas pueden variar por convocatoria y territorio. En muchos casos el comprador debe adelantar el importe total y recibir la ayuda más adelante. Usa un importe prudente y comprueba siempre las condiciones oficiales vigentes.",
        options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "no-se", label: "No lo sé" }]
      },
      {
        id: "publicAidAmount",
        number: "18B",
        type: "number",
        label: "Importe estimado de la ayuda",
        placeholder: "Ej. 4.500",
        unit: "€",
        min: 0,
        format: "currency",
        optional: true,
        dependsOn: { id: "publicAidConsidered", value: "si" }
      },
      {
        id: "aidAdvanceCapacity",
        number: "18C",
        type: "choice",
        label: "¿Puedes asumir el desembolso inicial hasta recibir la ayuda?",
        optional: true,
        dependsOn: { id: "publicAidConsidered", value: "si" },
        options: [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "no-se", label: "No lo sé" }]
      },
      {
        id: "currentMaintenanceAnnual",
        number: "18D",
        type: "number",
        label: "¿Cuánto pagas aproximadamente al año en mantenimiento del coche actual?",
        placeholder: "Ej. 450",
        unit: "€/año",
        min: 0,
        format: "currency",
        optional: true,
        help: "Incluye revisiones, aceite, filtros, pequeñas reparaciones habituales u otros gastos de mantenimiento ordinario. No incluyas seguro, impuestos, neumáticos ni averías extraordinarias si no quieres distorsionar el cálculo."
      },
      {
        id: "evMaintenanceAnnual",
        number: "18E",
        type: "number",
        label: "¿Cuánto estimas que pagarías al año en mantenimiento del vehículo eléctrico?",
        placeholder: "Ej. 250",
        unit: "€/año",
        min: 0,
        format: "currency",
        optional: true,
        help: "Si no lo sabes, puedes dejarlo en blanco. El mantenimiento de un eléctrico suele ser distinto al de un vehículo de combustión, pero depende del modelo, garantía, uso y taller."
      },
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
const REQUIRED_QUESTIONS = QUESTIONS.filter((question) => !question.optional);
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
  updateConditionalQuestions({ clearHidden: false });
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
        <span class="section-chip__count" id="nav-count-${section.id}">0 / ${getRequiredQuestions(section).length}</span>
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
        <div class="question-group__badge" id="badge-${section.id}">0 / ${getRequiredQuestions(section).length}</div>
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
      <div class="field ${question.dependsOn ? "is-conditional-field" : ""}" data-field="${question.id}" ${renderDependencyAttributes(question)}>
        <div class="field__header">
          <span class="field__index">${pad(question.number)}</span>
          <div>
            <div class="field__title-row">
              <p class="field__title">${question.label}</p>
              ${renderHelpButton(question)}
            </div>
            <p class="field__hint">${question.optional ? "Dato opcional. Puedes dejarlo en blanco si no lo conoces." : "Dato obligatorio. Se admiten decimales con coma o punto cuando tenga sentido."}</p>
          </div>
        </div>
        ${renderHelpPanel(question)}
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
      <div class="field ${question.dependsOn ? "is-conditional-field" : ""}" data-field="${question.id}" ${renderDependencyAttributes(question)}>
        <div class="field__header">
          <span class="field__index">${pad(question.number)}</span>
          <div>
            <div class="field__title-row">
              <p class="field__title">${question.label}</p>
              ${renderHelpButton(question)}
            </div>
            <p class="field__hint">${question.optional ? "Dato opcional para afinar el escenario." : "Selecciona una única opción."}</p>
          </div>
        </div>
        ${renderHelpPanel(question)}
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
    <fieldset class="field ${question.dependsOn ? "is-conditional-field" : ""}" data-field="${question.id}" ${renderDependencyAttributes(question)}>
      <div class="field__header">
        <span class="field__index">${pad(question.number)}</span>
        <div>
          <div class="field__title-row">
            <p class="field__title">${question.label}</p>
            ${renderHelpButton(question)}
          </div>
          <p class="field__hint">${question.optional ? "Dato opcional para mostrar un escenario adicional." : "Selecciona la respuesta que mejor describa tu situación."}</p>
        </div>
      </div>
      ${renderHelpPanel(question)}
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

function renderDependencyAttributes(question) {
  if (!question.dependsOn) return "";
  return `data-depends-on="${question.dependsOn.id}" data-depends-value="${question.dependsOn.value}" hidden`;
}

function renderHelpButton(question) {
  if (!question.help) return "";
  return `
    <button
      type="button"
      class="field-help-toggle"
      aria-label="Mostrar ayuda sobre: ${question.label}"
      aria-controls="help-${question.id}"
      aria-expanded="false"
      data-help-toggle="${question.id}"
    >
      ?
    </button>
  `;
}

function renderHelpPanel(question) {
  if (!question.help) return "";
  return `
    <div class="field-help" id="help-${question.id}" hidden>
      <p>${question.help}</p>
      <button type="button" class="field-help__close" data-help-close="${question.id}">Cerrar</button>
    </div>
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
  dom.groups.addEventListener("click", handleHelpInteraction);

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
        // Evita recalcular con un valor antiguo si el usuario edita y envía sin perder el foco.
        delete input.dataset.numericValue;
        clearFieldState(question.id);
        updateConditionalQuestions();
        updateProgress();
        persistDraftIfEnabled();
      });
      return;
    }

    if (question.type === "select") {
      const select = getInputElement(question.id);
      select.addEventListener("change", () => {
        validateField(question.id);
        updateConditionalQuestions();
        updateProgress();
        persistDraftIfEnabled();
      });
      return;
    }

    document.querySelectorAll(`[name="${question.id}"]`).forEach((input) => {
      input.addEventListener("change", () => {
        validateField(question.id);
        updateConditionalQuestions();
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

  if (direction > 0 && !validateSection(sectionIndex)) {
    return;
  }

  dom.formWarning.classList.add("is-hidden");
  setActiveSection(sectionIndex + direction);
}

function handleHelpInteraction(event) {
  const toggle = event.target.closest("[data-help-toggle]");
  if (toggle) {
    const helpId = toggle.dataset.helpToggle;
    const panel = document.querySelector(`#help-${helpId}`);
    if (!panel) return;

    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));
    return;
  }

  const close = event.target.closest("[data-help-close]");
  if (close) {
    const helpId = close.dataset.helpClose;
    const panel = document.querySelector(`#help-${helpId}`);
    const toggleButton = document.querySelector(`[data-help-toggle="${helpId}"]`);
    if (panel) panel.hidden = true;
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.focus();
    }
  }
}

function validateSection(sectionIndex) {
  const section = FORM_SECTIONS[sectionIndex];
  const invalidQuestion = section.questions.find((question) => shouldValidateQuestion(question) && !validateField(question.id));
  if (!invalidQuestion) return true;

  const field = document.querySelector(`[data-field="${invalidQuestion.id}"]`);
  if (field) {
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  dom.formWarning.textContent = "Completa o revisa los campos obligatorios de este bloque antes de continuar.";
  dom.formWarning.classList.remove("is-hidden");
  return false;
}

function getRequiredQuestions(section) {
  return section.questions.filter((question) => !question.optional);
}

function shouldValidateQuestion(question) {
  if (!question || !isQuestionVisible(question)) return false;
  if (!question.optional) return true;

  const value = getFieldValue(question);
  return value !== "" && value !== null && typeof value !== "undefined";
}

function isQuestionVisible(question) {
  if (!question?.dependsOn) return true;
  return getFieldValue(QUESTIONS.find((item) => item.id === question.dependsOn.id)) === question.dependsOn.value;
}

function updateConditionalQuestions(options = {}) {
  const { clearHidden = true } = options;

  QUESTIONS.forEach((question) => {
    if (!question.dependsOn) return;

    const field = document.querySelector(`[data-field="${question.id}"]`);
    if (!field) return;

    const isVisible = isQuestionVisible(question);
    field.hidden = !isVisible;
    field.classList.toggle("is-hidden-field", !isVisible);

    if (!isVisible && clearHidden) {
      clearQuestionValue(question);
      setFieldState(question.id, "");
    }
  });
}

function clearQuestionValue(question) {
  if (question.type === "number") {
    const input = getInputElement(question.id);
    input.value = "";
    delete input.dataset.numericValue;
    return;
  }

  if (question.type === "select") {
    getInputElement(question.id).value = "";
    return;
  }

  document.querySelectorAll(`[name="${question.id}"]`).forEach((input) => {
    input.checked = false;
  });
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
  if (!shouldValidateQuestion(question)) {
    setFieldState(questionId, "");
    return true;
  }

  const value = getFieldValue(question);
  let message = "";

  if (value === "" || value === null || typeof value === "undefined") {
    message = "Este campo es obligatorio.";
  } else if (question.type === "number") {
    if (value < 0) {
      message = "No se permiten valores negativos.";
    } else if (value === 0 && question.min !== 0) {
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
  const currentMonthlyCost = currentAnnualCost / 12;
  const estimatedElectricMonthlyCost = estimatedElectricAnnualCost / 12;
  const energyAnnualSavings = currentAnnualCost - estimatedElectricAnnualCost;
  const maintenance = calculateMaintenanceImpact(answers);
  const annualSavings = energyAnnualSavings + maintenance.annualSavingsIncluded;
  const monthlySavings = annualSavings / 12;
  const savingsPerKm = currentCostPerKm - electricCostPerKmAdjusted;
  const savings3Years = annualSavings * 3;
  const savings5Years = annualSavings * 5;
  const savings10Years = annualSavings * 10;
  const initialPremium = answers.evPrice - answers.iceAlternativePrice;
  const publicAid = calculatePublicAidScenario(answers, initialPremium, annualSavings);

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
    currentMonthlyCost,
    estimatedElectricMonthlyCost,
    energyAnnualSavings,
    maintenance,
    annualSavings,
    monthlySavings,
    savingsPerKm,
    savings3Years,
    savings5Years,
    savings10Years,
    initialPremium,
    publicAid,
    amortizationYears,
    amortizationMessage,
    adjustments,
  };
}

function calculateMaintenanceImpact(answers) {
  const current = typeof answers.currentMaintenanceAnnual === "number" ? answers.currentMaintenanceAnnual : null;
  const electric = typeof answers.evMaintenanceAnnual === "number" ? answers.evMaintenanceAnnual : null;
  const hasCurrent = current !== null;
  const hasElectric = electric !== null;
  const included = hasCurrent && hasElectric;
  const annualSavings = included ? current - electric : 0;

  return {
    current,
    electric,
    included,
    incomplete: (hasCurrent || hasElectric) && !included,
    annualSavings,
    message: included
      ? "Mantenimiento incluido porque se han introducido ambos importes."
      : "No se ha incluido mantenimiento porque no se han introducido ambos importes.",
    annualSavingsIncluded: included ? annualSavings : 0,
  };
}

function calculatePublicAidScenario(answers, initialPremium, annualSavings) {
  const amount = answers.publicAidConsidered === "si" && typeof answers.publicAidAmount === "number"
    ? Math.max(0, Math.min(answers.publicAidAmount, answers.evPrice))
    : 0;
  const adjustedEvPrice = answers.evPrice - amount;
  const initialPremiumWithAid = adjustedEvPrice - answers.iceAlternativePrice;

  let amortizationYears = null;
  let amortizationMessage = "No hay amortización económica con la ayuda estimada en las condiciones introducidas.";

  if (amount > 0 && initialPremiumWithAid <= 0) {
    amortizationYears = 0;
    amortizationMessage = "Con la ayuda estimada no existiría sobrecoste frente a la alternativa térmica.";
  } else if (amount > 0 && initialPremiumWithAid > 0 && annualSavings > 0) {
    amortizationYears = initialPremiumWithAid / annualSavings;
    amortizationMessage = `Con la ayuda estimada, amortización aproximada en ${formatYears(amortizationYears)}.`;
  }

  return {
    considered: answers.publicAidConsidered,
    amount,
    hasAmount: amount > 0,
    adjustedEvPrice,
    initialPremiumWithoutAid: initialPremium,
    initialPremiumWithAid,
    amortizationYears,
    amortizationMessage,
    liquidityWarning: answers.publicAidConsidered === "si" && answers.aidAdvanceCapacity === "no",
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
    return "Sí, tiene bastante sentido en tu caso.";
  }

  if (label === "Viable con condiciones") {
    if (flags.criticalChargingBlock) {
      return "Puede encajar, pero no lo compraría sin resolver antes la carga habitual.";
    }
    return "Puede encajar, pero solo si dejas bien cerrada la rutina de carga y el precio de entrada.";
  }

  if (label === "Viable pero poco rentable") {
    return "Puede funcionar, aunque no lo compraría pensando sobre todo en ahorrar.";
  }

  if (label === "Poco viable") {
    return "Solo lo vería razonable si aceptas bastante más fricción de uso.";
  }

  if (flags.noSavings || flags.budgetBlock) {
    return "Ahora mismo no lo veo como la alternativa más equilibrada para ti.";
  }

  return "Antes de decidir, resolvería primero la parte práctica de la carga.";
}

function buildDecisionHeadline(verdict, answers, economic) {
  if (verdict.label === "Muy viable") {
    if (economic.initialPremium <= 0) return "Sí, encaja bien y además no parte penalizado por precio";
    if (economic.annualSavings > 1200) return "Sí, encaja bien contigo";
    return "Sí, tiene bastante sentido en tu caso";
  }

  if (verdict.label === "Viable con condiciones") {
    if (answers.nightCharging === "no" && answers.workCharging === "no") return "Sí, pero no sin cerrar antes la carga";
    if (answers.evPrice > answers.maxBudget) return "Sí, pero con el precio muy vigilado";
    return "Sí, pero con condiciones claras";
  }

  if (verdict.label === "Viable pero poco rentable") {
    return "Puede funcionar, pero no lo justificaría por ahorro";
  }

  if (verdict.label === "Poco viable") {
    return "Puede funcionar, aunque con bastante fricción";
  }

  if (verdict.criticalChargingBlock) return "Ahora mismo no lo veo viable para tu caso";
  if (verdict.noSavings) return "Ahora mismo no parece la mejor compra para ti";
  return "Ahora mismo no es la opción más equilibrada";
}

function buildDecisionSubtitle(verdict, answers, economic) {
  if (verdict.label === "Muy viable") {
    return `Tu uso diario, la infraestructura de carga y el coste operativo juegan a favor del eléctrico. ${economic.initialPremium <= 0 ? "Además, no parte con sobrecoste frente a la alternativa térmica que comparas." : "La compra no parece forzada y el ahorro acompaña."}`;
  }

  if (verdict.label === "Viable con condiciones") {
    return `El encaje existe, pero depende de asegurar bien ${answers.nightCharging === "no" && answers.workCharging === "no" ? "la rutina de carga" : "los detalles prácticos del uso"} y de que el precio final no se te vaya. La decisión es defendible, aunque no automática.`;
  }

  if (verdict.label === "Viable pero poco rentable") {
    return "Por uso podría tener sentido, pero la parte económica sale demasiado justa. Si das el paso, debería ser por conjunto de producto, etiqueta o experiencia, no solo por coste.";
  }

  if (verdict.label === "Poco viable") {
    return "Hay varios puntos de fricción que no impiden por completo la compra, pero sí la vuelven menos cómoda y menos evidente de lo que convendría para acertar.";
  }

  return "Con los datos introducidos, las barreras prácticas o económicas pesan demasiado. Antes de plantearte la compra, conviene resolver el punto que más condiciona tu caso.";
}

function selectTopFactors(items, fallbackItems) {
  const unique = [];

  items
    .slice()
    .sort((left, right) => right.score - left.score)
    .forEach((item) => {
      if (!unique.some((existing) => existing.title === item.title)) {
        unique.push(item);
      }
    });

  fallbackItems.forEach((item) => {
    if (unique.length < 3 && !unique.some((existing) => existing.title === item.title)) {
      unique.push(item);
    }
  });

  return unique.slice(0, 3);
}

function buildCaseFactors(answers, economic) {
  const positive = [];
  const negative = [];

  if (answers.nightCharging === "si") {
    positive.push({
      score: 98,
      title: "Carga habitual resuelta",
      detail: "Podrías cargar por la noche, que es el punto que más simplifica el uso diario de un eléctrico.",
    });
  } else if (answers.workCharging === "si") {
    positive.push({
      score: 84,
      title: "Apoyo de carga en el trabajo",
      detail: "Tienes una alternativa recurrente para no depender solo de la red pública.",
    });
  } else if (answers.ownGarage === "si" && answers.canInstallCharger === "si") {
    positive.push({
      score: 76,
      title: "Instalación de carga viable",
      detail: "Disponer de plaza propia y poder instalar punto de carga juega claramente a favor del encaje.",
    });
  }

  if (answers.kmDaily <= 80) {
    positive.push({
      score: 78,
      title: "Kilometraje diario muy compatible",
      detail: `Con ${formatPlainNumber(answers.kmDaily, 0)} km al día, la autonomía no debería apretarte en el uso normal.`,
    });
  } else if (answers.kmDaily <= 150) {
    positive.push({
      score: 58,
      title: "Uso diario asumible",
      detail: "Tu kilometraje diario sigue siendo razonable para muchos eléctricos si la carga está bien resuelta.",
    });
  }

  if (answers.longTripFrequency === "nunca" || answers.longTripFrequency === "1-2-ano") {
    positive.push({
      score: 74,
      title: "Pocos viajes largos",
      detail: "La recarga en carretera tendría poco peso real en tu año, así que la logística sería más sencilla.",
    });
  } else if (answers.longTripFrequency === "mensual") {
    positive.push({
      score: 42,
      title: "Viajes largos asumibles",
      detail: "Hay trayectos exigentes, pero no con una frecuencia tan alta como para desaconsejar el cambio por sí sola.",
    });
  }

  if (answers.drivingType === "ciudad") {
    positive.push({
      score: 62,
      title: "Uso urbano favorable",
      detail: "La conducción urbana suele sacar muy buen partido al menor coste por km y a la eficiencia del eléctrico.",
    });
  } else if (answers.drivingType === "mixto") {
    positive.push({
      score: 52,
      title: "Conducción mixta bien resuelta",
      detail: "El patrón de uso mixto sigue siendo compatible con un eléctrico si la carga acompaña.",
    });
  }

  if (answers.solarPanels === "si") {
    positive.push({
      score: 68,
      title: "Placas solares a favor",
      detail: "El autoconsumo mejora el coste de recarga y refuerza la parte económica del cambio.",
    });
  }

  if (economic.priceElectricityEurKwh <= 0.15) {
    positive.push({
      score: 64,
      title: "Electricidad barata",
      detail: "Tu precio eléctrico está en una zona especialmente favorable para que el coste por km salga bien.",
    });
  }

  if (economic.annualSavings > 1200) {
    positive.push({
      score: 95,
      title: "Ahorro anual alto",
      detail: `La estimación apunta a ${formatCurrency(economic.annualSavings)} menos al año en coste de uso.`,
    });
  } else if (economic.annualSavings >= 700) {
    positive.push({
      score: 82,
      title: "Ahorro anual relevante",
      detail: `El ahorro estimado de ${formatCurrency(economic.annualSavings)} al año ya da respaldo económico a la decisión.`,
    });
  } else if (economic.annualSavings > 0) {
    positive.push({
      score: 58,
      title: "Ahorro positivo, aunque moderado",
      detail: `Sí hay mejora de coste de uso, aunque todavía no es especialmente contundente: ${formatCurrency(economic.annualSavings)} al año.`,
    });
  }

  if (economic.initialPremium <= 0) {
    positive.push({
      score: 88,
      title: "No hay sobrecoste inicial",
      detail: "El eléctrico no parte más caro que la alternativa térmica que has puesto como referencia.",
    });
  } else if (economic.amortizationYears !== null && economic.amortizationYears <= 5) {
    positive.push({
      score: 76,
      title: "Amortización razonable",
      detail: `El sobrecoste inicial se recuperaría en un plazo estimado de ${formatYears(economic.amortizationYears)}.`,
    });
  }

  if (economic.maintenance.included && economic.maintenance.annualSavings > 0) {
    positive.push({
      score: 64,
      title: "Mantenimiento también a favor",
      detail: `Has introducido ${formatCurrency(economic.maintenance.annualSavings)} menos al año en mantenimiento estimado.`,
    });
  }

  if (economic.publicAid.hasAmount && economic.publicAid.initialPremiumWithAid < economic.initialPremium) {
    positive.push({
      score: 66,
      title: "La ayuda estimada mejora el escenario",
      detail: `Como escenario orientativo, la ayuda reduciría el sobrecoste inicial hasta ${formatSignedCurrency(economic.publicAid.initialPremiumWithAid)}.`,
    });
  }

  if (answers.nightCharging === "no" && answers.workCharging === "no" && answers.publicChargingWillingness === "no") {
    negative.push({
      score: 100,
      title: "Sin alternativa operativa real",
      detail: "Sin carga en casa, sin carga en el trabajo y sin disposición a usar la red pública, el eléctrico queda muy comprometido.",
    });
  } else if (answers.nightCharging === "no" && answers.workCharging === "no") {
    negative.push({
      score: 96,
      title: "Sin una carga habitual clara",
      detail: "Dependerías de soluciones menos cómodas o menos previsibles para la recarga del día a día.",
    });
  }

  if (answers.canInstallCharger === "no-se") {
    negative.push({
      score: 54,
      title: "La carga en casa sigue sin confirmar",
      detail: "Mientras no sepas si puedes instalar punto de carga, la decisión sigue teniendo una incertidumbre importante.",
    });
  }

  if (answers.longTripFrequency === "semanal") {
    negative.push({
      score: 86,
      title: "Viajes largos muy frecuentes",
      detail: "Tener trayectos de más de 300 km de forma semanal hace que la planificación pese mucho en la experiencia real.",
    });
  } else if (answers.longTripFrequency === "frecuente") {
    negative.push({
      score: 76,
      title: "Viajes largos repetidos",
      detail: "La recurrencia de viajes exigentes añade fricción y resta sencillez a la compra.",
    });
  } else if (answers.longTripFrequency === "mensual") {
    negative.push({
      score: 48,
      title: "Hay viajes largos que condicionan",
      detail: "No son constantes, pero sí suficientes como para obligarte a mirar autonomía real y red de recarga.",
    });
  }

  if (answers.comfortablePlanningCharges === "no") {
    negative.push({
      score: 72,
      title: "Poca tolerancia a planificar recargas",
      detail: "Si no te sientes cómodo planificando, cualquier fricción en carretera se notará más en el uso real.",
    });
  }

  if (
    answers.mainVehicle === "si" &&
    (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") &&
    answers.comfortablePlanningCharges === "no"
  ) {
    negative.push({
      score: 88,
      title: "Sería tu coche principal en un uso exigente",
      detail: "Al ser el vehículo principal, los condicionantes de viaje tienen más impacto en la decisión final.",
    });
  }

  if (answers.drivingType === "carretera") {
    negative.push({
      score: 44,
      title: "Predomina la carretera",
      detail: "En autovía el consumo eléctrico estimado sube y el ahorro tiende a estrecharse frente a un uso más urbano.",
    });
  }

  if (economic.annualSavings <= 0) {
    negative.push({
      score: 94,
      title: "No sale ahorro de uso",
      detail: "Con los precios introducidos no aparece mejora económica frente a tu coche actual.",
    });
  } else if (economic.annualSavings < 300) {
    negative.push({
      score: 70,
      title: "El ahorro es demasiado corto",
      detail: `El ahorro estimado existe, pero con ${formatCurrency(economic.annualSavings)} al año cuesta que la compra destaque por rentabilidad.`,
    });
  }

  if (economic.amortizationYears !== null && economic.amortizationYears > 8) {
    negative.push({
      score: 78,
      title: "Amortización larga",
      detail: `El sobrecoste inicial tardaría en recuperarse unos ${formatYears(economic.amortizationYears)}, que ya es un plazo largo para usarlo como argumento principal.`,
    });
  }

  if (economic.maintenance.incomplete) {
    negative.push({
      score: 50,
      title: "Mantenimiento incompleto",
      detail: "Solo se ha introducido uno de los dos importes de mantenimiento, así que esa comparación no se ha incorporado al ahorro total.",
    });
  }

  if (economic.publicAid.liquidityWarning) {
    negative.push({
      score: 74,
      title: "Riesgo de liquidez por la ayuda",
      detail: "Has indicado que no podrías adelantar cómodamente el importe hasta recibir la ayuda, y eso puede tensionar la compra.",
    });
  }

  if (answers.evPrice > answers.maxBudget * 1.2) {
    negative.push({
      score: 92,
      title: "Precio claramente por encima del presupuesto",
      detail: "El eléctrico supera tu presupuesto máximo en más de un 20%, así que la compra nace tensionada.",
    });
  } else if (answers.evPrice > answers.maxBudget) {
    negative.push({
      score: 70,
      title: "El precio aprieta tu presupuesto",
      detail: "Aunque no sea un desvío extremo, el precio del eléctrico ya entra por encima del techo que has marcado.",
    });
  }

  const positiveFallback = [
    {
      score: 20,
      title: "No hay un bloqueo técnico absoluto",
      detail: "El caso no queda descartado de entrada, aunque necesite más matiz y comparación real antes de decidir.",
    },
    {
      score: 18,
      title: "El patrón diario sigue siendo analizable",
      detail: "Tu uso no convierte automáticamente al eléctrico en una mala idea, pero tampoco basta por sí solo para comprar.",
    },
    {
      score: 16,
      title: "Hay margen para afinar la elección",
      detail: "Un modelo mejor ajustado o una oferta distinta podrían mover el equilibrio de forma relevante.",
    },
  ];

  const negativeFallback = [
    {
      score: 20,
      title: "La decisión necesita más contraste",
      detail: "No es un caso para decidir solo por intuición; conviene aterrizar precio final, autonomía real y rutina de carga.",
    },
    {
      score: 18,
      title: "La rentabilidad no es automática",
      detail: "Aunque el encaje pueda existir, el ahorro y la comodidad dependen mucho de los detalles concretos del caso.",
    },
    {
      score: 16,
      title: "Falta aterrizar el modelo concreto",
      detail: "La decisión final puede cambiar bastante según autonomía real, precio y disponibilidad del coche que compres.",
    },
  ];

  return {
    positive: selectTopFactors(positive, positiveFallback),
    negative: selectTopFactors(negative, negativeFallback),
  };
}

function buildAdvisorView(answers, economic, verdict) {
  if (verdict.criticalChargingBlock) {
    return "Con estos datos, yo no daría el paso hasta resolver una carga habitual real. Sin casa, sin trabajo y sin disposición a la red pública, el uso cotidiano quedaría demasiado comprometido para recomendar un eléctrico puro con tranquilidad.";
  }

  if (economic.publicAid.liquidityWarning) {
    return "Con estos datos, yo no basaría la compra en una ayuda que tengas que adelantar si eso te tensiona la liquidez. Primero confirmaría el precio final asumible sin contar con cobros futuros y, solo después, usaría la ayuda como margen adicional.";
  }

  if (verdict.budgetBlock && verdict.noSavings) {
    return "Si el motivo principal es ahorrar, yo no lo compraría en este escenario. Parte por encima del presupuesto y además no recupera esa diferencia por coste de uso, así que la operación nace floja por los dos lados.";
  }

  if (verdict.label === "Muy viable") {
    return `Con tu patrón de uso, yo sí vería lógico avanzar hacia un eléctrico. ${answers.nightCharging === "si" || answers.workCharging === "si" ? "La parte operativa está bien encajada" : "La operativa es manejable"} y el ahorro estimado no suena forzado, así que la compra tiene base más allá de la novedad o la etiqueta.`;
  }

  if (verdict.label === "Viable con condiciones") {
    return `Con estos datos, yo solo daría el paso si aseguras ${answers.nightCharging === "no" && answers.workCharging === "no" ? "la carga habitual fuera de casa" : "los detalles prácticos de la carga"} y mantienes controlado el precio final. El encaje existe, pero todavía no lo bastante limpio como para comprar sin verificar esas dos piezas.`;
  }

  if (verdict.label === "Viable pero poco rentable") {
    return "Si buscas sobre todo ahorrar, yo no lo vería suficientemente sólido. Solo tendría sentido si valoras también la experiencia de uso, el silencio, la etiqueta o una preferencia clara por el eléctrico más allá de la rentabilidad.";
  }

  if (verdict.label === "Poco viable") {
    return "Yo sería prudente. No porque sea imposible, sino porque te exigiría aceptar más fricción operativa o financiera de la que normalmente compensa cuando uno busca una compra cómoda y clara.";
  }

  return "Con este escenario, yo no lo priorizaría ahora mismo. Antes miraría si puedes mejorar la infraestructura de carga, ajustar el precio de compra o incluso esperar una oferta más favorable antes de tomar la decisión.";
}

function buildNextStep(answers, economic, verdict) {
  if (answers.canInstallCharger === "no-se") {
    return "Confirma la viabilidad de instalar un punto de carga en tu plaza.";
  }

  if (verdict.criticalChargingBlock) {
    return "Aclara primero dónde cargarías de forma habitual antes de valorar modelos concretos.";
  }

  if (answers.nightCharging === "no" && answers.workCharging === "no" && answers.publicChargingWillingness === "si") {
    return "Revisa la red pública de carga que tendrías disponible en tus rutas habituales.";
  }

  if (answers.longTripFrequency === "frecuente" || answers.longTripFrequency === "semanal") {
    return "Compara dos modelos eléctricos con autonomía real suficiente para tus viajes más exigentes.";
  }

  if (economic.publicAid.liquidityWarning) {
    return "Confirma si puedes asumir el desembolso inicial sin depender de cobrar la ayuda más adelante.";
  }

  if (answers.evPrice > answers.maxBudget || economic.initialPremium > 0) {
    return "Valora si el sobrecoste inicial compensa realmente frente a la alternativa térmica.";
  }

  if (economic.annualSavings <= 0) {
    return "Si buscas sobre todo ahorro, quizá merece la pena esperar una mejor oferta o ayuda.";
  }

  return "Compara dos modelos eléctricos concretos para validar autonomía real, precio final y coste de seguro.";
}

function buildMediumTermLead(economic) {
  if (economic.annualSavings > 1200) {
    return "Si mantienes un patrón parecido, el ahorro acumulado empieza a ser realmente visible a medio plazo.";
  }

  if (economic.annualSavings > 0) {
    return "Sí hay mejora económica, aunque su fuerza depende bastante del precio final y de que mantengas este uso.";
  }

  if (economic.annualSavings === 0) {
    return "Con este escenario el coste de uso queda prácticamente empatado: no aparece ahorro acumulado.";
  }

  return "Con estos datos no se genera ahorro acumulado; el saldo a medio plazo seguiría jugando en contra.";
}

function buildQualitativeAnalysis(answers, economic, scoring, verdict, coherenceWarnings) {
  const caseFactors = buildCaseFactors(answers, economic);
  const strengths = caseFactors.positive.map((item) => `${item.title}. ${item.detail}`);
  const weaknesses = caseFactors.negative.map((item) => `${item.title}. ${item.detail}`);

  const paragraphs = [
    `El resultado sale ${verdict.label.toLowerCase()} porque ${caseFactors.positive[0].title.toLowerCase()} pesa a favor, pero ${caseFactors.negative[0].title.toLowerCase()} sigue condicionando bastante la decisión.`,
    `En el día a día, ${buildOperationalLead(answers)} y ${buildOperationalRisk(answers)}. Eso deja una comodidad operativa ${getComfortLevel(answers)} para convivir con un eléctrico como coche ${answers.mainVehicle === "si" ? "principal" : "secundario"}.`,
    buildEconomicNarrative(economic),
    `Visto en conjunto, ${buildFinalConclusion(verdict, scoring, coherenceWarnings.length > 0)}.`,
  ];

  return {
    strengths,
    weaknesses,
    whyPositive: caseFactors.positive,
    whyNegative: caseFactors.negative,
    decisionHeadline: buildDecisionHeadline(verdict, answers, economic),
    decisionSubtitle: buildDecisionSubtitle(verdict, answers, economic),
    advisorView: buildAdvisorView(answers, economic, verdict),
    nextStep: buildNextStep(answers, economic, verdict),
    mediumTermLead: buildMediumTermLead(economic),
    paragraphs,
  };
}

function renderResults(payload) {
  const { economic, scoring, verdict, coherenceWarnings, narrative } = payload;
  const analysisDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(new Date());
  const amortizationHighlight = getAmortizationHighlight(economic);

  dom.resultsContent.innerHTML = `
    <article class="result-card result-card--hero decision-hero reveal">
      <div class="decision-hero__layout">
        <div class="decision-hero__copy">
          <span class="verdict-badge ${getVerdictBadgeClass(verdict.tone)}">${verdict.label}</span>
          <h3 class="decision-hero__title">${narrative.decisionHeadline}</h3>
          <p class="decision-hero__subtitle">${narrative.decisionSubtitle}</p>
        </div>
        <div class="decision-hero__side">
          <div class="decision-score-chip">
            <strong>${Math.round(scoring.total)}</strong>
            <span>/100</span>
          </div>
          <p class="decision-hero__date">Resultado generado el ${analysisDate}</p>
        </div>
      </div>
      <div class="decision-kpis">
        ${renderDecisionKpi("Ahorro total anual estimado", formatSignedCurrency(economic.annualSavings), getSavingsCaption(economic.annualSavings, 1), getValueTone(economic.annualSavings))}
        ${renderDecisionKpi("Impacto a 5 años", formatSignedCurrency(economic.savings5Years), getSavingsCaption(economic.savings5Years, 5), getValueTone(economic.savings5Years))}
        ${renderDecisionKpi("Amortización estimada", amortizationHighlight.value, amortizationHighlight.caption, amortizationHighlight.tone)}
      </div>
    </article>

    <div class="results-grid results-grid--enhanced">
      <div class="result-stack">
        <article class="result-card reveal">
          <div class="section-heading">
            <div>
              <p class="panel__eyebrow">Impacto directo</p>
              <h4>Comparativa de coste que se entiende rápido</h4>
            </div>
            <p class="section-kicker">${buildComparisonLead(economic)}</p>
          </div>

          <div class="quick-compare-grid">
            ${renderQuickStat("Coste energético actual anual", formatCurrency(economic.currentAnnualCost), "Tu coche actual", "neutral")}
            ${renderQuickStat("Coste energético eléctrico anual", formatCurrency(economic.estimatedElectricAnnualCost), "Escenario estimado", "positive")}
            ${renderQuickStat(economic.annualSavings >= 0 ? "Ahorro total anual" : "Sobrecoste total anual", formatSignedCurrency(economic.annualSavings), economic.annualSavings > 0 ? "Energía y mantenimiento si aplica" : "No mejora el coste de uso", getValueTone(economic.annualSavings))}
          </div>

          <div class="comparison-chart comparison-chart--enhanced">
            ${buildCostChartMarkup(economic)}
          </div>

          <div class="monthly-compare">
            ${renderMonthlyStat("Coste actual mensual", formatCurrency(economic.currentMonthlyCost))}
            ${renderMonthlyStat("Coste eléctrico mensual", formatCurrency(economic.estimatedElectricMonthlyCost))}
          </div>

          ${renderEconomicBreakdown(economic)}
        </article>

        <article class="result-card reveal">
          <div class="section-heading">
            <div>
              <p class="panel__eyebrow">Horizonte económico</p>
              <h4>Impacto económico a medio plazo</h4>
            </div>
            <p class="section-kicker">${narrative.mediumTermLead}</p>
          </div>

          <div class="impact-grid">
            ${renderImpactCard("A 3 años", formatSignedCurrency(economic.savings3Years), getSavingsCaption(economic.savings3Years, 3), getValueTone(economic.savings3Years))}
            ${renderImpactCard("A 5 años", formatSignedCurrency(economic.savings5Years), getSavingsCaption(economic.savings5Years, 5), getValueTone(economic.savings5Years))}
            ${renderImpactCard("A 10 años", formatSignedCurrency(economic.savings10Years), getSavingsCaption(economic.savings10Years, 10), getValueTone(economic.savings10Years))}
          </div>

          <p class="executive-copy">Ajustes aplicados al coste eléctrico: ${economic.adjustments.length > 0 ? economic.adjustments.join(", ") : "sin ajustes adicionales relevantes para el escenario introducido."}</p>
        </article>

        <article class="result-card reveal">
          <div class="section-heading">
            <div>
              <p class="panel__eyebrow">Lectura del caso</p>
              <h4>Qué haría en tu caso</h4>
            </div>
            <p class="section-kicker">${verdict.recommendation}</p>
          </div>
          <p class="advisor-copy">${narrative.advisorView}</p>
          <div class="narrative">
            ${narrative.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          </div>
        </article>

        <article class="result-card result-card--next-step reveal">
          <p class="panel__eyebrow">Siguiente paso recomendado</p>
          <h4 class="next-step__title">${narrative.nextStep}</h4>
          <p class="next-step__copy">Es la acción con más capacidad para aclarar tu decisión antes de comprometer presupuesto o modelo.</p>
        </article>
      </div>

      <div class="result-stack">
        <article class="result-card reveal">
          <div class="score-panel">
            <div class="score-ring" data-score-ring>
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
          <div class="section-heading">
            <div>
              <p class="panel__eyebrow">Decisión explicada</p>
              <h4>Por qué sale este resultado</h4>
            </div>
            <p class="section-kicker">Estos son los factores que más están empujando la decisión ahora mismo.</p>
          </div>
          <div class="why-grid">
            <section class="insight-card insight-card--positive">
              <h4>Lo que juega a favor</h4>
              <ul class="insight-list insight-list--detailed">
                ${narrative.whyPositive.map(renderWhyFactor).join("")}
              </ul>
            </section>
            <section class="insight-card insight-card--negative">
              <h4>Lo que limita la decisión</h4>
              <ul class="insight-list insight-list--detailed">
                ${narrative.whyNegative.map(renderWhyFactor).join("")}
              </ul>
            </section>
          </div>
        </article>

        <article class="result-card reveal">
          <div class="section-heading">
            <div>
              <p class="panel__eyebrow">Datos de referencia</p>
              <h4>Resumen cuantitativo</h4>
            </div>
            <p class="section-kicker">Cifras clave para contrastar compra, uso y retorno económico.</p>
          </div>
          <div class="metric-grid metric-grid--executive">
            ${renderMetric("Ahorro energético anual", formatSignedCurrency(economic.energyAnnualSavings), getValueTone(economic.energyAnnualSavings))}
            ${renderMetric("Mantenimiento anual", getMaintenanceDisplay(economic), economic.maintenance.included ? getValueTone(economic.maintenance.annualSavings) : "neutral")}
            ${renderMetric("Ahorro total anual estimado", formatSignedCurrency(economic.annualSavings), getValueTone(economic.annualSavings))}
            ${renderMetric("Ahorro mensual estimado", formatSignedCurrency(economic.monthlySavings), getValueTone(economic.monthlySavings))}
            ${renderMetric("Coste actual por km", formatCurrencyPerKm(economic.currentCostPerKm))}
            ${renderMetric("Coste eléctrico por km", formatCurrencyPerKm(economic.electricCostPerKmAdjusted))}
            ${renderMetric("Sobrecoste inicial vs. térmico", formatSignedCurrency(economic.initialPremium), getValueTone(-economic.initialPremium))}
            ${renderMetric("Amortización estimada", getAmortizationDisplay(economic), amortizationHighlight.tone)}
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

  animateResultVisuals(scoring.total);
  initRevealObserver();
}

function animateResultVisuals(score) {
  const ring = dom.resultsContent.querySelector("[data-score-ring]");
  const scoreValue = dom.resultsContent.querySelector("[data-score-value]");
  const fills = Array.from(dom.resultsContent.querySelectorAll("[data-fill-width]"));
  const chartBars = Array.from(dom.resultsContent.querySelectorAll("[data-chart-width]"));
  const duration = 820;
  const start = performance.now();

  if (!ring || !scoreValue) return;

  requestAnimationFrame(function animate(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentScore = Math.round(score * eased);
    ring.style.setProperty("--angle", `${currentScore * 3.6}deg`);
    scoreValue.textContent = `${currentScore}`;

    fills.forEach((fill) => {
      fill.style.width = `${Number(fill.dataset.fillWidth) * eased}%`;
    });

    chartBars.forEach((bar) => {
      bar.style.width = `${Number(bar.dataset.chartWidth) * eased}%`;
    });

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
      const numericValue = parseQuestionNumber(question, rawValue);
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
  const answered = REQUIRED_QUESTIONS.filter((question) => isQuestionAnswered(question)).length;
  dom.progressText.textContent = `${answered} de ${REQUIRED_QUESTIONS.length} respuestas clave completadas`;
  dom.progressBar.style.width = `${(answered / REQUIRED_QUESTIONS.length) * 100}%`;

  FORM_SECTIONS.forEach((section) => {
    const requiredInSection = getRequiredQuestions(section);
    const answeredInSection = requiredInSection.filter((question) => isQuestionAnswered(question)).length;
    const label = `${answeredInSection} / ${requiredInSection.length}`;
    const countNode = document.querySelector(`#nav-count-${section.id}`);
    const badgeNode = document.querySelector(`#badge-${section.id}`);
    if (countNode) countNode.textContent = label;
    if (badgeNode) badgeNode.textContent = label;
  });
}

function isQuestionAnswered(question) {
  if (!isQuestionVisible(question)) return false;
  const value = getFieldValue(question);
  return value !== "" && value !== null && typeof value !== "undefined";
}

function getFieldValue(question) {
  if (question.type === "number") {
    const input = getInputElement(question.id);
    const liveValue = parseQuestionNumber(question, input.value);
    if (liveValue !== null) return liveValue;
    return parseQuestionNumber(question, input.dataset.numericValue);
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
    if (input.value.trim() === "") return "";

    const liveValue = parseQuestionNumber(question, input.value);
    if (liveValue !== null) return String(liveValue);

    return input.value.trim();
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

function buildEconomicNarrative(economic) {
  const maintenanceText = economic.maintenance.included
    ? ` Al incluir mantenimiento, el efecto anual adicional es ${formatSignedCurrency(economic.maintenance.annualSavings)}.`
    : " No se ha incluido mantenimiento porque no se han introducido ambos importes.";
  const aidText = economic.publicAid.hasAmount
    ? ` La ayuda pública estimada se muestra como escenario aparte: no sustituye el cálculo prudente sin ayuda.`
    : "";
  const liquidityText = economic.publicAid.liquidityWarning
    ? " Además, depender de una ayuda cobrada más adelante puede crear tensión de liquidez inicial."
    : "";

  return `En dinero, el coste energético pasaría de unos ${formatCurrency(economic.currentAnnualCost)} al año a ${formatCurrency(economic.estimatedElectricAnnualCost)} en el escenario eléctrico.${maintenanceText} ${buildAmortizationSentence(economic)}${aidText}${liquidityText}`;
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
  if (score >= 75) return "El caso sale fuerte: uso, carga y dinero están bastante alineados para recomendar el cambio.";
  if (score >= 60) return "El encaje existe, aunque todavía depende de cerrar bien algunos condicionantes antes de comprar.";
  if (score >= 40) return "Hay base para estudiarlo, pero también fricciones suficientes como para no decidir a la ligera.";
  return "Las barreras prácticas y económicas pesan demasiado como para recomendar un eléctrico puro con comodidad.";
}

function getValueTone(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "warning";
}

function getSavingsCaption(value, years) {
  if (years === 1) {
    if (value > 0) return "Menor coste de uso estimado frente a tu coche actual.";
    if (value < 0) return "En este escenario el eléctrico saldría más caro en uso.";
    return "No aparece una diferencia relevante de coste de uso.";
  }

  if (value > 0) {
    return `Saldo acumulado estimado si mantienes este patrón durante ${years} años.`;
  }

  return "No se genera ahorro acumulado en este escenario.";
}

function buildComparisonLead(economic) {
  if (economic.annualSavings > 0) {
    return `La diferencia estimada es de ${formatCurrency(economic.annualSavings)} al año, equivalente a ${formatCurrency(economic.monthlySavings)} al mes.`;
  }

  if (economic.annualSavings < 0) {
    return `Con los precios introducidos, el eléctrico sumaría ${formatCurrency(Math.abs(economic.annualSavings))} más al año en coste de uso.`;
  }

  return "Con este escenario, el coste de uso queda prácticamente empatado entre ambas opciones.";
}

function getAmortizationHighlight(economic) {
  if (economic.initialPremium <= 0) {
    return {
      value: "Sin sobrecoste",
      caption: "El eléctrico no parte más caro que la alternativa térmica introducida.",
      tone: "positive",
    };
  }

  if (economic.annualSavings <= 0 || economic.amortizationYears === null) {
    return {
      value: "Sin amortización",
      caption: "Con este escenario el sobrecoste no se recupera por coste de uso.",
      tone: "negative",
    };
  }

  if (economic.amortizationYears <= 5) {
    return {
      value: formatYears(economic.amortizationYears),
      caption: "Plazo razonable para recuperar el sobrecoste inicial.",
      tone: "positive",
    };
  }

  if (economic.amortizationYears <= 8) {
    return {
      value: formatYears(economic.amortizationYears),
      caption: "La amortización existe, pero ya exige mirar el plazo con calma.",
      tone: "warning",
    };
  }

  return {
    value: formatYears(economic.amortizationYears),
    caption: "El retorno económico existe, pero llega demasiado tarde para ser un argumento fuerte.",
    tone: "negative",
  };
}

function renderDecisionKpi(label, value, caption, tone = "neutral") {
  return `
    <div class="decision-kpi decision-kpi--${tone}">
      <span class="decision-kpi__label">${label}</span>
      <strong class="decision-kpi__value">${value}</strong>
      <span class="decision-kpi__caption">${caption}</span>
    </div>
  `;
}

function renderQuickStat(label, value, caption, tone = "neutral") {
  return `
    <div class="quick-stat quick-stat--${tone}">
      <span class="quick-stat__label">${label}</span>
      <strong class="quick-stat__value">${value}</strong>
      <span class="quick-stat__caption">${caption}</span>
    </div>
  `;
}

function renderMonthlyStat(label, value) {
  return `
    <div class="monthly-stat">
      <span class="monthly-stat__label">${label}</span>
      <strong class="monthly-stat__value">${value}</strong>
    </div>
  `;
}

function renderEconomicBreakdown(economic) {
  return `
    <div class="economic-breakdown">
      <div class="economic-breakdown__head">
        <h5>Qué incluye el ahorro anual</h5>
        <p>Este resultado combina el ahorro energético con el mantenimiento solo si has introducido ambos datos de mantenimiento.</p>
      </div>
      <div class="economic-breakdown__grid">
        ${renderBreakdownItem("Ahorro energético anual", formatSignedCurrency(economic.energyAnnualSavings), getValueTone(economic.energyAnnualSavings), "Diferencia entre combustible actual y electricidad estimada.")}
        ${renderBreakdownItem("Mantenimiento anual", getMaintenanceDisplay(economic), economic.maintenance.included ? getValueTone(economic.maintenance.annualSavings) : "neutral", economic.maintenance.message)}
        ${renderBreakdownItem("Ahorro total anual", formatSignedCurrency(economic.annualSavings), getValueTone(economic.annualSavings), "Base usada para ahorro acumulado y amortización.")}
      </div>
      ${renderPublicAidScenario(economic)}
    </div>
  `;
}

function renderBreakdownItem(label, value, tone, caption) {
  return `
    <div class="breakdown-item breakdown-item--${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${caption}</small>
    </div>
  `;
}

function renderPublicAidScenario(economic) {
  if (!economic.publicAid.hasAmount) {
    return `
      <p class="economic-breakdown__note">
        No se ha aplicado ninguna ayuda pública estimada. Si existe una ayuda, úsala solo como escenario orientativo y confirma siempre las condiciones oficiales.
      </p>
    `;
  }

  return `
    <div class="aid-scenario">
      <div>
        <span>Escenario con ayuda estimada</span>
        <strong>${formatCurrency(economic.publicAid.amount)}</strong>
      </div>
      <div>
        <span>Sobrecoste con ayuda</span>
        <strong>${formatSignedCurrency(economic.publicAid.initialPremiumWithAid)}</strong>
      </div>
      <div>
        <span>Amortización con ayuda</span>
        <strong>${economic.publicAid.amortizationYears === null ? "Sin amortización" : formatYears(economic.publicAid.amortizationYears)}</strong>
      </div>
      <p>${economic.publicAid.amortizationMessage}</p>
      ${economic.publicAid.liquidityWarning ? `<p class="aid-scenario__warning">Esta compra puede tener tensión de liquidez si dependes de una ayuda que se cobra más adelante.</p>` : ""}
    </div>
  `;
}

function getMaintenanceDisplay(economic) {
  if (!economic.maintenance.included) return "No incluido";
  return formatSignedCurrency(economic.maintenance.annualSavings);
}

function renderImpactCard(label, value, caption, tone = "neutral") {
  return `
    <div class="impact-card impact-card--${tone}">
      <span class="impact-card__label">${label}</span>
      <strong class="impact-card__value">${value}</strong>
      <span class="impact-card__caption">${caption}</span>
    </div>
  `;
}

function renderChartRow(label, value, width, tone) {
  return `
    <div class="chart-row">
      <div class="chart-row__meta">
        <span class="chart-row__label">${label}</span>
        <span class="chart-row__value">${value}</span>
      </div>
      <div class="chart-row__track">
        <div class="chart-row__fill chart-row__fill--${tone}" data-chart-width="${width}"></div>
      </div>
    </div>
  `;
}

function buildCostChartMarkup(economic) {
  const maxValue = Math.max(
    economic.currentAnnualCost,
    economic.estimatedElectricAnnualCost,
    Math.abs(economic.annualSavings),
    1
  );

  return `
    ${renderChartRow("Coste energético anual actual", formatCurrency(economic.currentAnnualCost), (economic.currentAnnualCost / maxValue) * 100, "current")}
    ${renderChartRow("Coste energético anual estimado en eléctrico", formatCurrency(economic.estimatedElectricAnnualCost), (economic.estimatedElectricAnnualCost / maxValue) * 100, "electric")}
    ${renderChartRow(economic.annualSavings >= 0 ? "Ahorro total anual estimado" : "Sobrecoste total anual estimado", formatSignedCurrency(economic.annualSavings), (Math.abs(economic.annualSavings) / maxValue) * 100, economic.annualSavings >= 0 ? "savings" : "risk")}
  `;
}

function renderMetric(label, value, tone = "neutral") {
  return `
    <div class="metric metric--${tone}">
      <span class="metric__label">${label}</span>
      <span class="metric__value">${value}</span>
    </div>
  `;
}

function renderWhyFactor(item) {
  return `
    <li>
      <span class="insight-list__title">${item.title}</span>
      <span class="insight-list__detail">${item.detail}</span>
    </li>
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

function getNumberParseOptions(question) {
  return {
    preferDecimal: question.format === "decimal" || question.format === "currency-decimal",
  };
}

function parseQuestionNumber(question, value) {
  return parseFlexibleNumber(value, getNumberParseOptions(question));
}

function parseFlexibleNumber(value, options = {}) {
  // Casos de validación esperados para el parseo numérico:
  // 1,62 -> 1.62
  // 1.62 -> 1.62
  // 2 -> 2
  // 1,5 -> 1.5
  // 6,5 -> 6.5
  // 6.5 -> 6.5
  // 0,15 -> 0.15
  // 0.15 -> 0.15
  // 12000 -> 12000
  // 12.000 -> 12000 en importes/enteros; en campos decimales se interpreta como 12 para evitar inflar consumos o precios.
  if (value === null || typeof value === "undefined") return null;

  const { preferDecimal = false } = options;

  let normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "");

  if (!normalized || normalized === "-" || /[.,]$/.test(normalized)) return null;

  const minusMatches = normalized.match(/-/g) ?? [];
  if (minusMatches.length > 1 || (minusMatches.length === 1 && !normalized.startsWith("-"))) return null;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (hasComma) {
    normalized = normalizeSingleSeparatorNumber(normalized, ",", preferDecimal);
  } else if (hasDot) {
    normalized = normalizeSingleSeparatorNumber(normalized, ".", preferDecimal);
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberInput(input, question, explicitValue = null) {
  const value = explicitValue ?? parseQuestionNumber(question, input.value);
  if (value === null) {
    delete input.dataset.numericValue;
    return;
  }

  input.dataset.numericValue = String(value);

  if (question.format === "currency" || question.format === "integer") {
    input.value = formatPlainNumber(value, 0);
    return;
  }

  if (question.format === "currency-decimal") {
    const maxDigits = question.id === "currentFuelPrice" ? 3 : 2;
    input.value = formatPlainNumber(value, value % 1 === 0 ? 0 : maxDigits);
    return;
  }

  input.value = formatPlainNumber(value, value % 1 === 0 ? 0 : 2);
}

function unformatNumberInput(input) {
  if (!input.dataset.numericValue) return;
  input.value = String(input.dataset.numericValue).replace(".", ",");
}

function normalizeSingleSeparatorNumber(value, separator, preferDecimal = false) {
  const sign = value.startsWith("-") ? "-" : "";
  const unsigned = sign ? value.slice(1) : value;
  const parts = unsigned.split(separator);
  const decimalPart = parts[parts.length - 1];

  if (!decimalPart) return sign ? `${sign}${parts.join("")}` : parts.join("");

  if (preferDecimal && decimalPart.length <= 3) {
    return `${sign}${parts.slice(0, -1).join("")}.${decimalPart}`;
  }

  if (!preferDecimal && parts.length === 2 && decimalPart.length === 3) {
    return `${sign}${parts.join("")}`;
  }

  if (parts.length > 2 && !preferDecimal) {
    return `${sign}${parts.join("")}`;
  }

  return `${sign}${parts.slice(0, -1).join("")}.${decimalPart}`;
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
