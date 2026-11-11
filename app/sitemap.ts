import type { MetadataRoute } from 'next';
import { site } from '@/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u('/'), alternates: { languages: { de: u('/'), en: u('/en') } } },
    { url: u('/en'), alternates: { languages: { de: u('/'), en: u('/en') } } },
    { url: u('/impressum') },
    { url: u('/datenschutz') },
  ];
}
