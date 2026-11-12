import '@fontsource-variable/familjen-grotesk';
import './globals.css';
import type { Metadata } from 'next';
import { NotFoundView } from '@/components/NotFoundView';

export const metadata: Metadata = {
  title: 'Page not found – Carma',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundView />
      </body>
    </html>
  );
}
