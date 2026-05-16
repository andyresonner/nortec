import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://nortec.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.svg`;

export default function PageMeta({ title, description, ogImage, ogType = 'website', path = '' }) {
  const url = `${BASE_URL}${path}`;
  const image = ogImage || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
