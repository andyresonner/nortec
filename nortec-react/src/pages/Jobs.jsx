import LegacyFrame from '../components/LegacyFrame';
import PageMeta from '../components/PageMeta';

export default function Jobs() {
  return (
    <>
      <PageMeta
        title="Remote Jobs for LatAm Tech — Nortec"
        description="Verified remote AI + tech roles open to Latin America. Curated weekly with salary estimates and Nortec Score."
        path="/jobs"
      />
      <LegacyFrame src="/pages/jobs.html" />
    </>
  );
}
