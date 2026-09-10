"use client";

import { FormEvent, useEffect, useState } from "react";

type Audience = "zulieferer" | "abnehmer" | "partner";

const audiences: Record<Audience, { label: string; eyebrow: string; title: string; copy: string; metric: string; rows: string[] }> = {
  zulieferer: {
    label: "Zulieferer",
    eyebrow: "Für Zulieferer",
    title: "Einmal pflegen. Mehrfach verwenden.",
    copy: "Halten Sie Ihren Sicherheitsnachweis an einer Stelle aktuell und geben Sie nur frei, was ein Kunde sehen darf.",
    metric: "1 Profil für mehrere Kundenanfragen",
    rows: ["Informationssicherheit · aktuell", "Notfallmanagement · gültig", "Lieferkette · freigegeben"],
  },
  abnehmer: {
    label: "Abnehmer",
    eyebrow: "Für Einkauf & Risiko",
    title: "Evidenz vergleichen. Nicht Versionen.",
    copy: "Sehen Sie Nachweisstand, Freigaben und Änderungen Ihrer Lieferanten in einer prüfbaren Historie.",
    metric: "Klare Spur für jede Freigabe",
    rows: ["HARTMANN Präzision · geprüft", "Nachweis 14 · geändert", "Freigabe Atlas · bis 06/27"],
  },
  partner: {
    label: "Systemhäuser",
    eyebrow: "Für Systemhäuser",
    title: "Aus Lücken werden klare Aufträge.",
    copy: "Fehlende oder auslaufende Evidenz wird zu einem abgegrenzten Umsetzungsschritt – nicht zu einem vagen Hinweis.",
    metric: "Konkreter Bedarf statt Rückfragen",
    rows: ["MFA-Nachweis · ausstehend", "Backup-Richtlinie · prüfen", "Maßnahme · beauftragen"],
  },
};

function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Check() {
  return <span className="check" aria-hidden="true">✓</span>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="Prooflane Startseite"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>prooflane</a>;
}

function PassDiagram() {
  const customers = [["A", "Atlas Anlagenbau", "12 Bereiche freigegeben"], ["N", "Nordwerk", "8 Bereiche freigegeben"], ["K", "Kern Industrie", "10 Bereiche freigegeben"]] as const;
  return <div className="pass-diagram" aria-label="Ein Prooflane Pass wird an drei Kunden gezielt freigegeben">
    <section className="pass-card">
      <div className="pass-card-top"><span>PROOFLANE PASS</span><b><i /> geprüft</b></div>
      <div className="pass-company"><span>H</span><div><strong>HARTMANN Präzision</strong><small>Industrieller Zulieferer</small></div></div>
      <div className="pass-score"><span>Security Evidence</span><strong>86 %</strong></div>
      <div className="score-line"><i /></div>
      <div className="pass-meta"><span>18 Nachweise</span><span>2 laufen ab</span></div>
    </section>
    <div className="diagram-connector" aria-hidden="true"><i /><i /><i /></div>
    <div className="customer-list">
      {customers.map(([initial, name, detail]) => <div className="customer-row" key={name}><span>{initial}</span><div><strong>{name}</strong><small>{detail}</small></div><Check /></div>)}
    </div>
    <p className="audit-note"><Check /> Auditspur: Freigabe für Atlas Anlagenbau erweitert · heute, 10:43</p>
  </div>;
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Dialog schließen">×</button>{sent ? <div className="modal-success"><Check /><p className="eyebrow">Anfrage erhalten</p><h2>Vielen Dank.</h2><p>Wir melden uns, um einen passenden Termin für Ihre Lieferkette zu finden.</p><button className="text-button" onClick={onClose}>Fenster schließen <Arrow /></button></div> : <><p className="eyebrow">Prooflane kennenlernen</p><h2 id="demo-title">Demo anfragen</h2><p className="modal-copy">In 30 Minuten zeigen wir Ihnen den passenden Einstieg für Ihre Rolle.</p><form onSubmit={submit}><label>Geschäftliche E-Mail<input type="email" placeholder="name@unternehmen.de" required autoFocus /></label><label>Unternehmen<input type="text" placeholder="Ihr Unternehmen" required /></label><label>Ihre Rolle<select defaultValue="" required><option value="" disabled>Bitte auswählen</option><option>Zulieferer</option><option>Abnehmer</option><option>Systemhaus</option></select></label><button className="button button-primary" type="submit">Demo anfragen <Arrow /></button></form></>}</section></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("zulieferer");
  const active = audiences[audience];
  const openDemo = () => { setMenuOpen(false); setModalOpen(true); };
  const chooseAudience = (next: Audience) => { setMenuOpen(false); setAudience(next); };

  return <main className="prooflane-site" id="top">
    <header className="site-header"><div className="shell header-inner"><Brand /><nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Hauptnavigation"><a href="#produkt" onClick={() => setMenuOpen(false)}>Produkt</a><a href="#zielgruppen" onClick={() => chooseAudience("zulieferer")}>Für Zulieferer</a><a href="#zielgruppen" onClick={() => chooseAudience("abnehmer")}>Für Abnehmer</a><a href="#zielgruppen" onClick={() => chooseAudience("partner")}>Partner</a><a href="#sicherheit" onClick={() => setMenuOpen(false)}>Sicherheit</a><a href="/anmelden">Anmelden</a><button className="mobile-demo" onClick={openDemo}>Demo anfragen <Arrow /></button></nav><button className="button button-primary header-cta" onClick={openDemo}>Demo anfragen <Arrow /></button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Navigation öffnen" aria-expanded={menuOpen}><i /><i /></button></div></header>

    <section className="hero shell"><div className="hero-copy"><p className="eyebrow">Security Evidence Exchange</p><h1>Ein Sicherheits&shy;nachweis.<br /><em>Jeder Kunde.</em></h1><p className="hero-lead">Prooflane ersetzt wiederkehrende Lieferantenfrage&shy;bögen durch einen aktuellen, kontrolliert freigebbaren Sicherheitsnachweis.</p><div className="hero-actions"><button className="button button-primary" onClick={openDemo}>Demo anfragen <Arrow /></button><a className="button button-secondary" href="#produkt">So funktioniert es <Arrow /></a></div></div><PassDiagram /></section>

    <div className="proof-strip"><div className="shell"><span>Ein Profil</span><i /><span>Gezielte Freigaben</span><i /><span>Prüfbare Änderungen</span></div></div>

    <section className="section shell problem" id="produkt"><div><p className="section-index">01 / AUSGANGSLAGE</p><h2>Excel ist kein<br /><em>Sicherheitsstandard.</em></h2></div><div><p className="section-lead">Wenn Nachweise per E-Mail, Dateiablage und Tabellen zirkulieren, wird Aktualität zur Vermutung.</p><ol className="problem-list"><li><span>01</span>Jeder Kunde fordert dieselben Informationen anders an.</li><li><span>02</span>Zulieferer beantworten dieselben Fragen immer wieder.</li><li><span>03</span>Abnehmer prüfen Dokumente manuell und ohne klaren Stand.</li></ol></div><div className="before-after"><article><p>VORHER</p><strong>Versionen und Rückfragen</strong><span>Dateien, Anhänge und Antworten verteilen sich über viele Kanäle.</span></article><Arrow /><article><p>MIT PROOFLANE</p><strong>Ein aktueller Nachweis</strong><span>Evidenz, Rechte und Änderungen bleiben an einem prüfbaren Ort.</span></article></div></section>

    <section className="section process"><div className="shell"><p className="section-index">02 / PROZESS</p><h2>So funktioniert Prooflane.</h2><ol>{[["01", "Einmal dokumentieren", "Bestehende Nachweise strukturiert erfassen."], ["02", "Evidenz aktuell halten", "Ablaufdaten und Verantwortungen im Blick behalten."], ["03", "Gezielt freigeben", "Jeden Kunden nur an passende Bereiche lassen."], ["04", "Nur Änderungen nachfordern", "Relevantes erkennen, statt alles neu zu prüfen."]].map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div></section>

    <section className="section shell audiences" id="zielgruppen"><div className="audience-heading"><div><p className="section-index">03 / FÜR JEDE ROLLE</p><h2>Ein Nachweis,<br /><em>unterschiedlicher Nutzen.</em></h2></div><p>Alle arbeiten mit dem gleichen Informationsstand – aber nur mit Freigaben, die zu ihrer Aufgabe passen.</p></div><div className="tabs" role="tablist" aria-label="Zielgruppe wählen">{(Object.keys(audiences) as Audience[]).map((key) => <button key={key} role="tab" aria-selected={audience === key} className={audience === key ? "active" : ""} onClick={() => chooseAudience(key)}>{audiences[key].label}</button>)}</div><div className="audience-content" role="tabpanel"><div><p className="eyebrow">{active.eyebrow}</p><h3>{active.title}</h3><p>{active.copy}</p><p className="audience-metric"><Check /> {active.metric}</p><button className="text-button" onClick={openDemo}>Passende Demo ansehen <Arrow /></button></div><div className="mini-ui"><div className="mini-ui-head"><span>PROOFLANE</span><i>live</i></div><div className="mini-ui-title"><span>{audience === "zulieferer" ? "H" : audience === "abnehmer" ? "A" : "P"}</span><div><strong>{audience === "zulieferer" ? "HARTMANN Präzision" : audience === "abnehmer" ? "Lieferantenübersicht" : "Partner Desk"}</strong><small>{active.eyebrow}</small></div></div>{active.rows.map((row) => <div className="mini-ui-row" key={row}><Check /><span>{row}</span><small>aktuell</small></div>)}<div className="mini-ui-footer">Letzte Änderung <strong>Heute · 10:42</strong></div></div></div></section>

    <section className="section evidence" id="sicherheit"><div className="shell"><div className="evidence-heading"><div><p className="section-index">04 / VERTRAUEN</p><h2>Nachweise,<br /><em>nicht Behauptungen.</em></h2></div><p>Prooflane zeigt, wie belastbar eine Information ist – ohne Sicherheitsprogramme in Marketingversprechen zu verwandeln.</p></div><div className="evidence-levels"><article><span>01</span><h3>Selbstauskunft</h3><p>Vom Zulieferer strukturiert dokumentierte Angaben.</p></article><article><span>02</span><h3>Technisch belegte Evidenz</h3><p>Nachweise aus Systemen, Richtlinien und Kontrollen.</p></article><article><span>03</span><h3>Extern bestätigte Evidenz</h3><p>Ergänzende Bestätigungen durch unabhängige Stellen.</p></article></div><div className="control-points"><span><Check /> Ablaufdaten</span><span><Check /> Rollenbasierte Freigaben</span><span><Check /> Revisionssichere Protokolle</span></div></div></section>

    <section className="final-cta shell"><div><p className="eyebrow">Bereit für einen klareren Prozess?</p><h2>Machen Sie aus Lieferantenprüfung einen <em>wiederverwendbaren Prozess.</em></h2></div><div><button className="button button-light" onClick={openDemo}>Pilotprogramm anfragen <Arrow /></button><p>Für industrielle Lieferketten mit mehreren überlappenden Zulieferern.</p></div></section>

    <footer className="site-footer"><div className="shell"><div><Brand /><p>Security Evidence Exchange für industrielle Lieferketten.</p></div><nav><a href="#produkt">Produkt</a><a href="#sicherheit">Sicherheit</a><a href="#">Datenschutz</a><a href="#">Impressum</a><a href="mailto:hello@prooflane.de">Kontakt</a></nav><small>© {new Date().getFullYear()} Prooflane</small></div></footer>
    {modalOpen && <DemoModal onClose={() => setModalOpen(false)} />}
  </main>;
}
