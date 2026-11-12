import type { Metadata, Viewport } from 'next';
import type { Dict } from '@/content/types';
import { site, ownerDetailsComplete } from '@/site.config';

export const viewport: Viewport = { themeColor: '#f4f5f2' };

type MetaOptions = {
  title?: string;
  description?: string;
  /** Language versions of this page. Defaults to the two home pages. */
  languages?: { en: string; de: string };
  type?: 'website' | 'article';
};

export function pageMeta(t: Dict, path: string, o: MetaOptions = {}): Metadata {
  const title = o.title ?? t.meta.title;
  const description = o.description ?? t.meta.description;
  const languages = o.languages ?? { en: '/', de: '/de' };
  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: {
      canonical: path,
      languages: { ...languages, 'x-default': languages.en },
    },
    openGraph: {
      type: o.type ?? 'website',
      url: path,
      siteName: site.name,
      title,
      description,
      locale: t.lang === 'de' ? 'de_DE' : 'en_GB',
      images: [{ url: `/og-${t.lang}.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    // Keep search engines out until the Impressum has real details.
    robots: ownerDetailsComplete ? undefined : { index: false, follow: false },
  };
}
