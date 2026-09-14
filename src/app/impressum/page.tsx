import type { Metadata } from "next";
import { LegalNotice, LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Impressum — Prooflane",
  description: "Anbieterkennzeichnung und rechtliche Hinweise von Prooflane.",
};

const sections = [
  { id: "diensteanbieter", label: "Diensteanbieter" },
  { id: "kontakt", label: "Vertretung und Kontakt" },
  { id: "register", label: "Registerangaben" },
  { id: "inhalt", label: "Verantwortlich für Inhalte" },
  { id: "haftung-inhalte", label: "Haftung für Inhalte" },
  { id: "haftung-links", label: "Haftung für Links" },
  { id: "urheberrecht", label: "Urheberrecht" },
] as const;

export default function ImpressumPage() {
  return <LegalShell
    eyebrow="Rechtliches / 01"
    title="Impressum"
    intro="Anbieterkennzeichnung und rechtliche Hinweise für das digitale Angebot von Prooflane."
    updated="14. September 2026"
    sections={sections}
  >
    <LegalNotice />

    <section id="diensteanbieter">
      <h2>Angaben zum Diensteanbieter</h2>
      <address>
        [Name / Firma des Betreibers]<br />
        [Rechtsform, falls zutreffend]<br />
        [Straße und Hausnummer]<br />
        [PLZ Ort]<br />
        Deutschland
      </address>
    </section>

    <section id="kontakt">
      <h2>Vertretung und Kontakt</h2>
      <p><strong>Vertretungsberechtigte Person:</strong><br />[Vor- und Nachname]</p>
      <p><strong>E-Mail:</strong> <a href="mailto:hello@prooflane.de">hello@prooflane.de</a></p>
      <p><strong>Telefon:</strong> [Telefonnummer, falls vorhanden]</p>
    </section>

    <section id="register">
      <h2>Registerangaben</h2>
      <p>[Registergericht und Registernummer, falls eingetragen]</p>
      <p>[Umsatzsteuer-Identifikationsnummer nach § 27a UStG, falls vorhanden]</p>
    </section>

    <section id="inhalt">
      <h2>Verantwortlich für den Inhalt</h2>
      <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV ist:</p>
      <address>
        [Vor- und Nachname]<br />
        [Anschrift wie oben]
      </address>
    </section>

    <section id="haftung-inhalte">
      <h2>Haftung für Inhalte</h2>
      <p>Die Inhalte dieser Website werden mit angemessener Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Gesetzliche Haftungsansprüche bleiben unberührt.</p>
    </section>

    <section id="haftung-links">
      <h2>Haftung für Links</h2>
      <p>Diese Website kann Links zu externen Websites Dritter enthalten. Auf deren Inhalte besteht kein Einfluss. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.</p>
    </section>

    <section id="urheberrecht">
      <h2>Urheberrecht</h2>
      <p>Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Jede Verwertung außerhalb der gesetzlichen Grenzen bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers.</p>
    </section>
  </LegalShell>;
}
