import '@fontsource-variable/familjen-grotesk';
import '../globals.css';
import { de } from '@/content/de';
import { pageMeta } from '@/lib/meta';

export { viewport } from '@/lib/meta';
export const metadata = pageMeta(de, '/');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
