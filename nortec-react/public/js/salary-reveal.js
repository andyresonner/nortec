const REVEAL_COPY = {
  en: {
    button: 'Reveal salary →',
    listed: 'Listed by company',
    estimate: 'Nortec estimate',
    estimateTooltip: "We research salaries when companies don't publish them.",
    infoLabel: 'Salary estimate info',
  },
  es: {
    button: 'Ver salario →',
    listed: 'Publicado por empresa',
    estimate: 'Estimación Nortec',
    estimateTooltip: 'Investigamos salarios cuando las empresas no los publican.',
    infoLabel: 'Información de estimación salarial',
  },
};

function getLangCopy(lang) {
  return REVEAL_COPY[lang] || REVEAL_COPY.en;
}

export function createSalaryRevealMarkup(job, lang = 'en') {
  const copy = getLangCopy(lang);
  const salaryValue = job.salaryEstimate || (lang === 'es' ? 'Salario no especificado' : 'Salary not specified');
  const source = job.salarySource === 'listed' ? 'listed' : 'nortec-estimate';
  const sourceLabel = source === 'listed' ? copy.listed : copy.estimate;
  const sourceClass = source === 'listed' ? 'is-listed' : 'is-estimate';

  return `
    <div class="salary-reveal" data-salary-reveal>
      <button type="button" class="salary-reveal-btn" data-reveal-btn aria-expanded="false">${copy.button}</button>
      <div class="salary-reveal-result">
        <div class="job-salary">${salaryValue}</div>
        <div class="salary-reveal-source ${sourceClass}">
          <span>${sourceLabel}</span>
          ${source === 'nortec-estimate' ? `
            <span class="salary-reveal-info" tabindex="0" aria-label="${copy.infoLabel}">
              i
              <span class="salary-reveal-tooltip">${copy.estimateTooltip}</span>
            </span>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// TODO: gate salary reveal behind email capture in future version
export function initSalaryReveal(root = document) {
  if (root.__nortecSalaryRevealBound) return;

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-reveal-btn]');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const reveal = button.closest('[data-salary-reveal]');
    if (!reveal || reveal.classList.contains('is-revealed')) return;

    reveal.classList.add('is-revealed');
    button.setAttribute('aria-expanded', 'true');
  }, true);

  root.__nortecSalaryRevealBound = true;
}
