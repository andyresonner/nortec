import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentLanguage } from '../utils/i18n';
import { submitEmail } from '../utils/subscribe';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './blog.css';

function useLanguage() {
  const [lang, setLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const handler = (event) => setLang(event.detail?.lang || getCurrentLanguage());
    window.addEventListener('nortec:langchange', handler);
    return () => window.removeEventListener('nortec:langchange', handler);
  }, []);

  return lang;
}

function ArticleMeta({ tagClass, tagEn, tagEs, timeEn, timeEs }) {
  return (
    <div>
      <span className={`blog-tag ${tagClass}`} data-en={tagEn} data-es={tagEs}>
        {tagEn}
      </span>
      <span className="read-pill" data-en={timeEn} data-es={timeEs}>
        {timeEn}
      </span>
    </div>
  );
}

function HeroChart({ visible }) {
  const bars = [94, 88, 82, 78, 71, 68];
  return (
    <svg className="svg-fill" viewBox="0 0 760 420" aria-label="LatAm hiring bar chart">
      <rect x="0" y="0" width="760" height="420" fill="#081113" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`grid-${i}`}
          x1="70"
          y1={60 + i * 48}
          x2="700"
          y2={60 + i * 48}
          stroke="rgba(15,163,154,0.2)"
          strokeWidth="1"
        />
      ))}
      {bars.map((value, i) => {
        const h = value * 2.6;
        const x = 90 + i * 100;
        const y = 360 - h;
        return (
          <g key={`bar-${value}`}>
            <rect
              className={`bar ${visible ? 'is-on' : ''}`}
              x={x}
              y={y}
              width="56"
              height={h}
              fill="#0fa39a"
              style={{ transitionDelay: `${i * 0.08}s` }}
            />
            <text
              className={`bar-label ${visible ? 'is-on' : ''}`}
              x={x + 28}
              y={y - 12}
              fontFamily="IBM Plex Mono"
              fontSize="11"
              fill="#f2e9d5"
              textAnchor="middle"
              style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
            >
              {value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Blog() {
  const lang = useLanguage();
  const heroRef = useRef(null);
  const peopleRef = useRef(null);
  const salaryRef = useRef(null);
  const radarRef = useRef(null);
  const neuralRef = useRef(null);
  const clockRef = useRef(null);

  const heroVisible = useIntersectionObserver(heroRef);
  const peopleVisible = useIntersectionObserver(peopleRef);
  const salaryVisible = useIntersectionObserver(salaryRef);
  const radarVisible = useIntersectionObserver(radarRef);
  const neuralVisible = useIntersectionObserver(neuralRef);
  const clockVisible = useIntersectionObserver(clockRef);

  const [offer, setOffer] = useState(0);
  const [counter, setCounter] = useState(0);
  const [email, setEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');
  const [status, setStatus] = useState('');

  const [clock, setClock] = useState({ bogota: '00:00', ny: '00:00' });

  useEffect(() => {
    if (!salaryVisible) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setOffer(Math.round(65000 + progress * 20000));
      setCounter(Math.round(80000 + progress * 15000));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [salaryVisible]);

  useEffect(() => {
    const formatter = (timeZone) =>
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      }).format(new Date());

    const update = () => {
      setClock({
        bogota: formatter('America/Bogota'),
        ny: formatter('America/New_York'),
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const hoursAngles = useMemo(() => {
    const [bHour = 0, bMinute = 0] = clock.bogota.split(':').map(Number);
    const [nHour = 0, nMinute = 0] = clock.ny.split(':').map(Number);
    const bogotaAngle = ((bHour % 12) + bMinute / 60) * 30;
    const nyAngle = ((nHour % 12) + nMinute / 60) * 30;
    return { bogotaAngle, nyAngle };
  }, [clock]);

  async function handleInlineSubscribe(event, setter) {
    event.preventDefault();
    const result = await submitEmail(setter.value, 'blog-inline');
    if (result.ok) {
      setStatus(lang === 'es' ? '✓ Listo' : '✓ Done');
      setter.set('');
    } else {
      setStatus(lang === 'es' ? 'Intentar otra vez' : 'Try again');
    }
  }

  return (
    <div className="blog-page">
      <main className="blog-main">
        <section className="blog-hero" ref={heroRef}>
          <div className="hero-viz">
            <HeroChart visible={heroVisible} />
          </div>
          <div className="hero-copy">
            <ArticleMeta
              tagClass="tag-market"
              tagEn="Market Report"
              tagEs="Reporte de Mercado"
              timeEn="4 min read"
              timeEs="4 min de lectura"
            />
            <h1
              className="hero-title"
              data-en="Remote hiring in LatAm is up 38% YoY — here's where the jobs are going"
              data-es="La contratación remota en LatAm subió 38% interanual — aquí es donde se están moviendo los empleos"
            >
              Remote hiring in LatAm is up 38% YoY — here's where the jobs are going
            </h1>
            <p
              className="blog-excerpt"
              data-en="AI, data, and DevOps roles are growing fastest. Customer success is holding steady. Here's what the numbers say about where LatAm talent is winning globally."
              data-es="Los roles de IA, datos y DevOps crecen más rápido. Customer Success se mantiene estable. Esto dicen los datos sobre dónde el talento de LatAm está ganando a nivel global."
            >
              AI, data, and DevOps roles are growing fastest. Customer success is holding steady.
              Here's what the numbers say about where LatAm talent is winning globally.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read report →" data-es="Leer reporte →">
              Read report →
            </a>
          </div>
        </section>

        <section className="story-row reverse" ref={peopleRef}>
          <div className="story-copy border-orange">
            <ArticleMeta
              tagClass="tag-people"
              tagEn="People"
              tagEs="Personas"
              timeEn="6 min read"
              timeEs="6 min de lectura"
            />
            <h2
              className="story-title"
              data-en="From Bogotá agency work to a $90K remote role — Andrés's story"
              data-es="De una agencia en Bogotá a un rol remoto de $90K — la historia de Andrés"
            >
              From Bogotá agency work to a $90K remote role — Andrés&apos;s story
            </h2>
            <p
              className="blog-excerpt"
              data-en="After three years at a local digital agency, Andrés spent six months applying to remote roles. Here's what finally worked — and what he'd do differently."
              data-es="Después de tres años en una agencia digital local, Andrés pasó seis meses aplicando a roles remotos. Esto fue lo que por fin funcionó — y lo que haría distinto."
            >
              After three years at a local digital agency, Andrés spent six months applying to remote
              roles. Here&apos;s what finally worked — and what he&apos;d do differently.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read article →" data-es="Leer artículo →">
              Read article →
            </a>
          </div>
          <div className="story-viz">
            <svg className="svg-fill" viewBox="0 0 700 500">
              <rect width="700" height="500" fill="#140f0e" />
              <g className={peopleVisible ? 'portrait-shape' : ''}>
                <circle cx="360" cy="180" r="90" fill="rgba(255,138,75,0.45)" />
                <polygon points="290,290 430,290 460,430 260,430" fill="rgba(216,171,45,0.35)" />
                <line x1="320" y1="170" x2="350" y2="165" stroke="#ffd29e" strokeWidth="6" />
                <line x1="370" y1="165" x2="400" y2="170" stroke="#ffd29e" strokeWidth="6" />
                <circle cx="345" cy="210" r="8" fill="#ffd29e" />
                <circle cx="385" cy="210" r="8" fill="#ffd29e" />
                <line x1="350" y1="248" x2="385" y2="248" stroke="#ff8a4b" strokeWidth="6" />
              </g>
            </svg>
            <div className="viz-overlay-word" data-en="PEOPLE" data-es="GENTE">
              PEOPLE
            </div>
          </div>
        </section>

        <section className="story-row" ref={salaryRef}>
          <div className="story-viz">
            <svg className="svg-fill" viewBox="0 0 700 500">
              <rect width="700" height="500" fill="#13120c" />
              <rect x="120" y="170" width="320" height="30" fill="rgba(255,75,40,0.45)" />
              <rect x="120" y="250" width="420" height="30" fill="rgba(15,163,154,0.6)" />
              <line x1="460" y1="184" x2="560" y2="264" stroke="#f2e9d5" strokeWidth="3" />
              <polygon points="552,250 580,273 545,278" fill="#f2e9d5" />
              <text x="120" y="160" fill="#ff8a4b" fontFamily="IBM Plex Mono" fontSize="16">
                Offer: ${offer.toLocaleString()}
              </text>
              <text x="120" y="240" fill="#0fa39a" fontFamily="IBM Plex Mono" fontSize="16">
                Counter: ${counter.toLocaleString()}
              </text>
            </svg>
            <div className="viz-overlay-word" data-en="NEGOTIATE" data-es="NEGOCIAR">
              NEGOTIATE
            </div>
          </div>
          <div className="story-copy border-amber">
            <ArticleMeta
              tagClass="tag-skill"
              tagEn="Skill Guide"
              tagEs="Guía de Habilidades"
              timeEn="5 min read"
              timeEs="5 min de lectura"
            />
            <h2
              className="story-title"
              data-en="The LatAm engineer's guide to negotiating in USD"
              data-es="Guía para ingenieros de LatAm para negociar en USD"
            >
              The LatAm engineer&apos;s guide to negotiating in USD
            </h2>
            <p
              className="blog-excerpt"
              data-en="Most LatAm engineers undervalue themselves when applying to US companies. Here's a framework for anchoring, countering, and closing at the number you deserve."
              data-es="La mayoría de los ingenieros de LatAm se subvaloran al aplicar a empresas de EE. UU. Aquí tienes un marco para anclar, contraofertar y cerrar en el número que mereces."
            >
              Most LatAm engineers undervalue themselves when applying to US companies. Here&apos;s a
              framework for anchoring, countering, and closing at the number you deserve.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read article →" data-es="Leer artículo →">
              Read article →
            </a>
          </div>
        </section>

        <div className="subscribe-nudge">
          <div
            className="subscribe-copy"
            data-en="📬 Roles like this, weekly in your inbox —"
            data-es="📬 Roles como este, cada semana en tu inbox —"
          >
            📬 Roles like this, weekly in your inbox —
          </div>
          <form
            className="email-form"
            onSubmit={(event) => handleInlineSubscribe(event, { value: email, set: setEmail })}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
              required
            />
            <button type="submit">{status || (lang === 'es' ? 'Suscribirme →' : 'Subscribe free →')}</button>
          </form>
        </div>

        <section className="story-row reverse" ref={radarRef}>
          <div className="story-copy border-teal">
            <ArticleMeta
              tagClass="tag-company"
              tagEn="Company Spotlight"
              tagEs="Company Spotlight"
              timeEn="3 min read"
              timeEs="3 min de lectura"
            />
            <h2
              className="story-title"
              data-en="Why Clara keeps hiring from LatAm — and what they're really looking for"
              data-es="Por qué Clara sigue contratando desde LatAm — y qué están buscando realmente"
            >
              Why Clara keeps hiring from LatAm — and what they&apos;re really looking for
            </h2>
            <p
              className="blog-excerpt"
              data-en="Clara is one of the most consistent LatAm-hiring companies we track. We broke down their last 12 months of job posts to find the pattern."
              data-es="Clara es una de las empresas que contrata desde LatAm con mayor consistencia en nuestro radar. Desglosamos sus últimos 12 meses de vacantes para encontrar el patrón."
            >
              Clara is one of the most consistent LatAm-hiring companies we track. We broke down their
              last 12 months of job posts to find the pattern.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read article →" data-es="Leer artículo →">
              Read article →
            </a>
          </div>
          <div className="story-viz">
            <svg className="svg-fill" viewBox="0 0 700 500">
              <rect width="700" height="500" fill="#081014" />
              <circle cx="350" cy="250" r="160" fill="none" stroke="rgba(15,163,154,0.2)" />
              <circle cx="350" cy="250" r="120" fill="none" stroke="rgba(15,163,154,0.2)" />
              <circle cx="350" cy="250" r="80" fill="none" stroke="rgba(15,163,154,0.2)" />
              <line
                className={radarVisible ? 'sweep' : ''}
                x1="350"
                y1="250"
                x2="510"
                y2="250"
                stroke="rgba(15,163,154,0.7)"
                strokeWidth="3"
              />
              <circle cx="410" cy="210" r="6" fill="#ff4b28" />
              <circle cx="310" cy="320" r="5" fill="#ff4b28" />
              <circle cx="275" cy="180" r="4" fill="#4bc9c0" />
              <text x="82" y="50" fill="#0fa39a" fontFamily="IBM Plex Mono" fontSize="12">
                RADAR LATAM GRID
              </text>
            </svg>
            <div className="viz-overlay-word">RADAR</div>
          </div>
        </section>

        <section className="story-row" ref={neuralRef}>
          <div className="story-viz">
            <svg className="svg-fill" viewBox="0 0 700 500">
              <rect width="700" height="500" fill="#0a0f16" />
              {[
                [140, 120],
                [140, 250],
                [140, 380],
                [330, 90],
                [330, 200],
                [330, 320],
                [530, 130],
                [530, 270],
                [530, 390],
              ].map(([x, y], i) => (
                <circle
                  key={`node-${i}`}
                  className={neuralVisible ? 'node-pulse' : ''}
                  cx={x}
                  cy={y}
                  r="9"
                  fill="#0fa39a"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
              {[
                [140, 120, 330, 90],
                [140, 120, 330, 200],
                [140, 250, 330, 200],
                [140, 250, 330, 320],
                [140, 380, 330, 320],
                [330, 90, 530, 130],
                [330, 200, 530, 130],
                [330, 200, 530, 270],
                [330, 320, 530, 270],
                [330, 320, 530, 390],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={`line-${i}`}
                  className={neuralVisible ? 'pulse-line' : ''}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(15,163,154,0.45)"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="viz-overlay-word" data-en="AI" data-es="IA">
              AI
            </div>
          </div>
          <div className="story-copy border-red">
            <ArticleMeta
              tagClass="tag-industry"
              tagEn="Industry Take"
              tagEs="Análisis de Industria"
              timeEn="5 min read"
              timeEs="5 min de lectura"
            />
            <h2
              className="story-title"
              data-en="AI is not taking LatAm tech jobs — it's creating better ones"
              data-es="La IA no está quitando empleos tech en LatAm — está creando mejores"
            >
              AI is not taking LatAm tech jobs — it&apos;s creating better ones
            </h2>
            <p
              className="blog-excerpt"
              data-en="The roles being created by the AI shift are more accessible to LatAm talent than the ones being displaced. Here's the data behind that claim."
              data-es="Los roles que está creando el cambio hacia la IA son más accesibles para el talento de LatAm que los que están siendo desplazados. Aquí están los datos detrás de esa afirmación."
            >
              The roles being created by the AI shift are more accessible to LatAm talent than the ones
              being displaced. Here&apos;s the data behind that claim.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read article →" data-es="Leer artículo →">
              Read article →
            </a>
          </div>
        </section>

        <section className="story-row reverse" ref={clockRef}>
          <div className="story-copy border-orange">
            <ArticleMeta
              tagClass="tag-career"
              tagEn="Career Strategy"
              tagEs="Estrategia de Carrera"
              timeEn="3 min read"
              timeEs="3 min de lectura"
            />
            <h2
              className="story-title"
              data-en="How to position your timezone as an asset, not an apology"
              data-es="Cómo posicionar tu zona horaria como una ventaja, no como una disculpa"
            >
              How to position your timezone as an asset, not an apology
            </h2>
            <p
              className="blog-excerpt"
              data-en="Colombia, Mexico, and Argentina share 4–8 hours of overlap with US Eastern time. Most LatAm candidates apologize for it. The best ones sell it."
              data-es="Colombia, México y Argentina comparten 4–8 horas de solapamiento con el horario del este de EE. UU. La mayoría de candidatos de LatAm se disculpa por eso. Los mejores lo venden como ventaja."
            >
              Colombia, Mexico, and Argentina share 4–8 hours of overlap with US Eastern time. Most
              LatAm candidates apologize for it. The best ones sell it.
            </p>
            <div className="blog-author" data-en="Nortec Editorial · May 2026" data-es="Nortec Editorial · Mayo 2026">
              Nortec Editorial · May 2026
            </div>
            <a className="blog-read-btn" href="#" data-en="Read article →" data-es="Leer artículo →">
              Read article →
            </a>
          </div>
          <div className="story-viz">
            <svg className="svg-fill" viewBox="0 0 700 500">
              <rect width="700" height="500" fill="#0b1116" />
              <path
                d="M120 280 C190 230, 270 220, 330 250 C390 280, 480 280, 560 250"
                fill="none"
                stroke="rgba(15,163,154,0.35)"
                strokeWidth="12"
              />
              <path
                d="M330 248 C368 252, 400 260, 430 258"
                fill="none"
                stroke="rgba(255,75,40,0.8)"
                strokeWidth="14"
              />
              <circle cx="220" cy="170" r="65" fill="none" stroke="#0fa39a" />
              <line
                x1="220"
                y1="170"
                x2={220 + Math.cos((hoursAngles.bogotaAngle - 90) * (Math.PI / 180)) * 36}
                y2={170 + Math.sin((hoursAngles.bogotaAngle - 90) * (Math.PI / 180)) * 36}
                stroke="#0fa39a"
                strokeWidth="4"
              />
              <circle cx="480" cy="170" r="65" fill="none" stroke="#ff8a4b" />
              <line
                x1="480"
                y1="170"
                x2={480 + Math.cos((hoursAngles.nyAngle - 90) * (Math.PI / 180)) * 36}
                y2={170 + Math.sin((hoursAngles.nyAngle - 90) * (Math.PI / 180)) * 36}
                stroke="#ff8a4b"
                strokeWidth="4"
              />
              <text x="170" y="270" fill="#0fa39a" fontFamily="IBM Plex Mono" fontSize="14">
                Bogotá {clock.bogota}
              </text>
              <text x="430" y="270" fill="#ff8a4b" fontFamily="IBM Plex Mono" fontSize="14">
                New York {clock.ny}
              </text>
            </svg>
            <div className="viz-overlay-word" data-en="OVERLAP" data-es="SOLAPE">
              OVERLAP
            </div>
          </div>
        </section>

        <section className="blog-cta">
          <h3 data-en="These insights, plus 15 curated remote roles, every week. Free." data-es="Estos insights, más 15 roles remotos curados, cada semana. Gratis.">
            These insights, plus 15 curated remote roles, every week. Free.
          </h3>
          <form
            className="email-form"
            onSubmit={(event) => handleInlineSubscribe(event, { value: ctaEmail, set: setCtaEmail })}
          >
            <input
              type="email"
              value={ctaEmail}
              onChange={(event) => setCtaEmail(event.target.value)}
              placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
              required
            />
            <button type="submit">{status || (lang === 'es' ? 'Suscribirme →' : 'Subscribe free →')}</button>
          </form>
        </section>
      </main>
    </div>
  );
}

