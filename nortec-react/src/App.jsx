import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Tracker from './pages/Tracker';
import Archive from './pages/Archive';
import Insights from './pages/Insights';
import Blog from './pages/Blog';
import Employers from './pages/Employers';
import Issue001 from './pages/Issue001';
import JobDetail from './pages/JobDetail';
import { initI18n, refreshI18n } from './utils/i18n';

function RouterBody() {
  const location = useLocation();
  const showFooter = location.pathname === '/blog';

  useEffect(() => {
    initI18n();
  }, []);

  useEffect(() => {
    refreshI18n();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/employers" element={<Employers />} />
        <Route path="/issue/001" element={<Issue001 />} />
        <Route path="/job" element={<JobDetail />} />
        <Route path="/sponsors" element={<Navigate to="/employers" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showFooter ? <Footer /> : null}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterBody />
    </BrowserRouter>
  );
}
