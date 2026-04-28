(function applyAppFixes() {
  function validateAllFieldsPatched() {
    let allValid = true;

    QUESTIONS.forEach((question) => {
      const isValid = validateField(question.id);
      if (!isValid) {
        allValid = false;
      }
    });

    return allValid;
  }

  function getComfortAdjectivePatched(answers) {
    const comfort = getComfortLevel(answers);
    if (comfort === "alto") return "alta";
    if (comfort === "medio") return "media";
    return "baja";
  }

  function buildPrimaryCaseSummaryPatched(verdict, caseFactors) {
    const positiveLead = caseFactors.positive[0].title.toLowerCase();
    const negativeLead = caseFactors.negative[0].title.toLowerCase();

    return `El resultado sale ${verdict.label.toLowerCase()} porque ${positiveLead} es un apoyo importante. Aun así, ${negativeLead} sigue marcando parte de la decisión.`;
  }

  function buildQualitativeAnalysisPatched(answers, economic, scoring, verdict, coherenceWarnings) {
    const caseFactors = buildCaseFactors(answers, economic);
    const strengths = caseFactors.positive.map((item) => `${item.title}. ${item.detail}`);
    const weaknesses = caseFactors.negative.map((item) => `${item.title}. ${item.detail}`);

    const paragraphs = [
      buildPrimaryCaseSummaryPatched(verdict, caseFactors),
      `En el día a día, ${buildOperationalLead(answers)} y ${buildOperationalRisk(answers)}. Eso deja una comodidad operativa ${getComfortAdjectivePatched(answers)} para convivir con un eléctrico como coche ${answers.mainVehicle === "si" ? "principal" : "secundario"}.`,
      `En dinero, pasarías de unos ${formatCurrency(economic.currentAnnualCost)} al año a ${formatCurrency(economic.estimatedElectricAnnualCost)} en el escenario eléctrico. ${buildAmortizationSentence(economic)}`,
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

  function handleSubmitPatched(event) {
    event.preventDefault();
    dom.formWarning.classList.add("is-hidden");
    dom.coherenceWarning.classList.add("is-hidden");

    const allValid = validateAllFieldsPatched();
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
    const narrative = buildQualitativeAnalysisPatched(answers, economic, scoring, verdict, coherenceWarnings);

    renderResults({ answers, economic, scoring, verdict, coherenceWarnings, narrative });
    persistDraftIfEnabled();
    dom.resultsSection.classList.remove("is-hidden");
    dom.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!dom?.form) return;

    dom.form.removeEventListener("submit", handleSubmit);
    dom.form.addEventListener("submit", handleSubmitPatched);
  });
})();
