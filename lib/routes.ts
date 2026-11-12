import type { Lang } from '@/content/types';

/** Case study URLs: /work/<slug> in English, /de/arbeiten/<slug> in German. */
export const caseStudyHref = (lang: Lang, slug: string) => (lang === 'en' ? `/work/${slug}` : `/de/arbeiten/${slug}`);
