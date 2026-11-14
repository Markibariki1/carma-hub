import '@fontsource-variable/familjen-grotesk';
import '../globals.css';
import type { Metadata } from 'next';

export { viewport } from '@/lib/meta';

// Marc's own tools (not part of the public site): never indexed, no analytics.
export const metadata: Metadata = {
  title: 'Send follow-up – Carma',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  appleWebApp: { capable: true, title: 'Carma Send', statusBarStyle: 'default' },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
