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
        Diese Website setzt keine Cookies zu Werbe- oder Analysezwecken und lädt keine Inhalte von Drittanbietern.
        Schriftarten werden von dieser Website selbst ausgeliefert. Daten fallen beim Aufruf der Seite
        (Server-Protokolle und eine anonyme Reichweitenmessung ohne Cookies) und an, wenn Sie das Kontaktformular
        nutzen. Einzige Ausnahme ist ein kleines Cookie, das sich Ihre Sprache merkt.
      </p>

      <h2>Hosting und Server-Protokolle</h2>
      <p>
        Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, betrieben. Beim Aufruf
        verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und Browserangaben,
        um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Vercel ist unter dem EU-US Data Privacy
        Framework zertifiziert; mit Vercel besteht ein Vertrag zur Auftragsverarbeitung.
      </p>

      <h2>Sprachwahl</h2>
      <p>
        Wenn Sie die deutsche Seite aufrufen oder die Sprache wechseln, speichert die Website Ihre Wahl in einem Cookie
        („carma-lang“, Laufzeit ein Jahr), damit Sie beim nächsten Besuch die gewünschte Sprache sehen. Das Cookie
        enthält nur „de“ oder „en“ und ist für diese Funktion technisch erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
      </p>

      <h2>Anonyme Reichweitenmessung</h2>
      <p>
        Um zu sehen, welche Seiten gelesen werden und ob Anfragen ankommen, nutzen wir Vercel Web Analytics (Anbieter
        wie beim Hosting). Dabei werden keine Cookies gesetzt und keine Daten über Websites hinweg zusammengeführt.
        Erfasst werden je Aufruf: Zeitpunkt, aufgerufene Seite, verweisende Seite, ungefährer Standort (Land, Region,
        Stadt), Betriebssystem, Browser und Gerätetyp, außerdem das Antippen einzelner Schaltflächen (z. B.
        „Anrufen“ oder „Anfrage senden“). Besuche werden über einen Hash aus der Anfrage unterschieden, der nach 24
        Stunden verworfen wird; IP-Adressen werden dafür nicht gespeichert. Wir sehen nur zusammengefasste Zahlen.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, die Website zu verbessern).
      </p>

      <h2>Persönliche Entwürfe</h2>
      <p>
        Betrieben, die ausdrücklich zugestimmt haben, schicken wir manchmal einen kostenlosen Entwurf unter einem
        persönlichen Link (/fuer/…). Dafür verwenden wir öffentlich sichtbare Inhalte ihrer bisherigen Website
        (Name, Texte, Logo, Bilder, Farben, Telefonnummer). Die Seite ist nur über den Link erreichbar, wird nicht
        von Suchmaschinen erfasst und nach 30 Tagen samt der verwendeten Bilder gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a bzw. b
        DSGVO. Wenn Sie möchten, dass wir einen Entwurf früher entfernen, genügt eine kurze Nachricht.
      </p>

      <h2>Kontaktformular</h2>
      <p>
        Wenn Sie das Formular nutzen, verarbeiten wir Ihre Angaben (Name, E-Mail, Nachricht sowie freiwillig Betrieb,
        Website und Telefon), um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
        (vorvertragliche Maßnahmen) bzw. lit. f (berechtigtes Interesse an der Beantwortung von Anfragen).
      </p>
      <p>
        Die Nachricht wird über den E-Mail-Dienst Resend (Resend, Inc., 2261 Market Street #5039, San Francisco, CA
        94114, USA) an unser Postfach zugestellt. Resend ist unter dem EU-US Data Privacy Framework zertifiziert. Wir
        löschen Anfragen, wenn sie erledigt sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
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
      <p>Schreiben Sie uns dazu einfach an {o.email}.</p>

      <p>Stand: November 2026</p>
    </LegalPage>
  );
}
