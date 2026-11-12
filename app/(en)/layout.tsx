import '@fontsource-variable/familjen-grotesk';
import '../globals.css';
import { en } from '@/content/en';
import { pageMeta } from '@/lib/meta';
import { SiteAnalytics } from '@/components/SiteAnalytics';

export { viewport } from '@/lib/meta';
export const metadata = pageMeta(en, '/');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
