import type { Metadata } from "next";
import { LegalNotice, LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Datenschutz — Prooflane",
  description: "Datenschutzhinweise zur Nutzung der Prooflane-Website und des Kundenbereichs.",
};

const sections = [
  { id: "verantwortlicher", label: "Verantwortlicher" },
  { id: "grundsaetze", label: "Grundsätze" },
  { id: "server-logs", label: "Website und Server-Logs" },
  { id: "kontakt", label: "Kontakt per E-Mail" },
  { id: "anfragen", label: "Demo- und Zugangsanfrage" },
  { id: "session-cookie", label: "Anmeldung und Session" },
  { id: "hosting", label: "Empfänger und Hosting" },
  { id: "rechte", label: "Ihre Rechte" },
  { id: "beschwerde", label: "Beschwerderecht" },
  { id: "aktualitaet", label: "Aktualität" },
] as const;

export default function DatenschutzPage() {
  return <LegalShell
    eyebrow="Rechtliches / 02"
    title="Datenschutz"
    intro="Welche personenbezogenen Daten bei Prooflane verarbeitet werden, warum das geschieht und welche Rechte Sie haben."
    updated="14. September 2026"
    sections={sections}
  >
    <LegalNotice />

    <section id="verantwortlicher">
      <h2>1. Verantwortlicher</h2>
      <address>
        [Name / Firma des Betreibers]<br />
        [Straße und Hausnummer]<br />
        [PLZ Ort], Deutschland
      </address>
      <p>E-Mail: <a href="mailto:hello@prooflane.de">hello@prooflane.de</a></p>
    </section>

    <section id="grundsaetze">
      <h2>2. Grundsätze der Verarbeitung</h2>
      <p>Wir verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung dieser Website, die Bearbeitung von Anfragen oder den Betrieb des geschützten Kundenbereichs erforderlich ist. Wir geben Daten nicht zu Werbezwecken weiter und setzen auf dieser Website derzeit keine Analyse- oder Marketingdienste ein.</p>
    </section>

    <section id="server-logs">
      <h2>3. Aufruf der Website und Server-Logs</h2>
      <p>Beim Aufruf der Website verarbeitet der technische Betreiber der Infrastruktur vorübergehend technisch erforderliche Verbindungsdaten. Dazu können insbesondere IP-Adresse, Zeitpunkt des Abrufs, aufgerufene URL, Referrer-URL, übertragene Datenmenge, Browsertyp und Betriebssystem gehören.</p>
      <p>Die Verarbeitung dient der sicheren, stabilen und fehlerfreien Bereitstellung des Angebots und erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Die Logdaten werden gelöscht, sobald sie für diesen Zweck nicht mehr erforderlich sind. Konkrete Speicherfristen und der eingesetzte Hostinganbieter sind vor Veröffentlichung zu ergänzen.</p>
    </section>

    <section id="kontakt">
      <h2>4. Kontakt per E-Mail</h2>
      <p>Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Daten einschließlich Ihrer E-Mail-Adresse und des Nachrichteninhalts, um Ihr Anliegen zu bearbeiten und Rückfragen zu beantworten.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage auf die Anbahnung oder Durchführung eines Vertrags gerichtet ist, andernfalls Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht, sobald das Anliegen abschließend bearbeitet ist, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
    </section>

    <section id="anfragen">
      <h2>5. Demo-Anfrage und Zugangsanfrage</h2>
      <p>Das Demo-Formular auf der Startseite dient derzeit nur der lokalen Darstellung. Beim Absenden werden die dort eingegebenen Daten in der aktuellen Implementierung nicht an unseren Server übertragen.</p>
      <p>Wenn Sie im Login-Bereich einen Zugang anfragen, verarbeiten wir die von Ihnen eingegebenen Daten: Name, Organisation, geschäftliche E-Mail-Adresse und optional Ihre Nachricht. Die Daten werden im Anwendungssystem gespeichert, um die Anfrage zu prüfen, Rückfragen zu stellen und einen Zugang gegebenenfalls vorzubereiten.</p>
      <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO für vorvertragliche Maßnahmen beziehungsweise Art. 6 Abs. 1 lit. f DSGVO für die Bearbeitung einer von Ihnen veranlassten Anfrage. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist, sofern keine gesetzlichen Aufbewahrungspflichten oder berechtigten Nachweispflichten eine längere Speicherung erfordern.</p>
    </section>

    <section id="session-cookie">
      <h2>6. Anmeldung und Session-Cookie</h2>
      <p>Für die Anmeldung im geschützten Kundenbereich verwenden wir das technisch notwendige, ausschließlich zur Sitzungsverwaltung eingesetzte Cookie <code>prooflane_session</code>. Es ist als HttpOnly- und SameSite-Cookie gesetzt und läuft nach spätestens sieben Tagen oder bei einer Abmeldung ab.</p>
      <p>Das Cookie enthält keine Analyse- oder Werbekennung. Die Verarbeitung ist für die Durchführung des Nutzungsverhältnisses erforderlich und erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.</p>
    </section>

    <section id="hosting">
      <h2>7. Empfänger und Hosting</h2>
      <p>Für Hosting, Betrieb und technische Wartung können Dienstleister als Auftragsverarbeiter eingesetzt werden. Der konkrete Hostinganbieter, sein Sitz, eine gegebenenfalls stattfindende Drittlandübermittlung und die dazugehörigen Garantien sind vor Veröffentlichung zu ergänzen:</p>
      <div className="legal-placeholder">[Name und Anschrift des Hostinganbieters, Auftragsverarbeitung und gegebenenfalls Drittlandtransfer ergänzen]</div>
    </section>

    <section id="rechte">
      <h2>8. Ihre Rechte</h2>
      <p>Sie haben nach Maßgabe der gesetzlichen Voraussetzungen das Recht auf Auskunft über Ihre personenbezogenen Daten, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO. Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.</p>
      <p>Zur Ausübung Ihrer Rechte genügt eine Nachricht an <a href="mailto:hello@prooflane.de">hello@prooflane.de</a>.</p>
    </section>

    <section id="beschwerde">
      <h2>9. Beschwerderecht</h2>
      <p>Sie haben außerdem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, insbesondere an Ihrem Aufenthaltsort, Ihrem Arbeitsplatz oder am Ort des vermuteten Verstoßes.</p>
    </section>

    <section id="aktualitaet">
      <h2>10. Aktualität dieser Datenschutzhinweise</h2>
      <p>Wir passen diese Datenschutzhinweise an, wenn sich die Website, die eingesetzten Dienste oder die rechtlichen Anforderungen ändern. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.</p>
    </section>
  </LegalShell>;
}
