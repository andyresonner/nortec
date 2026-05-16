import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Only show if load takes > 200ms
    const showTimer = setTimeout(() => setVisible(true), 200);

    // Animate progress 0 → 100 over 600ms
    const start = performance.now();
    const duration = 600;
    let raf;
    const step = (now) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(step);
      } else {
        // Hold briefly then fade
        setTimeout(() => {
          setFading(true);
        }, 80);
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      clearTimeout(showTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{ ...styles.overlay, opacity: fading ? 0 : 1 }}>
      <div style={styles.wordmarkWrap}>
        <div style={styles.wordmark}>
          <span style={styles.norte}>NORTE</span>
          <span style={styles.c}>C</span>
        </div>
        <div style={styles.scanLineTrack}>
          <div
            style={{
              ...styles.scanLine,
              left: `${(progress / 100) * 100}%`,
            }}
          />
        </div>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0A1A1C',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'opacity 0.3s ease',
  },
  wordmarkWrap: {
    position: 'relative',
    overflow: 'hidden',
    padding: '0.25rem 0',
  },
  wordmark: {
    fontFamily: 'var(--font-display, "Oswald", "Arial Narrow", Arial, sans-serif)',
    fontWeight: 700,
    fontSize: 'clamp(3rem, 10vw, 5rem)',
    letterSpacing: '0.05em',
    userSelect: 'none',
  },
  norte: {
    color: '#F2E9D5',
  },
  c: {
    color: '#0FA39A',
  },
  scanLineTrack: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'rgba(15,163,154,0.6)',
    boxShadow: '0 0 12px 4px rgba(15,163,154,0.4)',
    transform: 'translateX(-50%)',
    transition: 'left 0.05s linear',
  },
  progressTrack: {
    marginTop: '2rem',
    width: '200px',
    height: '2px',
    background: 'rgba(15,163,154,0.2)',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: '#0FA39A',
    borderRadius: '1px',
    transition: 'width 0.05s linear',
  },
};
