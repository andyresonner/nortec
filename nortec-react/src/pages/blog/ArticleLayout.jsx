import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentLanguage } from '../../utils/i18n';
import { submitEmail } from '../../utils/subscribe';
import './article.css';

export default function ArticleLayout({
  title,
  titleEs,
  readTime,
  readTimeEs,
  author,
  authorEs,
  lede,
  ledeEs,
  heroVisual,
  sections,
  pullQuote,
  pullQuoteEs,
  dataValue,
  dataLabel,
  dataLabelEs,
  moreLinks,
}) {
  const lang = getCurrentLanguage();
  const [copyState, setCopyState] = useState('');
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState('');

  const isEs = lang === 'es';

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState(isEs ? 'Copiado' : 'Copied');
      setTimeout(() => setCopyState(''), 1800);
    } catch {
      setCopyState(isEs ? 'No se pudo copiar' : 'Copy failed');
      setTimeout(() => setCopyState(''), 1800);
    }
  };

  const onSubscribe = async (event) => {
    event.preventDefault();
    const result = await submitEmail(email, 'article-inline');
    if (result.ok) {
      setSubState(isEs ? '✓ Listo' : '✓ Done');
      setEmail('');
    } else {
      setSubState(isEs ? 'Intentar otra vez' : 'Try again');
    }
  };

  return (
    <div className="article-page">
      <article className="article-shell">
        <header className="article-hero">
          <div className="article-hero-viz">{heroVisual}</div>
          <div className="article-hero-copy">
            <div className="article-meta">
              <span className="article-pill" data-en={readTime} data-es={readTimeEs}>
                {readTime}
              </span>
              <span className="article-pill" data-en={author} data-es={authorEs}>
                {author}
              </span>
            </div>
            <h1 className="article-title" data-en={title} data-es={titleEs}>
              {title}
            </h1>
            <p className="article-lede" data-en={lede} data-es={ledeEs}>
              {lede}
            </p>
          </div>
        </header>

        <div className="article-content">
          {sections.map((section) => (
            <section className="article-section" key={section.heading}>
              <h2 data-en={section.heading} data-es={section.headingEs}>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, idx) => (
                <p key={`${section.heading}-${idx}`} data-en={paragraph.en} data-es={paragraph.es}>
                  {paragraph.en}
                </p>
              ))}
            </section>
          ))}

          <blockquote className="pull-quote">
            <p data-en={pullQuote} data-es={pullQuoteEs}>
              {pullQuote}
            </p>
          </blockquote>

          <div className="data-callout">
            <div className="data-value">{dataValue}</div>
            <div className="data-label" data-en={dataLabel} data-es={dataLabelEs}>
              {dataLabel}
            </div>
          </div>

          <div className="share-row">
            <div className="share-label" data-en="Share this" data-es="Comparte esto">
              Share this
            </div>
            <button className="share-btn" type="button" onClick={onCopyLink}>
              {copyState || (isEs ? 'Copiar enlace' : 'Copy link')}
            </button>
          </div>

          <section className="more-from">
            <h3 data-en="More from Nortec" data-es="Más de Nortec">
              More from Nortec
            </h3>
            <div className="more-list">
              {moreLinks.map((link) => (
                <Link key={link.to} to={link.to} data-en={link.label} data-es={link.labelEs}>
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="article-nudge">
            <div
              className="article-nudge-copy"
              data-en="📬 Roles like this, weekly in your inbox —"
              data-es="📬 Roles como este, cada semana en tu inbox —"
            >
              📬 Roles like this, weekly in your inbox —
            </div>
            <form className="email-form" onSubmit={onSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isEs ? 'tu@email.com' : 'your@email.com'}
                required
              />
              <button type="submit">{subState || (isEs ? 'Suscribirme →' : 'Subscribe free →')}</button>
            </form>
          </div>
        </div>
      </article>
    </div>
  );
}

