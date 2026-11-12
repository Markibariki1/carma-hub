import type { MetadataRoute } from 'next';
import { site } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const languages = { en: u('/'), de: u('/de') };
  return [
    { url: u('/'), alternates: { languages } },
    { url: u('/de'), alternates: { languages } },
    { url: u('/impressum') },
    { url: u('/datenschutz') },
  ];
}
