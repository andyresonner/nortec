import LegacyFrame from '../components/LegacyFrame';
import PageMeta from '../components/PageMeta';

export default function Insights() {
  return (
    <>
      <PageMeta
        title="Insights — Nortec"
        description="Market intelligence and career strategy for LatAm tech talent."
        path="/insights"
      />
      <LegacyFrame src="/pages/insights.html" />
    </>
  );
}
