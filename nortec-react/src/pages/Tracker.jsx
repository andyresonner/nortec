import LegacyFrame from '../components/LegacyFrame';
import PageMeta from '../components/PageMeta';

export default function Tracker() {
  return (
    <>
      <PageMeta
        title="LatAm Remote Job Tracker — Nortec"
        description="Track companies hiring LatAm talent, market trends, and salary signals. Updated weekly."
        path="/tracker"
      />
      <LegacyFrame src="/pages/tracker.html" />
    </>
  );
}
