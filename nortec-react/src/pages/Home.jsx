import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { JOBS, SALARY_DATA } from '../data/jobs';
import { getCurrentLanguage } from '../utils/i18n';
import { submitEmail } from '../utils/subscribe';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './home-native.css';

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

export default function Home() {
  const lang = useLanguage();
  const isEs = lang === 'es';
  const topJobs = useMemo(() => [...JOBS].sort((a, b) => b.score - a.score).slice(0, 8), []);

  const [openSalaryById, setOpenSalaryById] = useState({});
  const [heroEmail, setHeroEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [heroStatus, setHeroStatus] = useState('');
  const [ctaStatus, setCtaStatus] = useState('');

  const salaryRef = useRef(null);
  const salaryVisible = useIntersectionObserver(salaryRef, { threshold: 0.2 });
  const salaryTerminalRef = useRef(null);
  const salaryTerminalVisible = useIntersectionObserver(salaryTerminalRef, { threshold: 0.4 });
  const ctaTerminalRef = useRef(null);
  const ctaTerminalVisible = useIntersectionObserver(ctaTerminalRef, { threshold: 0.4 });
  const [salaryTyped, setSalaryTyped] = useState(0);
  const [ctaTyped, setCtaTyped] = useState(0);

  useEffect(() => {
    if (!salaryTerminalVisible) return;
    const lineCount = 6;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setSalaryTyped(Math.min(i, lineCount));
      if (i >= lineCount) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [salaryTerminalVisible, isEs]);

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

  const maxRoleSalary = Math.max(...SALARY_DATA.map((row) => row.mid));
  const countrySalaryData = [
    { countryEn: 'Brazil', countryEs: 'Brasil', value: 78 },
    { countryEn: 'Argentina', countryEs: 'Argentina', value: 65 },
    { countryEn: 'Colombia', countryEs: 'Colombia', value: 61 },
    { countryEn: 'Mexico', countryEs: 'México', value: 70 },
    { countryEn: 'Chile', countryEs: 'Chile', value: 68 },
  ];
  const maxCountrySalary = Math.max(...countrySalaryData.map((row) => row.value));

  const salaryTerminalLines = isEs
    ? ['> nortec --northbound', '[✓] Mentalidad global', '[✓] Impacto local', '[✓] Conexión humana', '[✓] Futuro sin límites', 'estado: northbound']
    : ['> nortec --northbound', '[✓] Global mindset', '[✓] Local impact', '[✓] Human connection', '[✓] Limitless future', 'status: northbound'];

  const ctaTerminalLines = isEs
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
      ];

  const featureItems = [
    {
      titleEn: 'Real Remote Jobs',
      titleEs: 'Empleos Remotos Reales',
      bodyEn: 'Hand-picked roles from companies actively hiring LatAm talent.',
      bodyEs: 'Roles curados de empresas que contratan talento LatAm activamente.',
    },
    {
      titleEn: 'Salary Signals',
      titleEs: 'Señales Salariales',
      bodyEn: 'Compensation benchmarks to negotiate from data, not guesswork.',
      bodyEs: 'Benchmarks de compensación para negociar con datos reales.',
    },
    {
      titleEn: 'Application Playbooks',
      titleEs: 'Playbooks de Aplicación',
      bodyEn: 'Practical guidance for CVs, interviews, and high-conversion outreach.',
      bodyEs: 'Guías prácticas para CV, entrevistas y outreach de alta conversión.',
    },
    {
      titleEn: 'Company Radar',
      titleEs: 'Radar de Empresas',
      bodyEn: 'A clear view of remote-friendly teams that consistently hire in LatAm.',
      bodyEs: 'Visibilidad de equipos remote-friendly que contratan en LatAm.',
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
            <svg className="hero-map-svg" viewBox="0 0 600 520" aria-label="LatAm remote opportunities map">
              <path className="latam-shape" d="M180,88 L223,60 L274,52 L317,72 L339,106 L329,140 L300,165 L304,195 L338,232 L360,274 L356,316 L337,360 L317,372 L290,342 L270,302 L245,271 L218,238 L186,196 L168,146 Z" />
              <path className="trajectory-path trajectory-red" d="M 220 100 Q 280 40 405 10" />
              <path className="trajectory-path trajectory-red" d="M 242 195 Q 293 86 408 16" />
              <path className="trajectory-path trajectory-teal" d="M 310 254 Q 350 120 458 20" />
              <path className="trajectory-path trajectory-teal" d="M 284 332 Q 336 184 444 40" />
              <path className="trajectory-path trajectory-red" d="M 245 293 Q 300 158 430 26" />
            </svg>

            <div className="hero-ping" style={{ top: '20%', left: '37%' }}>
              <div className="hero-ping-dot" />
              <div className="hero-ping-label">MEX</div>
            </div>
            <div className="hero-ping" style={{ top: '36%', left: '40%' }}>
              <div className="hero-ping-dot" />
              <div className="hero-ping-label">COL</div>
            </div>
            <div className="hero-ping" style={{ top: '49%', left: '50%' }}>
              <div className="hero-ping-dot teal" />
              <div className="hero-ping-label">BRA</div>
            </div>
            <div className="hero-ping" style={{ top: '65%', left: '45%' }}>
              <div className="hero-ping-dot teal" />
              <div className="hero-ping-label">ARG</div>
            </div>
            <div className="hero-ping" style={{ top: '57%', left: '41%' }}>
              <div className="hero-ping-dot" />
              <div className="hero-ping-label">CHL</div>
            </div>

            <div className="hero-stat-float s1">
              <div className="value">$87K</div>
              <div className="label">{isEs ? 'salario promedio' : 'avg salary'}</div>
            </div>
            <div className="hero-stat-float s2">
              <div className="value">5</div>
              <div className="label">{isEs ? 'roles esta semana' : 'roles this week'}</div>
            </div>
            <div className="hero-stat-float s3">
              <div className="value">400K+</div>
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
              <article key={job.id} className="job-card-native">
                <div className="company">{job.company}</div>
                <div className="title">{job.title}</div>
                <div className="meta">{job.location}</div>
                <div className="tag-list">
                  {job.tags.slice(0, 4).map((tag) => (
                    <span className="tag-chip" key={`${job.id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="job-why">{isEs ? job.whyEs || job.why : job.why}</div>
                <div className="job-actions-native">
                  {openSalaryById[job.id] ? (
                    <div className="salary-line">{job.salarySource === 'listed' ? job.salary : job.salaryEstimate || job.salary}</div>
                  ) : (
                    <button className="reveal-btn" type="button" onClick={() => setOpenSalaryById((prev) => ({ ...prev, [job.id]: true }))}>
                      {isEs ? 'Revelar salario →' : 'Reveal salary →'}
                    </button>
                  )}
                  <ScorePips score={job.score} />
                  <Link to={`/job?id=${job.id}`} className="job-link">
                    {isEs ? `Ver empleo → ${job.source}` : `View job → ${job.source}`}
                  </Link>
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
                  <div className="salary-bar-row" key={row.role}>
                    <label>{row.role}</label>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${salaryVisible ? 'is-visible' : ''}`}
                        style={{ '--target-width': `${Math.round((row.mid / maxRoleSalary) * 100)}%` }}
                      />
                    </div>
                    <div className="value">${row.mid}K</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="salary-panel">
              <h3>{isEs ? 'Compensación por país (todos los roles)' : 'Compensation by country (all roles)'}</h3>
              <div className="salary-bars">
                {countrySalaryData.map((row) => (
                  <div className="salary-bar-row" key={row.countryEn}>
                    <label>{isEs ? row.countryEs : row.countryEn}</label>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${salaryVisible ? 'is-visible' : ''}`}
                        style={{ '--target-width': `${Math.round((row.value / maxCountrySalary) * 100)}%` }}
                      />
                    </div>
                    <div className="value">${row.value}K</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="salary-panel">
              <h3>{isEs ? 'Señal de mercado en vivo' : 'Live market signal terminal'}</h3>
              <div ref={salaryTerminalRef} className="terminal-box">
                <div className="live-badge">LIVE</div>
                <div className="terminal-lines">
                  {salaryTerminalLines.map((line, idx) => (
                    <div key={line} className={`terminal-line ${idx < salaryTyped ? 'on' : ''}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>

        <RevealSection className="home-section">
          <div className="feature-strip">
            {featureItems.map((item) => (
              <article key={item.titleEn} className="feature-item">
                <h4>{isEs ? item.titleEs : item.titleEn}</h4>
                <p>{isEs ? item.bodyEs : item.bodyEn}</p>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="home-section">
          <div className="why-grid-native">
            <div className="radar-panel">
              <svg width="260" height="260" viewBox="0 0 260 260" aria-label="Nortec radar visualization">
                <circle cx="130" cy="130" r="34" fill="none" stroke="rgba(15,163,154,0.45)" />
                <circle cx="130" cy="130" r="62" fill="none" stroke="rgba(15,163,154,0.32)" />
                <circle cx="130" cy="130" r="92" fill="none" stroke="rgba(15,163,154,0.22)" />
                <circle cx="130" cy="130" r="116" fill="none" stroke="rgba(15,163,154,0.18)" />
                <line x1="130" y1="130" x2="242" y2="130" stroke="rgba(15,163,154,0.9)" strokeWidth="2.5">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 130 130"
                    to="360 130 130"
                    dur="4.2s"
                    repeatCount="indefinite"
                  />
                </line>
                <circle cx="168" cy="92" r="4" fill="#ff4b28" />
                <circle cx="104" cy="174" r="4" fill="#ff4b28" />
                <circle cx="186" cy="152" r="3.4" fill="#0fa39a" />
              </svg>
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

