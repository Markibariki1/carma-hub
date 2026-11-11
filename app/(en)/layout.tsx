import '@fontsource-variable/familjen-grotesk';
import '../globals.css';
import { en } from '@/content/en';
import { pageMeta } from '@/lib/meta';

export { viewport } from '@/lib/meta';
export const metadata = pageMeta(en, '/en');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
