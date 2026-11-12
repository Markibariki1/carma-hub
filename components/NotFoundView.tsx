import Link from 'next/link';

/** Shared 404 body. Bilingual, because an unknown address doesn't tell us the language. */
export function NotFoundView() {
  return (
    <main id="main" className="notfound">
      <div className="wrap">
        <Link href="/" className="wordmark notfound__mark">
          Carma
        </Link>
        <p className="notfound__code" aria-hidden="true">
          404
        </p>
        <div className="notfound__cols">
          <div lang="en">
            <h1 className="notfound__title">This page doesn’t exist.</h1>
            <p>The address may be old or mistyped.</p>
            <Link className="btn btn--primary" href="/?lang=en">
              Go to the home page
            </Link>
          </div>
          <div lang="de">
            <p className="notfound__title">Diese Seite gibt es nicht.</p>
            <p>Vielleicht ist die Adresse alt oder vertippt.</p>
            <Link className="btn btn--ghost" href="/de">
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
