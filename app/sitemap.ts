import type { MetadataRoute } from 'next';
import { site } from '@/site.config';
import { cases } from '@/content/cases';
import { caseStudyHref } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const languages = { en: u('/'), de: u('/de') };
  return [
    { url: u('/'), alternates: { languages } },
    { url: u('/de'), alternates: { languages } },
    ...cases.flatMap((c) => {
      const languages = { en: u(caseStudyHref('en', c.slug)), de: u(caseStudyHref('de', c.slug)) };
      return [
        { url: languages.en, alternates: { languages } },
        { url: languages.de, alternates: { languages } },
      ];
    }),
    { url: u('/impressum') },
    { url: u('/datenschutz') },
  ];
}
