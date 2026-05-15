import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JOBS, SALARY_DATA } from '../data/jobs';
import { getCurrentLanguage } from '../utils/i18n';
import { submitEmail } from '../utils/subscribe';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './home-native.css';

const SIGNAL_NODES = [
  { code: 'MX', x: 34, y: 24, strength: 4 },
  { code: 'CO', x: 42, y: 40, strength: 3 },
  { code: 'BR', x: 60, y: 50, strength: 5 },
  { code: 'CL', x: 36, y: 65, strength: 3 },
  { code: 'AR', x: 47, y: 80, strength: 4 },
];

const COUNTRY_LOOKUP = [
  { nameEn: 'Mexico', nameEs: 'México', tokens: ['mexico', 'méxico', 'cdmx', 'mx'] },
  { nameEn: 'Colombia', nameEs: 'Colombia', tokens: ['colombia', 'bogota', 'bogotá', 'co'] },
  { nameEn: 'Argentina', nameEs: 'Argentina', tokens: ['argentina', 'buenos aires', 'ar'] },
  { nameEn: 'Chile', nameEs: 'Chile', tokens: ['chile', 'santiago', 'cl'] },
  { nameEn: 'Brazil', nameEs: 'Brasil', tokens: ['brazil', 'brasil', 'sao paulo', 'são paulo', 'br'] },
];

function useLanguage() {
  const [lang, setLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const handler = (event) => setLang(event.detail?.lang || getCurrentLanguage());
    window.addEventListener('nortec:langchange', handler);
    return () => window.removeEventListener('nortec:langchange', handler);
  }, []);

  return lang;
}

function RevealSection({ className = '', threshold = 0.15, children }) {
  const ref = useRef(null);
  const visible = useIntersectionObserver(ref, { threshold });
  return (
    <section ref={ref} className={`${className} home-reveal ${visible ? 'is-visible' : ''}`}>
      {children}
    </section>
  );
}

function ScorePips({ score = 0 }) {
  return (
    <div className="score-pips">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={idx < score ? 'on' : ''} />
      ))}
    </div>
  );
}

function parseSalaryRange(rawText) {
  if (!rawText) return { low: null, high: null };
  const compact = rawText.replace(/,/g, '');
  const kMatches = [...compact.matchAll(/(\d+(?:\.\d+)?)\s*K/gi)].map((m) => Number(m[1]) * 1000);
  if (kMatches.length >= 2) return { low: kMatches[0], high: kMatches[1] };
  if (kMatches.length === 1) return { low: kMatches[0], high: kMatches[0] };
  const numericMatches = [...compact.matchAll(/\b(\d{5,6})\b/g)].map((m) => Number(m[1]));
  if (numericMatches.length >= 2) return { low: numericMatches[0], high: numericMatches[1] };
  if (numericMatches.length === 1) return { low: numericMatches[0], high: numericMatches[0] };
  return { low: null, high: null };
}

function getSalaryRangeForJob(job) {
  if (typeof job.salaryNum === 'number') return { low: job.salaryNum, high: job.salaryNum };
  return parseSalaryRange(job.salaryEstimate || job.salary || '');
}

function getSalaryDisplay(job) {
  return job.salarySource === 'listed' ? job.salary : job.salaryEstimate || job.salary || 'N/A';
}

function extractSalaryFloor(query) {
  const lower = query.toLowerCase();
  const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k/);
  if (kMatch) return Math.round(Number(kMatch[1]) * 1000);
  const nMatch = lower.match(/\b(\d{2,6})\b/);
  if (!nMatch) return null;
  const raw = Number(nMatch[1]);
  if (Number.isNaN(raw)) return null;
  return raw < 1000 ? raw * 1000 : raw;
}

function getSortedTopJobs(pool, limit = 5) {
  return [...pool]
    .sort((a, b) => {
      const salaryA = getSalaryRangeForJob(a).high || 0;
      const salaryB = getSalaryRangeForJob(b).high || 0;
      if (b.score !== a.score) return b.score - a.score;
      return salaryB - salaryA;
    })
    .slice(0, limit);
}

function matchesRoleQuery(job, normalizedQuery) {
  const title = job.title.toLowerCase();
  const fn = job.function.toLowerCase();
  if (title.includes(normalizedQuery) || fn.includes(normalizedQuery)) return true;
  if ((normalizedQuery.includes('engineer') || normalizedQuery.includes('developer') || normalizedQuery.includes('devops')) && fn.includes('engineering')) {
    return true;
  }
  if (normalizedQuery.includes('designer') && (fn.includes('design') || title.includes('design'))) return true;
  if (normalizedQuery.includes('manager') && title.includes('manager')) return true;
  if ((normalizedQuery.includes('customer') || normalizedQuery.includes('success')) && fn.includes('customer success')) return true;
  if (normalizedQuery.includes('qa') && (fn.includes('qa') || title.includes('qa'))) return true;
  if (normalizedQuery.includes('data') && (fn.includes('data') || title.includes('data'))) return true;
  return false;
}

function resolveTerminalQuery(rawQuery, isEs) {
  const normalized = rawQuery.trim().toLowerCase();
  const defaultTop = getSortedTopJobs(JOBS, 3);

  if (!normalized) {
    return {
      label: isEs ? 'Mostrando roles top por puntaje:' : 'Showing top roles by score:',
      jobs: defaultTop,
    };
  }

  const salaryFloor = extractSalaryFloor(normalized);
  if (salaryFloor !== null) {
    const matched = getSortedTopJobs(
      JOBS.filter((job) => {
        const range = getSalaryRangeForJob(job);
        return (range.high || 0) >= salaryFloor;
      }),
      6
    );
    return {
      label: isEs ? `Mostrando roles que pagan $${Math.round(salaryFloor / 1000)}K+:` : `Showing roles paying $${Math.round(salaryFloor / 1000)}K+:`,
      jobs: matched.length ? matched : defaultTop,
    };
  }

  const countryMatch = COUNTRY_LOOKUP.find((country) => country.tokens.some((token) => normalized.includes(token)));
  if (countryMatch) {
    const strictMatches = JOBS.filter((job) => countryMatch.tokens.some((token) => job.location.toLowerCase().includes(token)));
    const latamEligiblePool = JOBS.filter((job) => job.latamEligible);
    const matched = getSortedTopJobs(strictMatches.length ? strictMatches : latamEligiblePool, 6);
    return {
      label: isEs ? `Roles abiertos para ${countryMatch.nameEs}:` : `Roles open to ${countryMatch.nameEn}:`,
      jobs: matched,
    };
  }

  const roleMatches = getSortedTopJobs(JOBS.filter((job) => matchesRoleQuery(job, normalized)), 6);
  if (roleMatches.length) {
    return {
      label: isEs ? `Roles encontrados para "${rawQuery}":` : `Roles found for "${rawQuery}":`,
      jobs: roleMatches,
    };
  }

  const tokenList = normalized.split(/\s+/).filter(Boolean);
  const skillMatches = getSortedTopJobs(
    JOBS.filter((job) =>
      job.tags.some((tag) => {
        const tagLower = tag.toLowerCase();
        return tokenList.some((token) => token.length > 1 && (tagLower.includes(token) || token.includes(tagLower)));
      })
    ),
    6
  );
  if (skillMatches.length) {
    return {
      label: isEs ? `Coincidencias por skill "${rawQuery}":` : `Skill matches for "${rawQuery}":`,
      jobs: skillMatches,
    };
  }

  return {
    label: isEs ? 'Sin match exacto. Mostrando roles top:' : 'No exact match. Showing top roles:',
    jobs: defaultTop,
  };
}

export default function Home() {
  const navigate = useNavigate();
  const lang = useLanguage();
  const isEs = lang === 'es';
  const topJobs = useMemo(() => [...JOBS].sort((a, b) => b.score - a.score).slice(0, 8), []);

  const [openSalaryById, setOpenSalaryById] = useState({});
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [cardsUseTap, setCardsUseTap] = useState(false);
  const [heroEmail, setHeroEmail] = useState('');
  const [whyEmail, setWhyEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [heroStatus, setHeroStatus] = useState('');
  const [whyStatus, setWhyStatus] = useState('');
  const [ctaStatus, setCtaStatus] = useState('');

  const salaryRef = useRef(null);
  const salaryVisible = useIntersectionObserver(salaryRef, { threshold: 0.2 });
  const salaryTerminalRef = useRef(null);
  const salaryTerminalVisible = useIntersectionObserver(salaryTerminalRef, { threshold: 0.4 });
  const ctaTerminalRef = useRef(null);
  const ctaTerminalVisible = useIntersectionObserver(ctaTerminalRef, { threshold: 0.4 });
  const terminalInputRef = useRef(null);
  const [salaryTyped, setSalaryTyped] = useState(0);
  const [terminalReady, setTerminalReady] = useState(false);
  const [terminalProcessing, setTerminalProcessing] = useState(false);
  const [processingDots, setProcessingDots] = useState(0);
  const [terminalQuery, setTerminalQuery] = useState('');
  const [terminalSubmitted, setTerminalSubmitted] = useState('');
  const [terminalResultLabel, setTerminalResultLabel] = useState('');
  const [terminalResults, setTerminalResults] = useState([]);
  const [terminalResetKey, setTerminalResetKey] = useState(0);
  const [ctaTyped, setCtaTyped] = useState(0);
  const terminalBootLines = useMemo(
    () =>
      isEs
        ? [
            '> NORTEC SIGNAL v1.0 — INICIALIZANDO...',
            '[✓] Escaneando 50+ empresas verificadas en LatAm',
            '[✓] Cargando inteligencia salarial — 8 funciones',
            '[✓] Cruzando 15 roles remotos activos',
            '[✓] Filtros de elegibilidad LatAm: ACTIVOS',
            '[✓] Salida bilingüe: EN + ES',
            '> ESTADO: NORTHBOUND ■',
            '> Listo. Escribe un rol, skill, salario o país.',
          ]
        : [
            '> NORTEC SIGNAL v1.0 — INITIALIZING...',
            '[✓] Scanning 50+ verified LatAm employers',
            '[✓] Loading salary intelligence — 8 functions',
            '[✓] Cross-referencing 15 active remote roles',
            '[✓] LatAm eligibility filters: ACTIVE',
            '[✓] Bilingual output: EN + ES',
            '> STATUS: NORTHBOUND ■',
            '> Ready. Type a role, skill, salary, or country.',
          ],
    [isEs]
  );
  const ctaTerminalLines = useMemo(
    () =>
      isEs
        ? [
            'NORTeC // edición #001',
            '▲ Luxury Presence · Staff AI Engineer',
            '▲ Clara · Forward-Deployed AI Engineer',
            '◆ Praxent · Senior SWE React/Node',
            '◆ CoPilot AI · Customer Success Manager',
            'Señal salarial: AI Engineer avg $118K',
            'estado: northbound',
          ]
        : [
            'NORTeC // issue #001',
            '▲ Luxury Presence · Staff AI Engineer',
            '▲ Clara · Forward-Deployed AI Engineer',
            '◆ Praxent · Senior SWE React/Node',
            '◆ CoPilot AI · Customer Success Manager',
            'Salary signal: AI Engineer avg $118K',
            'status: northbound',
          ],
    [isEs]
  );

  useEffect(() => {
    if (!salaryTerminalVisible) return undefined;
    const lineCount = terminalBootLines.length;
    const earlyLines = Math.max(0, lineCount - 2);
    const timers = [];

    setSalaryTyped(0);
    setTerminalReady(false);
    setTerminalProcessing(false);
    setProcessingDots(0);
    setTerminalQuery('');
    setTerminalSubmitted('');
    setTerminalResultLabel('');
    setTerminalResults([]);

    for (let idx = 0; idx < earlyLines; idx += 1) {
      const timeoutId = setTimeout(() => {
        setSalaryTyped(idx + 1);
      }, (idx + 1) * 400);
      timers.push(timeoutId);
    }

    const pauseBase = earlyLines * 400 + 600;
    for (let idx = earlyLines; idx < lineCount; idx += 1) {
      const timeoutId = setTimeout(() => {
        setSalaryTyped(idx + 1);
      }, pauseBase + (idx - earlyLines + 1) * 400);
      timers.push(timeoutId);
    }

    const readyTimeout = setTimeout(() => setTerminalReady(true), pauseBase + 2 * 400 + 180);
    timers.push(readyTimeout);

    return () => {
      timers.forEach((id) => clearTimeout(id));
    };
  }, [salaryTerminalVisible, terminalBootLines, terminalResetKey]);

  useEffect(() => {
    if (!terminalProcessing) return undefined;
    let dots = 0;
    const id = setInterval(() => {
      dots = (dots + 1) % 4;
      setProcessingDots(dots);
    }, 240);
    return () => clearInterval(id);
  }, [terminalProcessing]);

  useEffect(() => {
    if (!ctaTerminalVisible) return;
    const lineCount = 7;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCtaTyped(Math.min(i, lineCount));
      if (i >= lineCount) clearInterval(id);
    }, 160);
    return () => clearInterval(id);
  }, [ctaTerminalVisible, isEs]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const updateCardsMode = () => setCardsUseTap(media.matches);
    updateCardsMode();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateCardsMode);
      return () => media.removeEventListener('change', updateCardsMode);
    }
    media.addListener(updateCardsMode);
    return () => media.removeListener(updateCardsMode);
  }, []);

  const maxRoleSalary = Math.max(...SALARY_DATA.map((row) => row.mid));
  const countrySalaryData = [
    { countryEn: 'Brazil', countryEs: 'Brasil', value: 78, search: 'brazil' },
    { countryEn: 'Argentina', countryEs: 'Argentina', value: 65, search: 'argentina' },
    { countryEn: 'Colombia', countryEs: 'Colombia', value: 61, search: 'colombia' },
    { countryEn: 'Mexico', countryEs: 'México', value: 70, search: 'mexico' },
    { countryEn: 'Chile', countryEs: 'Chile', value: 68, search: 'chile' },
  ];
  const maxCountrySalary = Math.max(...countrySalaryData.map((row) => row.value));

  const featureItems = [
    {
      titleEn: 'Real Remote Jobs',
      titleEs: 'Empleos Remotos Reales',
      bodyEn: 'Hand-picked roles from companies actively hiring LatAm talent.',
      bodyEs: 'Roles curados de empresas que contratan talento LatAm activamente.',
      to: '/jobs',
    },
    {
      titleEn: 'Salary Signals',
      titleEs: 'Señales Salariales',
      bodyEn: 'Compensation benchmarks to negotiate from data, not guesswork.',
      bodyEs: 'Benchmarks de compensación para negociar con datos reales.',
      to: '/tracker?tab=trends',
    },
    {
      titleEn: 'Application Playbooks',
      titleEs: 'Playbooks de Aplicación',
      bodyEn: 'Practical guidance for CVs, interviews, and high-conversion outreach.',
      bodyEs: 'Guías prácticas para CV, entrevistas y outreach de alta conversión.',
      to: '/blog/salary-negotiation',
    },
    {
      titleEn: 'Company Radar',
      titleEs: 'Radar de Empresas',
      bodyEn: 'A clear view of remote-friendly teams that consistently hire in LatAm.',
      bodyEs: 'Visibilidad de equipos remote-friendly que contratan en LatAm.',
      to: '/tracker?tab=companies',
    },
  ];

  async function handleSubscribe(event, email, setEmail, setStatus, source) {
    event.preventDefault();
    if (!email) return;
    setStatus(isEs ? 'Enviando...' : 'Sending...');
    const result = await submitEmail(email, source);
    if (result.ok) {
      setStatus(isEs ? '✓ Listo' : '✓ Done');
      setEmail('');
    } else {
      setStatus(isEs ? 'Intentar otra vez' : 'Try again');
    }
  }

  function resetInteractiveTerminal() {
    setTerminalResetKey((prev) => prev + 1);
    setTimeout(() => terminalInputRef.current?.focus(), 40);
  }

  function runTerminalCommand(commandText) {
    const trimmed = commandText.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    if (normalized === 'clear' || normalized === '[clear]') {
      resetInteractiveTerminal();
      return;
    }
    setTerminalSubmitted(trimmed);
    setTerminalProcessing(true);
    setTerminalResultLabel('');
    setTerminalResults([]);
    setTerminalQuery('');

    const result = resolveTerminalQuery(trimmed, isEs);
    setTimeout(() => {
      setTerminalProcessing(false);
      setTerminalResultLabel(result.label);
      setTerminalResults(result.jobs);
      setTerminalReady(true);
    }, 840);
  }

  function handleTerminalKeyDown(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    runTerminalCommand(terminalQuery);
  }

  function getLocationTags(job) {
    return job.location
      .split('·')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);
  }

  function getRoleMatchCount(role) {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('customer success')) {
      return Math.max(1, JOBS.filter((job) => job.function.toLowerCase() === 'customer success').length);
    }
    if (roleLower.includes('ai')) {
      return Math.max(1, JOBS.filter((job) => job.aiRelevance || job.function === 'Engineering').length);
    }
    if (roleLower.includes('engineer')) {
      return Math.max(1, JOBS.filter((job) => job.function === 'Engineering').length);
    }
    if (roleLower.includes('product manager')) {
      const count = JOBS.filter((job) => job.title.toLowerCase().includes('product') || job.function.toLowerCase().includes('product')).length;
      return Math.max(3, count);
    }
    if (roleLower.includes('designer')) {
      const count = JOBS.filter((job) => job.title.toLowerCase().includes('design') || job.tags.some((tag) => tag.toLowerCase().includes('design'))).length;
      return Math.max(2, count);
    }
    return 3;
  }

  function handleRoleBarClick(role) {
    if (role === 'AI Engineer') {
      navigate('/jobs?filter=Engineering');
      return;
    }
    if (role === 'Customer Success') {
      navigate('/jobs?filter=Customer%20Success');
      return;
    }
    navigate('/tracker?tab=trends');
  }

  function handleCountryBarClick(countrySearch) {
    navigate(`/tracker?tab=jobs&search=${encodeURIComponent(countrySearch)}`);
  }

  return (
    <div className="home-native">
      <div className="home-shell">
        <section className="home-hero">
          <div className="hero-copy">
            <div className="hero-wordmark">
              NORTE<span className="teal">C</span>
            </div>
            <h1 className="hero-tagline">{isEs ? 'Trabaja global. Vive local.' : 'Work global. Live local.'}</h1>
            <p className="hero-subline">
              {isEs ? '> Trabaja global. Vive local. // Work global. Live local.' : '> Work global. Live local. // Trabaja global. Vive local.'}
            </p>
            <p className="hero-description">
              {isEs
                ? 'Roles remotos verificados, señales salariales y estrategia de carrera para talento tech en LatAm.'
                : 'Verified remote roles, salary signals, and career strategy for LatAm tech talent.'}
            </p>
            <div className="home-email-label">{isEs ? 'Recibe el resumen semanal — gratis' : 'Get the weekly brief — free'}</div>
            <form className="email-form" onSubmit={(event) => handleSubscribe(event, heroEmail, setHeroEmail, setHeroStatus, 'home-hero')}>
              <input
                type="email"
                value={heroEmail}
                onChange={(event) => setHeroEmail(event.target.value)}
                placeholder={isEs ? 'tu@email.com' : 'your@email.com'}
                required
              />
              <button type="submit">{heroStatus || (isEs ? 'Recibe el resumen →' : 'Get the weekly brief →')}</button>
            </form>
          </div>

          <div className="hero-map-panel">
            <div className="hero-map-grid" />
            <div className="signal-active-indicator">
              <span className="signal-active-dot" />
              {isEs ? 'SEÑAL ACTIVA' : 'SIGNAL ACTIVE'}
            </div>
            <div className="signal-compass">N →</div>
            <div className="signal-global-label">GLOBAL</div>
            <svg className="hero-map-svg hero-signal-lines" viewBox="0 0 100 100" aria-label="Live regional signal trajectories">
              {SIGNAL_NODES.map((node) => (
                <path
                  key={`${node.code}-line`}
                  className="signal-trajectory"
                  d={`M ${node.x} ${node.y} Q ${(node.x + 67) / 2} ${Math.max(10, (node.y + 10) / 2 - 8)} 67 11`}
                />
              ))}
            </svg>

            {SIGNAL_NODES.map((node) => (
              <div key={node.code} className="signal-node" style={{ top: `${node.y}%`, left: `${node.x}%` }}>
                <span className="signal-node-ring" />
                <span className="signal-node-core">{node.code}</span>
                <div className="signal-node-bars">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={`${node.code}-${idx}`} className={idx < node.strength ? 'on' : ''} />
                  ))}
                </div>
              </div>
            ))}

            <div className="hero-stat-float s1">
              <div className="value">
                $87K<span className="readout-cursor" />
              </div>
              <div className="label">{isEs ? 'salario promedio' : 'avg salary'}</div>
            </div>
            <div className="hero-stat-float s2">
              <div className="value">
                5<span className="readout-cursor" />
              </div>
              <div className="label">{isEs ? 'roles esta semana' : 'roles this week'}</div>
            </div>
            <div className="hero-stat-float s3">
              <div className="value">
                400K+<span className="readout-cursor" />
              </div>
              <div className="label">{isEs ? 'workers remotos LatAm' : 'remote workers LatAm'}</div>
            </div>
          </div>
        </section>

        <RevealSection className="home-section">
          <div className="section-head">
            <h2>{isEs ? 'Roles de Esta Semana' : "This Week's Roles"}</h2>
            <Link to="/jobs" className="job-link">
              {isEs ? 'Ver todos →' : 'Browse all →'}
            </Link>
          </div>
          <div className="jobs-grid-native">
            {topJobs.map((job) => (
              <article
                key={job.id}
                className={`job-card-native ${expandedJobId === job.id ? 'is-open' : ''}`}
                onClick={() => {
                  if (!cardsUseTap) return;
                  setExpandedJobId((prev) => (prev === job.id ? null : job.id));
                }}
              >
                <div className="company">{job.company}</div>
                <div className="title">{job.title}</div>
                <div className="job-location-tags">
                  {getLocationTags(job).map((tag) => (
                    <span className="job-location-chip" key={`${job.id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="meta">
                  {job.type} · {job.function}
                </div>
                <div className="job-expand-hint">
                  {cardsUseTap ? (isEs ? 'toca para explorar' : 'tap to explore') : isEs ? 'hover para explorar' : 'hover to explore'}
                  <span className="job-expand-chevron">⌄</span>
                </div>

                <div className="job-details-collapsible">
                  <div className="job-why">{isEs ? job.whyEs || job.why : job.why}</div>
                  <div className="job-actions-native">
                    {openSalaryById[job.id] ? (
                      <div className="salary-line">{getSalaryDisplay(job)}</div>
                    ) : (
                      <button
                        className="reveal-btn"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenSalaryById((prev) => ({ ...prev, [job.id]: true }));
                        }}
                      >
                        {isEs ? 'Revelar salario →' : 'Reveal salary →'}
                      </button>
                    )}
                    <ScorePips score={job.score} />
                    <Link
                      to={`/job?id=${job.id}`}
                      className="job-link"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      {isEs ? 'Ver empleo →' : 'View Job →'}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </RevealSection>

        <section ref={salaryRef} className={`home-section home-reveal ${salaryVisible ? 'is-visible' : ''}`}>
          <div className="section-head">
            <h2>{isEs ? 'Lo Que Paga el Tech en LatAm' : 'What LatAm Tech Pays'}</h2>
          </div>
          <div className="salary-panels">
            <article className="salary-panel">
              <h3>{isEs ? 'Compensación promedio por rol (USD K/año)' : 'Average comp by role (USD K/yr)'}</h3>
              <div className="salary-bars">
                {SALARY_DATA.map((row) => (
                  <button
                    type="button"
                    className="salary-bar-row salary-bar-row-clickable"
                    key={row.role}
                    onClick={() => handleRoleBarClick(row.role)}
                  >
                    <label>{row.role}</label>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${salaryVisible ? 'is-visible' : ''}`}
                        style={{ '--target-width': `${Math.round((row.mid / maxRoleSalary) * 100)}%` }}
                      />
                    </div>
                    <div className="value">${row.mid}K</div>
                    <span className="salary-row-arrow">→</span>
                    <span className="salary-row-tooltip">
                      {isEs ? `Ver ${getRoleMatchCount(row.role)} roles →` : `View ${getRoleMatchCount(row.role)} roles →`}
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <article className="salary-panel">
              <h3>{isEs ? 'Compensación por país (todos los roles)' : 'Compensation by country (all roles)'}</h3>
              <div className="salary-bars">
                {countrySalaryData.map((row) => (
                  <button
                    type="button"
                    className="salary-bar-row salary-bar-row-clickable"
                    key={row.countryEn}
                    onClick={() => handleCountryBarClick(row.search)}
                  >
                    <label>{isEs ? row.countryEs : row.countryEn}</label>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${salaryVisible ? 'is-visible' : ''}`}
                        style={{ '--target-width': `${Math.round((row.value / maxCountrySalary) * 100)}%` }}
                      />
                    </div>
                    <div className="value">${row.value}K</div>
                    <span className="salary-row-arrow">→</span>
                    <span className="salary-row-tooltip">
                      {isEs ? `Ver roles abiertos para ${row.countryEs} →` : `View roles open to ${row.countryEn} →`}
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <article className="salary-panel">
              <h3>{isEs ? 'Señal de mercado en vivo' : 'Live market signal terminal'}</h3>
              <div
                ref={salaryTerminalRef}
                className="terminal-box terminal-box-interactive"
                onClick={() => terminalInputRef.current?.focus()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    terminalInputRef.current?.focus();
                  }
                }}
              >
                <div className="live-badge">LIVE</div>
                <div className="terminal-lines">
                  {terminalBootLines.map((line, idx) => (
                    <div key={line} className={`terminal-line ${idx < salaryTyped ? 'on' : ''}`}>
                      {line}
                    </div>
                  ))}

                  {(terminalReady || terminalProcessing) && (
                    <div className="terminal-line on terminal-command-line">
                      &gt; {terminalProcessing ? terminalSubmitted : terminalQuery}
                      {!terminalProcessing && !terminalQuery && <span className="terminal-idle-underscore">_</span>}
                      {!terminalProcessing && terminalQuery && <span className="terminal-caret" />}
                    </div>
                  )}

                  {terminalProcessing && (
                    <div className="terminal-line on terminal-processing-line">
                      {isEs ? 'procesando' : 'processing'}
                      {'.'.repeat(processingDots || 1)}
                    </div>
                  )}

                  {!terminalProcessing && terminalResultLabel && <div className="terminal-line on">{terminalResultLabel}</div>}

                  {!terminalProcessing &&
                    terminalResults.map((job) => (
                      <Link
                        to={`/job?id=${job.id}`}
                        key={`terminal-${job.id}`}
                        className="terminal-line on terminal-result-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="terminal-result-score">[{job.score}]</span> {job.company} · {job.title} · {getSalaryDisplay(job)}
                      </Link>
                    ))}
                </div>

                <input
                  ref={terminalInputRef}
                  className="terminal-hidden-input"
                  type="text"
                  value={terminalQuery}
                  onChange={(event) => setTerminalQuery(event.target.value)}
                  onKeyDown={handleTerminalKeyDown}
                  aria-label={isEs ? 'Buscar en terminal' : 'Search in terminal'}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </article>
          </div>
        </section>

        <RevealSection className="home-section">
          <div className="feature-strip">
            {featureItems.map((item) => (
              <Link key={item.titleEn} to={item.to} className="feature-item feature-item-link">
                <h4>{isEs ? item.titleEs : item.titleEn}</h4>
                <p>{isEs ? item.bodyEs : item.bodyEn}</p>
              </Link>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="home-section">
          <div className="why-grid-native">
            <div className="radar-panel">
              <div className="radar-wrap">
                <svg width="290" height="290" viewBox="0 0 290 290" aria-label="Enhanced Nortec radar visualization">
                  <defs>
                    <radialGradient id="radar-bg-gradient" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="rgba(15,163,154,0.18)" />
                      <stop offset="100%" stopColor="rgba(15,163,154,0.02)" />
                    </radialGradient>
                    <linearGradient id="radar-sweep-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(15,163,154,0.5)" />
                      <stop offset="100%" stopColor="rgba(15,163,154,0)" />
                    </linearGradient>
                  </defs>

                  <circle cx="145" cy="145" r="118" fill="url(#radar-bg-gradient)" className="radar-outer-glow" />
                  <circle cx="145" cy="145" r="106" fill="none" stroke="rgba(15,163,154,0.4)" />
                  <circle cx="145" cy="145" r="78" fill="none" stroke="rgba(15,163,154,0.27)" />
                  <circle cx="145" cy="145" r="50" fill="none" stroke="rgba(15,163,154,0.18)" />
                  <line x1="145" y1="26" x2="145" y2="264" stroke="rgba(15,163,154,0.18)" />
                  <line x1="26" y1="145" x2="264" y2="145" stroke="rgba(15,163,154,0.18)" />

                  <path d="M145 145 L145 34 A111 111 0 0 1 223 66 Z" fill="url(#radar-sweep-gradient)" opacity="0.75">
                    <animateTransform attributeName="transform" type="rotate" from="0 145 145" to="360 145 145" dur="5.2s" repeatCount="indefinite" />
                  </path>
                  <line x1="145" y1="145" x2="145" y2="30" stroke="rgba(15,163,154,0.85)" strokeWidth="1.8">
                    <animateTransform attributeName="transform" type="rotate" from="0 145 145" to="360 145 145" dur="5.2s" repeatCount="indefinite" />
                  </line>

                  <circle className="radar-dot pulse-red" cx="108" cy="82" r="4.2" />
                  <circle className="radar-dot pulse-red" cx="186" cy="160" r="4.5" />
                  <circle className="radar-dot pulse-teal" cx="172" cy="102" r="3.6" />
                  <circle className="radar-dot pulse-teal" cx="96" cy="174" r="3.9" />
                  <circle className="radar-dot pulse-red" cx="128" cy="202" r="3.7" />
                  <circle className="radar-dot pulse-teal" cx="200" cy="132" r="2.9" />
                  <circle className="radar-dot pulse-teal" cx="76" cy="132" r="2.8" />
                  <circle className="radar-dot pulse-red" cx="156" cy="66" r="2.8" />

                  <text x="114" y="76" className="radar-dot-label">
                    MEX
                  </text>
                  <text x="189" y="156" className="radar-dot-label">
                    BRA
                  </text>
                  <text x="132" y="216" className="radar-dot-label">
                    ARG
                  </text>
                  <text x="90" y="185" className="radar-dot-label">
                    COL
                  </text>

                  <text x="20" y="34" className="radar-coord">
                    90°W
                  </text>
                  <text x="233" y="34" className="radar-coord">
                    30°W
                  </text>
                  <text x="122" y="20" className="radar-coord">
                    23.5°N
                  </text>
                  <text x="130" y="149" className="radar-coord">
                    0° EQ
                  </text>
                  <text x="122" y="279" className="radar-coord">
                    23.5°S
                  </text>
                </svg>
                <div className="radar-footer-label">LATAM ROOTS / GLOBAL REACH</div>
              </div>
            </div>
            <div className="why-copy">
              <h3>
                {isEs ? 'OPORTUNIDADES RUMBO AL NORTE.' : 'NORTHBOUND OPPORTUNITIES.'}
                <br />
                <span className="teal">{isEs ? 'RAÍCES LOCALES.' : 'LOCAL ROOTS.'}</span>
              </h3>
              <p>
                {isEs
                  ? 'Nortec filtra oportunidades globales con contexto real para talento de LatAm: elegibilidad, compensación, y señales de crecimiento.'
                  : 'Nortec filters global opportunities with real LatAm context: eligibility, compensation, and growth signals.'}
              </p>
              <ul className="check-list">
                <li>{isEs ? 'Enfoque LatAm, ejecución global' : 'LatAm-first, globally minded'}</li>
                <li>{isEs ? 'Contenido y comunidad bilingüe' : 'Bilingual content and community'}</li>
                <li>{isEs ? 'Datos accionables, no ruido' : 'Actionable data, not noise'}</li>
                <li>{isEs ? 'Puntaje Nortec por rol' : 'Nortec Score on every role'}</li>
              </ul>
              <div className="why-stats">
                <div className="why-stat">
                  <div className="n">1,500+</div>
                  <div className="l">{isEs ? 'roles curados' : 'roles curated'}</div>
                </div>
                <div className="why-stat">
                  <div className="n">100%</div>
                  <div className="l">{isEs ? 'enfoque LatAm' : 'LatAm-focused'}</div>
                </div>
                <div className="why-stat">
                  <div className="n">EN/ES</div>
                  <div className="l">{isEs ? 'bilingüe' : 'bilingual'}</div>
                </div>
                <div className="why-stat">
                  <div className="n">$87K</div>
                  <div className="l">{isEs ? 'señal salarial' : 'salary signal'}</div>
                </div>
              </div>

              <div className="why-newsletter">
                <div className="why-newsletter-label">{isEs ? 'Recibe el resumen semanal — gratis' : 'Get the weekly brief — free'}</div>
                <form className="email-form why-email-form" onSubmit={(event) => handleSubscribe(event, whyEmail, setWhyEmail, setWhyStatus, 'home-why')}>
                  <input
                    type="email"
                    value={whyEmail}
                    onChange={(event) => setWhyEmail(event.target.value)}
                    placeholder={isEs ? 'tu@email.com' : 'your@email.com'}
                    required
                  />
                  <button type="submit">{whyStatus || (isEs ? 'Suscribirme →' : 'Subscribe →')}</button>
                </form>
                <div className="why-newsletter-meta">{isEs ? 'Gratis · Bilingüe · Sin spam' : 'Free · Bilingual · No spam'}</div>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection className="home-section">
          <div className="testimonials">
            <article className="testimonial">
              <p>
                {isEs
                  ? '“Nortec me ayudó a conseguir un rol remoto con empresa de EE.UU. sin salir de Colombia. Los datos salariales me dieron confianza para negociar.”'
                  : '"Nortec helped me land a fully remote U.S. role while staying in Colombia. The salary signals gave me confidence to negotiate."'}
              </p>
              <div className="author">Andrés · Bogotá</div>
            </article>
            <article className="testimonial">
              <p>
                {isEs
                  ? '“El brief semanal es el único correo que realmente espero. Claro, bilingüe y útil.”'
                  : '"The weekly brief is the only email I genuinely look forward to. Clear, bilingual, and practical."'}
              </p>
              <div className="author">Valeria · CDMX</div>
            </article>
            <article className="testimonial">
              <p>
                {isEs
                  ? '“Por fin una plataforma que entiende al talento de LatAm. El radar de empresas cambia el juego.”'
                  : '"Finally, a platform that understands LatAm talent. The company radar is a game-changer."'}
              </p>
              <div className="author">Diego · Buenos Aires</div>
            </article>
          </div>
        </RevealSection>

        <RevealSection className="sponsor-strip">
          <span className="label">{isEs ? 'Con la confianza de:' : 'Trusted by:'}</span>
          {['Deel', 'Remote.com', 'Platzi', 'Toptal', 'Linear', 'Supabase'].map((logo) => (
            <span key={logo} className="logo">
              {logo}
            </span>
          ))}
        </RevealSection>

        <RevealSection className="home-section">
          <div className="cta-grid">
            <div>
              <h3>
                {isEs ? 'TU PRÓXIMO TRABAJO ES' : 'YOUR NEXT JOB IS'}
                <br />
                <span className="red">{isEs ? 'REMOTO.' : 'REMOTE.'}</span>
              </h3>
              <form className="email-form" onSubmit={(event) => handleSubscribe(event, ctaEmail, setCtaEmail, setCtaStatus, 'home-cta')}>
                <input
                  type="email"
                  value={ctaEmail}
                  onChange={(event) => setCtaEmail(event.target.value)}
                  placeholder={isEs ? 'tu@email.com' : 'your@email.com'}
                  required
                />
                <button type="submit">{ctaStatus || (isEs ? 'Suscribirme gratis →' : 'Subscribe free →')}</button>
              </form>
            </div>
            <div ref={ctaTerminalRef} className="terminal-preview">
              {ctaTerminalLines.map((line, idx) => (
                <div key={line} className={`line ${idx < ctaTyped ? 'on' : ''}`}>
                  {idx === 0 ? <strong>{line}</strong> : line}
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}

