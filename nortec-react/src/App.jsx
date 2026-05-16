import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import ReferralModal from './components/ReferralModal';
import { initI18n, refreshI18n } from './utils/i18n';

const Home             = lazy(() => import('./pages/Home'));
const Jobs             = lazy(() => import('./pages/Jobs'));
const Tracker          = lazy(() => import('./pages/Tracker'));
const Archive          = lazy(() => import('./pages/Archive'));
const Insights         = lazy(() => import('./pages/Insights'));
const Blog             = lazy(() => import('./pages/Blog'));
const Employers        = lazy(() => import('./pages/Employers'));
const Issue001         = lazy(() => import('./pages/Issue001'));
const JobDetail        = lazy(() => import('./pages/JobDetail'));
const NotFound         = lazy(() => import('./pages/NotFound'));
const RemoteHiring     = lazy(() => import('./pages/blog/RemoteHiring'));
const AndresStory      = lazy(() => import('./pages/blog/AndresStory'));
const SalaryNegotiation = lazy(() => import('./pages/blog/SalaryNegotiation'));
const ClaraSpotlight   = lazy(() => import('./pages/blog/ClaraSpotlight'));
const AILatamJobs      = lazy(() => import('./pages/blog/AILatamJobs'));
const TimezoneStrategy = lazy(() => import('./pages/blog/TimezoneStrategy'));

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                          element={<Home />} />
          <Route path="/jobs"                      element={<Jobs />} />
          <Route path="/tracker"                   element={<Tracker />} />
          <Route path="/archive"                   element={<Archive />} />
          <Route path="/insights"                  element={<Insights />} />
          <Route path="/blog"                      element={<Blog />} />
          <Route path="/blog/remote-hiring-latam"  element={<RemoteHiring />} />
          <Route path="/blog/andres-story"         element={<AndresStory />} />
          <Route path="/blog/salary-negotiation"   element={<SalaryNegotiation />} />
          <Route path="/blog/clara-spotlight"      element={<ClaraSpotlight />} />
          <Route path="/blog/ai-latam-jobs"        element={<AILatamJobs />} />
          <Route path="/blog/timezone-strategy"    element={<TimezoneStrategy />} />
          <Route path="/employers"                 element={<Employers />} />
          <Route path="/issue/001"                 element={<Issue001 />} />
          <Route path="/job"                       element={<JobDetail />} />
          <Route path="/sponsors"                  element={<Navigate to="/employers" replace />} />
          <Route path="*"                          element={<NotFound />} />
        </Routes>
      </Suspense>
      {showFooter ? <Footer /> : null}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterBody />
      <ReferralModal />
    </BrowserRouter>
  );
}
