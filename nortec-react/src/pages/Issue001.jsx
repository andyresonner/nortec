import LegacyFrame from '../components/LegacyFrame';
import PageMeta from '../components/PageMeta';

export default function Issue001() {
  return (
    <>
      <PageMeta
        title="Nortec Issue #001 — The First Drop"
        path="/issue/001"
      />
      <LegacyFrame src="/pages/issue-001.html" />
    </>
  );
}
