import { notFound } from 'next/navigation';
import { CaseStudyPage } from '@/components/CaseStudyPage';
import { cases, getCase } from '@/content/cases';
import { de } from '@/content/de';
import { pageMeta } from '@/lib/meta';
import { caseStudyHref } from '@/lib/routes';

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/de/arbeiten/[slug]'>) {
  const study = getCase((await params).slug);
  if (!study) return {};
  const c = study.text.de;
  return pageMeta(de, caseStudyHref('de', study.slug), {
    title: c.metaTitle,
    description: c.metaDescription,
    type: 'article',
    languages: { en: caseStudyHref('en', study.slug), de: caseStudyHref('de', study.slug) },
  });
}

export default async function Page({ params }: PageProps<'/de/arbeiten/[slug]'>) {
  const study = getCase((await params).slug);
  if (!study) notFound();
  return <CaseStudyPage t={de} study={study} />;
}
