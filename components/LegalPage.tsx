import { Header, Footer } from './Chrome';
import { de } from '@/content/de';
import { ownerDetailsComplete } from '@/site.config';

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Header t={de} home="/" />
      <main id="main" className="legal">
        <div className="wrap">
          <div className="legal__inner">
            <h1>{title}</h1>
            {!ownerDetailsComplete && (
              <p className="legal__note">Entwurf: Die Angaben in eckigen Klammern werden vor dem Start ergänzt.</p>
            )}
            {children}
          </div>
        </div>
      </main>
      <Footer t={de} />
    </>
  );
}
