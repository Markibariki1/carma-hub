import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProspectPage } from '@/components/prospect/ProspectPage';
import { getProspect, prospectTokens } from '@/lib/prospects';

// Private drafts: only the listed tokens exist, and each page is re-checked daily so it
// disappears once its link has expired.
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  const tokens = prospectTokens();
  // Next needs at least one entry to build the route; this one never resolves to a page.
  return tokens.length ? tokens.map((token) => ({ token })) : [{ token: '_' }];
}

export async function generateMetadata({ params }: PageProps<'/fuer/[token]'>): Promise<Metadata> {
  const p = getProspect((await params).token);
  return {
    title: p ? `Entwurf für ${p.business} – Carma` : 'Carma',
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
  };
}

export default async function Page({ params }: PageProps<'/fuer/[token]'>) {
  const p = getProspect((await params).token);
  if (!p) notFound();
  return <ProspectPage p={p} />;
}
