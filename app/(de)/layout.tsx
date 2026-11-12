import '@fontsource-variable/familjen-grotesk';
import '../globals.css';
import { de } from '@/content/de';
import { pageMeta } from '@/lib/meta';
import { SiteAnalytics } from '@/components/SiteAnalytics';

export { viewport } from '@/lib/meta';
export const metadata = pageMeta(de, '/de');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
