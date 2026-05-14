import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentLanguage } from '../../utils/i18n';
import { submitEmail } from '../../utils/subscribe';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './article-template.css';

function Reveal({ children, delay = 0, left = false, className = '' }) {
  const ref = useRef(null);
  const visible = useIntersectionObserver(ref, { threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={`${left ? 'reveal-left' : 'reveal-up'} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function DataCounter({ prefix = '', suffix = '', target = 0, label, labelEs, lang }) {
  const ref = useRef(null);
  const visible = useIntersectionObserver(ref, { threshold: 0.25 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 1500;
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, visible]);

  return (
    <div ref={ref} className={`article-data-callout ${visible ? 'is-on' : ''}`}>
      <div className="article-data-value">{`${prefix}${value}${suffix}`}</div>
      <div className="article-data-label" data-en={label} data-es={labelEs}>
        {lang === 'es' ? labelEs : label}
      </div>
    </div>
  );
}

function splitParagraph(text, maxSentences = 3) {
  if (!text) return [''];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= maxSentences) return [text];
  const chunks = [];
  for (let i = 0; i < sentences.length; i += maxSentences) {
    chunks.push(sentences.slice(i, i + maxSentences).join(' '));
  }
  return chunks;
}

function buildFloatingStatMap(items = []) {
  const map = new Map();
  items.forEach((item) => {
    const key = `${item.sectionIndex}-${item.paragraphIndex}`;
    const current = map.get(key) || [];
    current.push(item);
    map.set(key, current);
  });
  return map;
}

function SectionIcon({ index }) {
  const icons = [
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 L20 12 L12 21 L4 12 Z" fill="none" stroke="#0fa39a" strokeWidth="1.6" />
        <path d="M12 7 L14.5 12 L12 17 L9.5 12 Z" fill="#0fa39a" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 16 C7 13, 9 13, 12 16 C15 19, 17 19, 20 16" fill="none" stroke="#0fa39a" strokeWidth="1.7" />
        <path d="M6 11 C8.3 9.3, 10 9.3, 12 11 C14 12.7, 15.7 12.7, 18 11" fill="none" stroke="#0fa39a" strokeWidth="1.5" />
        <circle cx="12" cy="8" r="1.6" fill="#0fa39a" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 C8.9 4 6.4 6.5 6.4 9.6 C6.4 13.6 12 20 12 20 C12 20 17.6 13.6 17.6 9.6 C17.6 6.5 15.1 4 12 4 Z" fill="none" stroke="#0fa39a" strokeWidth="1.6" />
        <circle cx="12" cy="9.7" r="2" fill="#0fa39a" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18 L18 6" stroke="#0fa39a" strokeWidth="1.8" />
        <path d="M12 6 H18 V12" fill="none" stroke="#0fa39a" strokeWidth="1.8" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 3 }).map((__, col) => (
            <circle key={`${row}-${col}`} cx={6 + col * 6} cy={6 + row * 6} r="1.2" fill="#0fa39a" />
          ))
        )}
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12 H20" stroke="#0fa39a" strokeWidth="1.6" />
        <path d="M12 4 V20" stroke="#0fa39a" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="#0fa39a" strokeWidth="1.4" />
      </svg>
    ),
  ];

  return <span className="article-section-icon">{icons[index % icons.length]}</span>;
}

export default function ArticleTemplate({
  title,
  titleEs,
  readTime,
  readTimeEs,
  standfirst,
  standfirstEs,
  heroVisual,
  sections,
  takeaways,
  inlineVisual,
  inlineVisualInsertAfter = 1,
  secondaryVisual,
  secondaryVisualInsertAfter = 3,
  floatingStats,
  pullQuote,
  pullQuoteEs,
  dataCallout,
  moreFrom,
}) {
  const [lang, setLang] = useState(getCurrentLanguage());
  const [progress, setProgress] = useState(0);
  const [heroScroll, setHeroScroll] = useState(0);
  const [copyState, setCopyState] = useState('');
  const [showStickyShare, setShowStickyShare] = useState(false);
  const [showMobileShare, setShowMobileShare] = useState(false);
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState('');

  const heroRef = useRef(null);
  const inlineVizRef = useRef(null);
  const secondaryVizRef = useRef(null);
  const inlineVizVisible = useIntersectionObserver(inlineVizRef, { threshold: 0.2 });
  const secondaryVizVisible = useIntersectionObserver(secondaryVizRef, { threshold: 0.2 });
  const heroVisible = useIntersectionObserver(heroRef, { threshold: 0.1, once: false });
  const floatingStatsMap = useMemo(() => buildFloatingStatMap(floatingStats), [floatingStats]);

  useEffect(() => {
    const handler = (event) => setLang(event.detail?.lang || getCurrentLanguage());
    window.addEventListener('nortec:langchange', handler);
    return () => window.removeEventListener('nortec:langchange', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop || 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (top / max) * 100 : 0);
      const hero = heroRef.current;
      if (hero) {
        const relative = Math.max(0, Math.min(hero.offsetHeight, top - hero.offsetTop));
        setHeroScroll(relative);
      }

      const heroHeight = heroRef.current?.offsetHeight || 0;
      const footer = document.querySelector('footer');
      const footerVisible = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      const canShowShare = top > heroHeight - 120 && !footerVisible;
      setShowStickyShare(canShowShare);
      setShowMobileShare(canShowShare);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState(lang === 'es' ? 'Copiado' : 'Copied');
      setTimeout(() => setCopyState(''), 1600);
    } catch {
      setCopyState(lang === 'es' ? 'Error' : 'Failed');
      setTimeout(() => setCopyState(''), 1600);
    }
  };

  const onSubscribe = async (event) => {
    event.preventDefault();
    const result = await submitEmail(email, 'article-bottom-cta');
    if (result.ok) {
      setSubState(lang === 'es' ? '✓ Listo' : '✓ Done');
      setEmail('');
    } else {
      setSubState(lang === 'es' ? 'Intentar otra vez' : 'Try again');
    }
  };

  return (
    <div className="article-template-page">
      <div className="reading-progress">
        <div className="reading-progress-fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>

      <div className={`article-sticky-share ${showStickyShare ? 'is-visible' : ''}`}>
        <div className="article-share-label" data-en="Share" data-es="Compartir">
          {lang === 'es' ? 'Compartir' : 'Share'}
        </div>
        <button className="article-share-btn" type="button" onClick={onCopy}>
          {copyState || (lang === 'es' ? 'Copiar enlace' : 'Copy link')}
        </button>
      </div>

      <div className={`article-mobile-share ${showMobileShare ? 'is-visible' : ''}`}>
        <div className="article-share-label" data-en="Share" data-es="Compartir">
          {lang === 'es' ? 'Compartir' : 'Share'}
        </div>
        <button className="article-share-btn" type="button" onClick={onCopy}>
          {copyState || (lang === 'es' ? 'Copiar enlace' : 'Copy link')}
        </button>
      </div>

      <header className="article-template-hero" ref={heroRef}>
        <div
          className="article-template-hero-visual"
          style={{ transform: `translateY(${Math.round(heroScroll * 0.3)}px)` }}
        >
          {typeof heroVisual === 'function' ? heroVisual({ visible: heroVisible, lang }) : heroVisual}
        </div>
        <div
          className="article-template-hero-copy"
          style={{ transform: `translateY(${Math.round(heroScroll * 0.7)}px)` }}
        >
          <span className="article-template-read-pill" data-en={readTime} data-es={readTimeEs}>
            {lang === 'es' ? readTimeEs : readTime}
          </span>
          <h1 className="article-template-title" data-en={title} data-es={titleEs}>
            {lang === 'es' ? titleEs : title}
          </h1>
          <p className="article-template-standfirst" data-en={standfirst} data-es={standfirstEs}>
            {lang === 'es' ? standfirstEs : standfirst}
          </p>
        </div>
      </header>

      <article className="article-template-body">
        {sections.map((section, index) => (
          <div key={section.heading} className={`article-section-block ${index % 2 === 0 ? 'tone-base' : 'tone-alt'}`}>
            <section className="article-template-section">
              <Reveal delay={0}>
                <div className="article-section-heading">
                  <SectionIcon index={index} />
                  <h2 data-en={section.heading} data-es={section.headingEs}>
                    {lang === 'es' ? section.headingEs : section.heading}
                  </h2>
                </div>
              </Reveal>
              {section.paragraphs.map((paragraph, pIdx) => (
                <div key={`${section.heading}-${pIdx}`}>
                  {Array.from({
                    length: Math.max(splitParagraph(paragraph.en).length, splitParagraph(paragraph.es).length),
                  }).map((_, chunkIdx) => {
                    const enChunks = splitParagraph(paragraph.en);
                    const esChunks = splitParagraph(paragraph.es);
                    const enChunk = enChunks[chunkIdx] || enChunks.slice(-1)[0];
                    const esChunk = esChunks[chunkIdx] || esChunks.slice(-1)[0];
                    const statCards = floatingStatsMap.get(`${index}-${pIdx}`) || [];
                    const isFirstReadableChunk = index === 0 && pIdx === 0 && chunkIdx === 0;

                    return (
                      <div key={`${section.heading}-${pIdx}-${chunkIdx}`}>
                        {chunkIdx === 0 &&
                          statCards.map((stat, statIdx) => (
                            <Reveal key={`${section.heading}-${pIdx}-stat-${statIdx}`} className="float-stat-wrap" delay={120}>
                              <aside className="float-stat-card">
                                <div className="float-stat-value" data-en={stat.value} data-es={stat.valueEs || stat.value}>
                                  {lang === 'es' ? stat.valueEs || stat.value : stat.value}
                                </div>
                                <div className="float-stat-label" data-en={stat.label} data-es={stat.labelEs}>
                                  {lang === 'es' ? stat.labelEs : stat.label}
                                </div>
                              </aside>
                            </Reveal>
                          ))}

                        <Reveal key={`${section.heading}-${pIdx}-${chunkIdx}-paragraph`} delay={100 * (pIdx + 1 + chunkIdx)}>
                          <p data-en={enChunk} data-es={esChunk}>
                            {lang === 'es' ? esChunk : enChunk}
                          </p>
                        </Reveal>

                        {isFirstReadableChunk && takeaways ? (
                          <Reveal className="article-takeaways-wrap" delay={100}>
                            <aside className="article-takeaways">
                              <div className="article-takeaways-title" data-en="Key takeaways" data-es="Puntos clave">
                                {lang === 'es' ? 'Puntos clave' : 'Key takeaways'}
                              </div>
                              <ul>
                                {takeaways.items.map((item, itemIdx) => (
                                  <li key={`takeaway-${itemIdx}`} data-en={item.en} data-es={item.es}>
                                    {lang === 'es' ? item.es : item.en}
                                  </li>
                                ))}
                              </ul>
                            </aside>
                          </Reveal>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </section>

            {index === inlineVisualInsertAfter && inlineVisual ? (
              <Reveal>
                <div ref={inlineVizRef} className="article-inline-viz">
                  {inlineVisual.render({ visible: inlineVizVisible, lang })}
                  <div className="article-inline-viz-copy">
                    <h3 data-en={inlineVisual.title} data-es={inlineVisual.titleEs}>
                      {lang === 'es' ? inlineVisual.titleEs : inlineVisual.title}
                    </h3>
                    <p data-en={inlineVisual.description} data-es={inlineVisual.descriptionEs}>
                      {lang === 'es' ? inlineVisual.descriptionEs : inlineVisual.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ) : null}

            {index === secondaryVisualInsertAfter && secondaryVisual ? (
              <Reveal>
                <div ref={secondaryVizRef} className={`article-inline-viz ${secondaryVisual.layout === 'two-column' ? 'article-inline-viz-two' : ''}`}>
                  <div className="article-inline-viz-media">{secondaryVisual.render({ visible: secondaryVizVisible, lang })}</div>
                  <div className="article-inline-viz-copy">
                    <h3 data-en={secondaryVisual.title} data-es={secondaryVisual.titleEs}>
                      {lang === 'es' ? secondaryVisual.titleEs : secondaryVisual.title}
                    </h3>
                    <p data-en={secondaryVisual.description} data-es={secondaryVisual.descriptionEs}>
                      {lang === 'es' ? secondaryVisual.descriptionEs : secondaryVisual.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ) : null}

            {index < sections.length - 1 ? <div className="article-divider" /> : null}
          </div>
        ))}

        <Reveal left>
          <blockquote className="article-pull-quote">
            <p data-en={pullQuote} data-es={pullQuoteEs}>
              {lang === 'es' ? pullQuoteEs : pullQuote}
            </p>
          </blockquote>
        </Reveal>

        <Reveal>
          <DataCounter
            prefix={dataCallout.prefix}
            suffix={dataCallout.suffix}
            target={dataCallout.target}
            label={dataCallout.label}
            labelEs={dataCallout.labelEs}
            lang={lang}
          />
        </Reveal>

        <Reveal>
          <section>
            <h2 data-en="More from Nortec" data-es="Más de Nortec">
              {lang === 'es' ? 'Más de Nortec' : 'More from Nortec'}
            </h2>
            <div className="article-more-grid">
              {moreFrom.map((item) => (
                <Link className="article-more-card" key={item.to} to={item.to}>
                  <div className={`article-more-visual ${item.theme}`} />
                  <div className="article-more-copy">
                    <h4 data-en={item.title} data-es={item.titleEs}>
                      {lang === 'es' ? item.titleEs : item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      </article>

      <section className="article-bottom-cta">
        <div className="article-template-body" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <h3
            data-en="Every week we find the remote roles actually worth applying to."
            data-es="Cada semana encontramos los roles remotos que realmente vale la pena aplicar."
          >
            {lang === 'es'
              ? 'Cada semana encontramos los roles remotos que realmente vale la pena aplicar.'
              : 'Every week we find the remote roles actually worth applying to.'}
          </h3>
          <form className="email-form" onSubmit={onSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
              required
            />
            <button type="submit">{subState || (lang === 'es' ? 'Suscribirme →' : 'Subscribe free →')}</button>
          </form>
        </div>
      </section>
    </div>
  );
}

