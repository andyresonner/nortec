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
import RemoteHiring from './pages/blog/RemoteHiring';
import AndresStory from './pages/blog/AndresStory';
import SalaryNegotiation from './pages/blog/SalaryNegotiation';
import ClaraSpotlight from './pages/blog/ClaraSpotlight';
import AILatamJobs from './pages/blog/AILatamJobs';
import TimezoneStrategy from './pages/blog/TimezoneStrategy';
import { initI18n, refreshI18n } from './utils/i18n';

function RouterBody() {
  const location = useLocation();
  const showFooter = location.pathname === '/blog' || location.pathname.startsWith('/blog/');

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
        <Route path="/blog/remote-hiring-latam" element={<RemoteHiring />} />
        <Route path="/blog/andres-story" element={<AndresStory />} />
        <Route path="/blog/salary-negotiation" element={<SalaryNegotiation />} />
        <Route path="/blog/clara-spotlight" element={<ClaraSpotlight />} />
        <Route path="/blog/ai-latam-jobs" element={<AILatamJobs />} />
        <Route path="/blog/timezone-strategy" element={<TimezoneStrategy />} />
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
