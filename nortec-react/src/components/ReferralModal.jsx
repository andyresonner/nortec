import { useEffect, useRef, useState } from 'react';
import { getCurrentLanguage } from '../utils/i18n';

const SESSION_KEY = 'nortec-referral-shown';

const MSG_EN = "Just found Nortec — bilingual remote jobs + salary data for LatAm tech talent. Worth checking: https://nortec.vercel.app";
const MSG_ES = "Acabo de encontrar Nortec — empleos remotos + datos salariales para tech en LatAm. Vale la pena: https://nortec.vercel.app";

export default function ReferralModal() {
  const [visible, setVisible] = useState(false);
  const [copyLabel, setCopyLabel] = useState(null);
  const [lang, setLang] = useState(getCurrentLanguage());
  const dismissTimer = useRef(null);

  const isEs = lang === 'es';
  const message = isEs ? MSG_ES : MSG_EN;

  useEffect(() => {
    const onLangChange = (e) => setLang(e.detail?.lang || getCurrentLanguage());
    window.addEventListener('nortec:langchange', onLangChange);
    return () => window.removeEventListener('nortec:langchange', onLangChange);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const t = setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(true);
        // Auto-dismiss after 30s
        dismissTimer.current = setTimeout(() => setVisible(false), 30000);
      }, 1500);
      return () => clearTimeout(t);
    };

    window.addEventListener('nortec:subscribed', handler);
    return () => window.removeEventListener('nortec:subscribed', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopyLabel(isEs ? '✓ ¡Copiado!' : '✓ Copied!');
      setTimeout(() => setCopyLabel(null), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyLabel(isEs ? '✓ ¡Copiado!' : '✓ Copied!');
      setTimeout(() => setCopyLabel(null), 2000);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  if (!visible) return null;

  return (
    <div style={styles.backdrop} onClick={(e) => e.target === e.currentTarget && dismiss()}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Referral">
        <h2 style={styles.heading}>
          {isEs ? 'Ya estás dentro. Trae a un amigo.' : "You're in. Now bring a friend."}
        </h2>
        <p style={styles.body}>
          {isEs
            ? 'Comparte Nortec con alguien en tech — cuanto más talento LatAm se une, mejores son los datos para todos.'
            : 'Share Nortec with someone in tech — the more LatAm talent joins, the better the data gets for everyone.'}
        </p>

        <div style={styles.msgBox}>
          <p style={styles.msgText}>{message}</p>
        </div>

        <div style={styles.actions}>
          <button style={styles.copyBtn} onClick={copy}>
            {copyLabel || (isEs ? 'Copiar mensaje →' : 'Copy message →')}
          </button>
          <button style={styles.waBtn} onClick={shareWhatsApp}>
            <WhatsAppIcon />
            WhatsApp
          </button>
        </div>

        <button style={styles.dismissBtn} onClick={dismiss}>
          {isEs ? 'Quizás después' : 'Maybe later'}
        </button>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,26,28,0.75)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 8000,
    padding: '0',
  },
  modal: {
    background: '#0d2225',
    border: '1px solid #0FA39A',
    borderRadius: '6px 6px 0 0',
    padding: '2rem',
    width: '100%',
    maxWidth: '560px',
    // On desktop, center vertically
    '@media (min-width: 640px)': {
      borderRadius: '6px',
      margin: 'auto',
    },
  },
  heading: {
    fontFamily: 'var(--font-display, "Oswald", Arial, sans-serif)',
    fontWeight: 700,
    fontSize: '1.4rem',
    color: '#F2E9D5',
    margin: '0 0 0.75rem',
    letterSpacing: '0.03em',
  },
  body: {
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '0.85rem',
    color: '#F2E9D5',
    opacity: 0.75,
    lineHeight: 1.6,
    margin: '0 0 1.25rem',
  },
  msgBox: {
    background: '#0A1A1C',
    border: '1px solid rgba(15,163,154,0.35)',
    borderRadius: '3px',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem',
  },
  msgText: {
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '0.82rem',
    color: '#F2E9D5',
    opacity: 0.85,
    margin: 0,
    lineHeight: 1.55,
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  copyBtn: {
    flex: 1,
    padding: '0.7rem 1rem',
    background: '#0FA39A',
    color: '#0A1A1C',
    border: 'none',
    borderRadius: '3px',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    minWidth: '140px',
  },
  waBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.7rem 1rem',
    background: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    minWidth: '140px',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#F2E9D5',
    opacity: 0.45,
    fontFamily: 'var(--font-mono, "Courier New", monospace)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
};
