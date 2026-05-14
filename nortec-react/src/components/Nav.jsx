import { NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentLanguage, setCurrentLanguage } from '../utils/i18n';

function navClass({ isActive }) {
  return isActive ? 'active' : '';
}

export default function Nav() {
  const [lang, setLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const handler = (event) => setLang(event.detail?.lang || getCurrentLanguage());
    window.addEventListener('nortec:langchange', handler);
    return () => window.removeEventListener('nortec:langchange', handler);
  }, []);

  return (
    <nav className="nav">
      <Link className="nav-logo" to="/">
        <span>
          NORTE<span className="teal">C</span>
        </span>
        <div
          className="nav-wordmark"
          data-en="NORTHBOUND<br>TALENT."
          data-es="TALENTO<br>RUMBO AL NORTE."
          data-i18n-html="true"
        >
          NORTHBOUND
          <br />
          TALENT.
        </div>
      </Link>
      <ul className="nav-links">
        <li>
          <NavLink to="/jobs" className={navClass} data-en="Jobs" data-es="Empleos">
            Jobs
          </NavLink>
        </li>
        <li>
          <NavLink to="/tracker" className={navClass} data-en="Tracker" data-es="Tracker">
            Tracker
          </NavLink>
        </li>
        <li>
          <NavLink to="/archive" className={navClass} data-en="Archive" data-es="Archivo">
            Archive
          </NavLink>
        </li>
        <li>
          <NavLink to="/insights" className={navClass} data-en="Insights" data-es="Insights">
            Insights
          </NavLink>
        </li>
        <li>
          <NavLink to="/blog" className={navClass} data-en="Blog" data-es="Blog">
            Blog
          </NavLink>
        </li>
        <li>
          <NavLink to="/issue/001" className={navClass}>
            Issue #001
          </NavLink>
        </li>
      </ul>
      <div className="nav-actions">
        <NavLink className="btn-ghost" to="/employers" data-en="For Employers" data-es="Para Empleadores">
          For Employers
        </NavLink>
        <div className="lang-toggle" aria-label="Language toggle">
          <button
            type="button"
            data-lang-option="en"
            aria-pressed={lang === 'en'}
            className={lang === 'en' ? 'active' : ''}
            onClick={() => {
              setCurrentLanguage('en');
              setLang('en');
            }}
          >
            EN
          </button>
          <span className="slash">/</span>
          <button
            type="button"
            data-lang-option="es"
            aria-pressed={lang === 'es'}
            className={lang === 'es' ? 'active' : ''}
            onClick={() => {
              setCurrentLanguage('es');
              setLang('es');
            }}
          >
            ES
          </button>
        </div>
        <Link className="btn-primary" to="/#subscribe" data-en="Subscribe" data-es="Suscríbete">
          Subscribe
        </Link>
      </div>
    </nav>
  );
}

