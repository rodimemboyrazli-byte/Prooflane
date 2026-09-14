import Link from "next/link";
import type { ReactNode } from "react";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: readonly { id: string; label: string }[];
  children: ReactNode;
};

function LegalMark() {
  return <span className="legal-mark" aria-hidden="true"><i /><i /><i /></span>;
}

export function LegalShell({ eyebrow, title, intro, updated, sections, children }: LegalShellProps) {
  const documentNumber = eyebrow.split("/").at(-1)?.trim() ?? "";
  const companion = title === "Impressum"
    ? { href: "/datenschutz", label: "Datenschutz" }
    : { href: "/impressum", label: "Impressum" };

  return <div className="legal-page">
    <header className="legal-header">
      <div className="legal-header-inner">
        <Link className="legal-brand" href="/" aria-label="Prooflane Startseite"><LegalMark />prooflane</Link>
        <nav className="legal-header-nav" aria-label="Seitennavigation">
          <Link href={companion.href}>{companion.label}</Link>
          <Link className="legal-home" href="/">Startseite <span aria-hidden="true">→</span></Link>
        </nav>
      </div>
    </header>

    <main>
      <section className="legal-hero">
        <span className="legal-hero-number" aria-hidden="true">{documentNumber}</span>
        <div className="legal-hero-inner">
          <div>
            <p className="legal-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="legal-hero-side">
            <p className="legal-hero-intro">{intro}</p>
            <div className="legal-hero-meta"><span>Dokument {documentNumber}</span><strong>{title}</strong><small>Stand: {updated}</small></div>
          </div>
        </div>
      </section>

      <div className="legal-content-shell">
        <aside className="legal-rail">
          <p>Inhalt</p>
          <nav aria-label={`${title}: Inhaltsverzeichnis`}>
            {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.label}</a>)}
          </nav>
        </aside>
        <article className="legal-content">
          {children}
        </article>
      </div>
    </main>

    <footer className="legal-footer">
      <div className="legal-footer-inner">
        <div className="legal-footer-brand"><Link className="legal-brand" href="/" aria-label="Prooflane Startseite"><LegalMark />prooflane</Link><p>Security Evidence Exchange für industrielle Lieferketten.</p></div>
        <nav aria-label="Footer-Navigation">
          <div><strong>Prooflane</strong><Link href="/">Startseite</Link><Link href="/anmelden">Anmelden</Link><a href="mailto:hello@prooflane.de">Kontakt</a></div>
          <div><strong>Rechtliches</strong><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link></div>
        </nav>
        <div className="legal-footer-close"><span>© {new Date().getFullYear()} Prooflane</span><span>Für belastbare Verbindungen.</span></div>
      </div>
    </footer>
  </div>;
}

export function LegalNotice() {
  return <aside className="legal-notice">
    <span>Hinweis / Entwurf</span>
    <div><strong>Vor Veröffentlichung vervollständigen</strong><p>Die eckigen Klammern enthalten Angaben, die im Projekt noch nicht hinterlegt sind. Bitte Betreiber-, Vertretungs- und Hostingdaten vor dem Livegang ersetzen und den Text rechtlich prüfen lassen.</p></div>
  </aside>;
}
