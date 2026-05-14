import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '2rem 0' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              letterSpacing: '0.08em',
              color: 'var(--north-star)',
            }}
          >
            NORTE<span className="teal">C</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text3)',
              letterSpacing: '0.07em',
            }}
            data-en="Built in LatAm. Designed for the world."
            data-es="Hecho en LatAm. Diseñado para el mundo."
          >
            Built in LatAm. Designed for the world.
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <NavLink
            to="/jobs"
            data-en="Jobs"
            data-es="Empleos"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Jobs
          </NavLink>
          <NavLink
            to="/tracker"
            data-en="Tracker"
            data-es="Tracker"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Tracker
          </NavLink>
          <NavLink
            to="/archive"
            data-en="Archive"
            data-es="Archivo"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Archive
          </NavLink>
          <NavLink
            to="/insights"
            data-en="Insights"
            data-es="Insights"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Insights
          </NavLink>
          <NavLink
            to="/blog"
            data-en="Blog"
            data-es="Blog"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Blog
          </NavLink>
          <NavLink
            to="/employers"
            data-en="For Employers"
            data-es="Para Empleadores"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            For Employers
          </NavLink>
        </div>
      </div>
    </footer>
  );
}

