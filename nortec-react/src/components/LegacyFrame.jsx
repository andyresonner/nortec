import { useEffect, useRef } from 'react';
import { getCurrentLanguage } from '../utils/i18n';

export default function LegacyFrame({ src }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return undefined;

    let resizeObserver;

    const syncFrame = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;

        const nav = doc.querySelector('nav.nav');
        if (nav) nav.style.display = 'none';

        const topPad = doc.body?.querySelector('div[style*="padding-top"]');
        if (topPad) topPad.style.display = 'none';

        if (doc.body) {
          doc.body.style.margin = '0';
          doc.body.style.paddingTop = '0';
        }

        const lang = getCurrentLanguage();
        frame.contentWindow.localStorage.setItem('nortec-language', lang);
        frame.contentWindow.dispatchEvent(
          new CustomEvent('nortec:langchange', { detail: { lang } })
        );

        const setHeight = () => {
          const height = Math.max(
            doc.body?.scrollHeight || 0,
            doc.documentElement?.scrollHeight || 0
          );
          frame.style.height = `${Math.max(height, 900)}px`;
        };

        setHeight();

        resizeObserver = new ResizeObserver(() => setHeight());
        if (doc.body) resizeObserver.observe(doc.body);

        doc.addEventListener(
          'click',
          (event) => {
            const link = event.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href') || '';
            if (!href.startsWith('/') || href.startsWith('//') || link.target === '_blank') return;
            event.preventDefault();
            window.location.href = href;
          },
          true
        );
      } catch {
        // Cross-origin safety guard (not expected here).
      }
    };

    const syncLanguage = (event) => {
      try {
        const lang = event.detail?.lang || getCurrentLanguage();
        frame.contentWindow.localStorage.setItem('nortec-language', lang);
        frame.contentWindow.dispatchEvent(
          new CustomEvent('nortec:langchange', { detail: { lang } })
        );
      } catch {
        // ignore
      }
    };

    frame.addEventListener('load', syncFrame);
    window.addEventListener('nortec:langchange', syncLanguage);
    return () => {
      frame.removeEventListener('load', syncFrame);
      window.removeEventListener('nortec:langchange', syncLanguage);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Legacy page"
      style={{
        width: '100%',
        border: 'none',
        minHeight: '900px',
        display: 'block',
        background: 'var(--bg)',
      }}
    />
  );
}

