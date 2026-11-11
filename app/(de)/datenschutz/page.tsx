import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { site } from '@/site.config';

export const metadata: Metadata = { title: 'Datenschutz – Carma', alternates: { canonical: '/datenschutz' } };

export default function Datenschutz() {
  const o = site.owner;
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>Verantwortlicher</h2>
      <p>
        {o.fullName}, {o.street}, {o.city}. E-Mail: {o.email}. Weitere Angaben im{' '}
        <Link href="/impressum">Impressum</Link>.
      </p>

      <h2>Kurz zusammengefasst</h2>
      <p>
        Diese Website setzt keine Cookies, nutzt keine Analyse- oder Werbedienste und lädt keine Inhalte von
        Drittanbietern. Schriftarten werden von dieser Website selbst ausgeliefert. Daten fallen nur beim Aufruf der
        Seite (Server-Protokolle) und an, wenn Sie das Kontaktformular nutzen.
      </p>

      <h2>Hosting und Server-Protokolle</h2>
      <p>
        Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, betrieben. Beim Aufruf
        verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und Browserangaben,
        um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Vercel ist unter dem EU-US Data Privacy
        Framework zertifiziert; mit Vercel besteht ein Vertrag zur Auftragsverarbeitung.
      </p>

      <h2>Kontaktformular</h2>
      <p>
        Wenn Sie das Formular nutzen, verarbeite ich Ihre Angaben (Name, E-Mail, Nachricht sowie freiwillig Betrieb,
        Website und Telefon), um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
        (vorvertragliche Maßnahmen) bzw. lit. f (berechtigtes Interesse an der Beantwortung von Anfragen).
      </p>
      <p>
        Die Nachricht wird über den E-Mail-Dienst Resend (Resend, Inc., 2261 Market Street #5039, San Francisco, CA
        94114, USA) an mein Postfach zugestellt. Resend ist unter dem EU-US Data Privacy Framework zertifiziert. Ich
        lösche Anfragen, wenn sie erledigt sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
      </p>

      <h2>Ihre Rechte</h2>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 16) und Löschung (Art. 17)</li>
        <li>Einschränkung der Verarbeitung (Art. 18)</li>
        <li>Datenübertragbarkeit (Art. 20)</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21)</li>
        <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77)</li>
      </ul>
      <p>Schreiben Sie mir dazu einfach an {o.email}.</p>

      <p>Stand: November 2026</p>
    </LegalPage>
  );
}
