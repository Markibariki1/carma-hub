import { notFound } from 'next/navigation';
import { CaseStudyPage } from '@/components/CaseStudyPage';
import { cases, getCase } from '@/content/cases';
import { en } from '@/content/en';
import { pageMeta } from '@/lib/meta';
import { caseStudyHref } from '@/lib/routes';

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>) {
  const study = getCase((await params).slug);
  if (!study) return {};
  const c = study.text.en;
  return pageMeta(en, caseStudyHref('en', study.slug), {
    title: c.metaTitle,
    description: c.metaDescription,
    type: 'article',
    languages: { en: caseStudyHref('en', study.slug), de: caseStudyHref('de', study.slug) },
  });
}

export default async function Page({ params }: PageProps<'/work/[slug]'>) {
  const study = getCase((await params).slug);
  if (!study) notFound();
  return <CaseStudyPage t={en} study={study} />;
}
