import type { Metadata, Viewport } from 'next';
import type { Dict } from '@/content/types';
import { site, ownerDetailsComplete } from '@/site.config';

export const viewport: Viewport = { themeColor: '#f4f5f2' };

export function pageMeta(t: Dict, path: string): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { en: '/', de: '/de', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      locale: t.lang === 'de' ? 'de_DE' : 'en_GB',
      images: [{ url: '/work/shang-after-1800.webp', width: 1800, height: 1125 }],
    },
    // Keep search engines out until the Impressum has real details.
    robots: ownerDetailsComplete ? undefined : { index: false, follow: false },
  };
}
