import { useEffect, useRef, useState } from 'react';
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

function splitParagraph(text) {
  if (!text) return [''];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (text.length < 250 || sentences.length < 3) return [text];
  const midpoint = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, midpoint).join(' '), sentences.slice(midpoint).join(' ')];
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
  inlineVisual,
  inlineVisualInsertAfter = 1,
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
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState('');

  const heroRef = useRef(null);
  const inlineVizRef = useRef(null);
  const inlineVizVisible = useIntersectionObserver(inlineVizRef, { threshold: 0.2 });
  const heroVisible = useIntersectionObserver(heroRef, { threshold: 0.1, once: false });

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
      setShowStickyShare(top > heroHeight - 120 && !footerVisible);
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
          <div key={section.heading}>
            <section className="article-template-section">
              <Reveal delay={0}>
                <h2 data-en={section.heading} data-es={section.headingEs}>
                  {lang === 'es' ? section.headingEs : section.heading}
                </h2>
              </Reveal>
              {section.paragraphs.map((paragraph, pIdx) => (
                <div key={`${section.heading}-${pIdx}`}>
                  {Array.from({ length: Math.max(splitParagraph(paragraph.en).length, splitParagraph(paragraph.es).length) }).map(
                    (_, chunkIdx) => {
                      const enChunk = splitParagraph(paragraph.en)[chunkIdx] || splitParagraph(paragraph.en).slice(-1)[0];
                      const esChunk = splitParagraph(paragraph.es)[chunkIdx] || splitParagraph(paragraph.es).slice(-1)[0];
                      return (
                        <Reveal key={`${section.heading}-${pIdx}-${chunkIdx}`} delay={100 * (pIdx + 1 + chunkIdx)}>
                          <p data-en={enChunk} data-es={esChunk}>
                            {lang === 'es' ? esChunk : enChunk}
                          </p>
                        </Reveal>
                      );
                    }
                  )}
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

