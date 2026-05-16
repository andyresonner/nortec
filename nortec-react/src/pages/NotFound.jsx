import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentLanguage } from '../utils/i18n';
import PageMeta from '../components/PageMeta';

export default function NotFound() {
  const navigate = useNavigate();
  const [lang] = useState(getCurrentLanguage());
  const isEs = lang === 'es';
  const [count, setCount] = useState(3);
  const [line2Visible, setLine2Visible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLine2Visible(true), 900);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!line2Visible) return;
    if (count <= 0) {
      navigate('/');
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, line2Visible, navigate]);

  return (
    <>
      <PageMeta title="404 — Signal Lost · Nortec" path="/404" />
      <div style={styles.page}>
        <div style={styles.content}>
          <div style={styles.code}>404</div>
          <div style={styles.headline}>
            {isEs ? 'SEÑAL PERDIDA.' : 'SIGNAL LOST.'}
          </div>
          <div style={styles.subline}>
            {isEs
              ? 'Esta página no existe — pero tu próximo rol remoto sí.'
              : "This page doesn't exist — but your next remote role does."}
          </div>

          <div style={styles.terminal}>
            <div style={styles.termLine}>
              <span style={styles.prompt}>&gt;</span>
              <span style={styles.termText}> ERROR: route not found</span>
            </div>
            {line2Visible && (
              <div style={styles.termLine}>
                <span style={styles.prompt}>&gt;</span>
                <span style={styles.termText}>
                  {' '}
                  {isEs ? 'Redirigiendo a base' : 'Redirecting to base'}
                  {'...'}
                  <span style={styles.countdown}> {count}</span>
                </span>
              </div>
            )}
            <span style={styles.cursor}>█</span>
          </div>

          <div style={styles.buttons}>
            <Link to="/" style={styles.btnPrimary}>← {isEs ? 'Volver al inicio' : 'Back to home'}</Link>
            <Link to="/jobs" style={styles.btnSecondary}>{isEs ? 'Ver empleos →' : 'Browse jobs →'}</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0A1A1C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
  },
  content: {
    textAlign: 'center',
    maxWidth: '640px',
    width: '100%',
  },
  code: {
    fontFamily: 'var(--font-display, "Oswald", "Arial Narrow", Arial, sans-serif)',
    fontSize: 'clamp(6rem, 20vw, 10rem)',
    fontWeight: 700,
    color: '#0FA39A',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  headline: {
    fontFamily: 'var(--font-display, "Oswald", "Arial Narrow", Arial, sans-serif)',
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 700,
    color: '#F2E9D5',
    letterSpacing: '0.08em',
    marginTop: '0.5rem',
  },
  subline: {
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '1rem',
    color: '#F2E9D5',
    opacity: 0.65,
    marginTop: '1rem',
    lineHeight: 1.6,
  },
  terminal: {
    background: '#0d2225',
    border: '1px solid #0FA39A',
    borderRadius: '4px',
    padding: '1.25rem 1.5rem',
    marginTop: '2rem',
    textAlign: 'left',
    minHeight: '72px',
  },
  termLine: {
    display: 'flex',
    gap: '0.25rem',
    lineHeight: 1.7,
  },
  prompt: {
    color: '#0FA39A',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '0.9rem',
  },
  termText: {
    color: '#F2E9D5',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '0.9rem',
    opacity: 0.85,
  },
  countdown: {
    color: '#0FA39A',
    fontWeight: 700,
  },
  cursor: {
    color: '#0FA39A',
    animation: 'blink 1s step-end infinite',
    fontSize: '0.9rem',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: '#0FA39A',
    color: '#0A1A1C',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontWeight: 700,
    fontSize: '0.9rem',
    textDecoration: 'none',
    borderRadius: '2px',
    letterSpacing: '0.03em',
  },
  btnSecondary: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    color: '#F2E9D5',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontWeight: 400,
    fontSize: '0.9rem',
    textDecoration: 'none',
    border: '1px solid rgba(242,233,213,0.3)',
    borderRadius: '2px',
    letterSpacing: '0.03em',
  },
};
