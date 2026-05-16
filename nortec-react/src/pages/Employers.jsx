import LegacyFrame from '../components/LegacyFrame';
import PageMeta from '../components/PageMeta';

export default function Employers() {
  return (
    <>
      <PageMeta
        title="Hire LatAm Tech Talent — Nortec"
        description="Reach developers, engineers, and AI professionals actively seeking global remote work."
        path="/employers"
      />
      <LegacyFrame src="/pages/employers.html" />
    </>
  );
}
