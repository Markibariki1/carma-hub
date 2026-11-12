import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';
import { site } from '@/site.config';

export const metadata: Metadata = { title: 'Impressum – Carma', alternates: { canonical: '/impressum' } };

export default function Impressum() {
  const o = site.owner;
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <address>
        {o.fullName}
        <br />
        Carma – Webdesign
        <br />
        {o.street}
        <br />
        {o.city}
        <br />
        {o.country}
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail: {o.email.startsWith('[') ? o.email : <a href={`mailto:${o.email}`}>{o.email}</a>}
        {o.phone && (
          <>
            <br />
            Telefon: {o.phone}
          </>
        )}
      </p>

      {o.vatId && (
        <>
          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {o.vatId}</p>
        </>
      )}

      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        {o.fullName}, Anschrift wie oben.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPage>
  );
}
