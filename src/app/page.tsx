"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

type Audience = "zulieferer" | "abnehmer" | "partner";

const audiences: Record<Audience, { label: string; title: string; copy: string; metric: string; rows: string[] }> = {
  zulieferer: {
    label: "Zulieferer",
    title: "Einmal pflegen. Wiederholt souverän antworten.",
    copy: "Ein aktuelles Profil ersetzt verstreute Fragebögen. Sie entscheiden pro Kunde, welche Evidenz sichtbar wird.",
    metric: "Ein Profil für mehrere Kundenanfragen",
    rows: ["Informationssicherheit", "Notfallmanagement", "Lieferkette"],
  },
  abnehmer: {
    label: "Abnehmer",
    title: "Evidenz vergleichen. Nicht Dateiversionen.",
    copy: "Einkauf und Risiko sehen Nachweisstand, Freigaben und Änderungen in einer belastbaren Historie.",
    metric: "Eine klare Spur für jede Freigabe",
    rows: ["HARTMANN Präzision", "Nachweis 14 geändert", "Freigabe Atlas"],
  },
  partner: {
    label: "Systemhäuser",
    title: "Aus einer Lücke wird ein klarer Auftrag.",
    copy: "Fehlende oder auslaufende Evidenz wird zum abgegrenzten Umsetzungsschritt – nicht zum vagen Hinweis.",
    metric: "Konkreter Bedarf statt Rückfragen",
    rows: ["MFA-Nachweis", "Backup-Richtlinie", "Maßnahme beauftragen"],
  },
};

const productSteps = [
  ["erfassen", "Erfassen", "Bestehende Nachweise strukturiert an einem Ort zusammenführen."],
  ["pruefen", "Prüfen", "Status, Gültigkeit und Evidenzqualität unmittelbar einordnen."],
  ["freigeben", "Freigeben", "Pro Verbindung nur die vorgesehenen Bereiche sichtbar machen."],
  ["wiederverwenden", "Wiederverwenden", "Änderungen teilen, ohne den Prozess neu zu starten."],
] as const;

const audienceOrder = Object.keys(audiences) as Audience[];

function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h12M11 5l5 5-5 5" /></svg>;
}

function CheckIcon() {
  return <span className="check-icon" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3.5 8.2 2.7 2.7 6.3-6.1" /></svg></span>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="Prooflane Startseite"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>prooflane</span></a>;
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const appRoot = document.querySelector<HTMLElement>(".prooflane-site");
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = appRoot?.getAttribute("aria-hidden");
    appRoot?.setAttribute("inert", "");
    appRoot?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";

    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, input, select, a[href], [tabindex]:not([tabindex='-1'])") ?? []).filter((element) => !element.hasAttribute("disabled"));
    const focusFirst = window.requestAnimationFrame(() => (focusable()[1] ?? focusable()[0] ?? dialogRef.current)?.focus());
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute("inert");
      if (previousAriaHidden === null) appRoot?.removeAttribute("aria-hidden");
      else if (previousAriaHidden !== undefined) appRoot?.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [onClose]);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section ref={dialogRef} className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Dialog schließen"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 4 12 12M16 4 4 16" /></svg></button>
      {sent ? <div className="modal-success"><CheckIcon /><h2 id="demo-title">Vielen Dank.</h2><p>Wir melden uns, um einen passenden Termin für Ihre Lieferkette zu finden.</p><button className="text-button" onClick={onClose}>Fenster schließen <Arrow /></button></div> : <><h2 id="demo-title">Prooflane in Ihrer Lieferkette.</h2><p className="modal-copy">In 30 Minuten zeigen wir Ihnen den passenden Einstieg für Ihre Rolle.</p><form onSubmit={submit}><label>Geschäftliche E-Mail<input type="email" placeholder="name@unternehmen.de" required autoFocus /></label><label>Unternehmen<input type="text" placeholder="Ihr Unternehmen" required /></label><label>Ihre Rolle<select defaultValue="" required><option value="" disabled>Bitte auswählen</option><option>Zulieferer</option><option>Abnehmer</option><option>Systemhaus</option></select></label><button className="button button-primary" type="submit">Demo anfragen <Arrow /></button></form></>}
    </section>
  </div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("zulieferer");
  const [activeStep, setActiveStep] = useState("erfassen");
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const active = audiences[audience];
  const openDemo = () => { returnFocusRef.current = document.activeElement as HTMLElement | null; setMenuOpen(false); setModalOpen(true); };
  const closeDemo = () => { setModalOpen(false); window.requestAnimationFrame(() => returnFocusRef.current?.focus()); };
  const chooseAudience = (next: Audience) => { setMenuOpen(false); setAudience(next); };
  const navigateAudience = (event: ReactKeyboardEvent<HTMLButtonElement>, current: Audience) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = audienceOrder.indexOf(current);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? audienceOrder.length - 1 : event.key === "ArrowRight" ? (currentIndex + 1) % audienceOrder.length : (currentIndex - 1 + audienceOrder.length) % audienceOrder.length;
    const next = audienceOrder[nextIndex];
    chooseAudience(next);
    window.requestAnimationFrame(() => document.getElementById(`audience-tab-${next}`)?.focus());
  };

  useEffect(() => {
    const sections = productSteps.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveStep(visible.target.id);
    }, { rootMargin: "-20% 0px -35%", threshold: [0.25, 0.5, 0.75] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <><main className="prooflane-site" id="top">
    <header className="site-header"><div className="header-inner"><Brand /><nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Hauptnavigation"><a href="#produkt" onClick={() => setMenuOpen(false)}>Produkt</a><a href="#rollen" onClick={() => chooseAudience("zulieferer")}>Lösungen</a><a href="mailto:hello@prooflane.de">Kontakt</a><a className="nav-login" href="/anmelden">Anmelden</a><button className="nav-demo" onClick={openDemo}>Demo anfragen <Arrow /></button></nav><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Navigation schließen" : "Navigation öffnen"} aria-expanded={menuOpen}><i /><i /></button></div></header>

    <section className="hero-stage">
      <figure className="hero-photo">
        <Image src="/assets/prooflane-industrial-hero.jpg" alt="Produktionsanlage für großformatige Metallteile in einer hellen Werkhalle" fill priority sizes="100vw" />
        <figcaption className="hero-photo-credit">Foto: <a href="https://unsplash.com/photos/industrial-machinery-in-a-large-factory-setting-mMgC9U15XR0" target="_blank" rel="noreferrer">xing bowen / Unsplash</a></figcaption>
        <div className="hero-photo-note" aria-hidden="true"><span>01 / Echte Wertschöpfung</span><strong>Wo produziert wird,<br />entsteht Evidenz.</strong></div>
      </figure>
      <div className="hero-content shell">
        <h1>Ein Nachweis.<br /><em>Für jede Verbindung.</em></h1>
        <div className="hero-pitch"><p>Sicherheitsnachweise einmal pflegen, gezielt freigeben und überall aktuell halten.</p><div className="hero-actions"><button className="button button-primary" onClick={openDemo}>Demo anfragen <Arrow /></button><a className="button button-secondary" href="#produkt">Produkt ansehen <Arrow /></a></div></div>
      </div>
      <div className="hero-status shell"><a href="#produkt">Scrollen <Arrow /></a></div>
    </section>

    <section className="statement" aria-label="Produktversprechen"><div className="statement-track"><p>Einmal pflegen.</p><p>Gezielt freigeben.</p><p>Überall aktuell.</p></div></section>

    <section className="product-story" id="produkt">
      <div className="chapter-heading shell"><h2>Von der Datei<br />zur <em>belastbaren Verbindung.</em></h2><p>Prooflane hält Evidenz, Rechte und Änderungen zusammen. So wird aus wiederkehrender Lieferantenprüfung ein Prozess, der mit jeder Verbindung stärker wird.</p></div>
      <div className="feature-layout shell">
        <aside className="feature-nav" aria-label="Produktablauf"><p>Der Nachweis bewegt sich.</p>{productSteps.map(([id, title, copy]) => <a key={id} href={`#${id}`} className={activeStep === id ? "active" : ""}><span>{title}</span><small>{copy}</small></a>)}</aside>
        <div className="feature-panels">
          <article className="feature-panel" id="erfassen">
            <div className="panel-copy"><span>Erfassen</span><h3>Ein Profil statt<br />vieler Dateistände.</h3><p>Bestehende Dokumente, Richtlinien und Auskünfte werden zu einem strukturierten Nachweis.</p></div>
            <div className="capture-ui" aria-label="Beispieldaten: Dokumente werden einem Sicherheitsprofil zugeordnet">
              <div className="capture-inbox"><p>Eingang</p>{["ISMS-Richtlinie.pdf", "Notfallplan_2026.docx", "Backup-Nachweis.pdf"].map((file, index) => <div key={file}><span>0{index + 1}</span><strong>{file}</strong><small>{index === 2 ? "neu" : "geprüft"}</small></div>)}</div>
              <div className="capture-route" aria-hidden="true"><i /><i /><i /></div>
              <div className="capture-pass"><span>PROOFLANE PROFIL</span><strong>HARTMANN Präzision</strong><div><b>18</b><small>Nachweise</small></div><p><CheckIcon /> Struktur vollständig</p></div>
              <small className="sample-note">Illustrative Beispieldaten</small>
            </div>
          </article>

          <article className="feature-panel" id="pruefen">
            <div className="panel-copy"><span>Prüfen</span><h3>Aktualität wird sichtbar,<br />bevor sie fehlt.</h3><p>Gültigkeit, Evidenzgrad und offene Maßnahmen werden dort bewertet, wo sie entstehen.</p></div>
            <div className="review-ui" aria-label="Beispieldaten: Nachweisstatus und Ablaufdaten">
              <div className="review-head"><span>Sicherheitsprofil</span><b>Stand 10.09.2026</b></div>
              <div className="review-score"><strong>86</strong><span>%<small>Evidenz vollständig</small></span></div>
              <ol><li><span>Informationssicherheit</span><b>aktuell</b><i style={{ "--fill": "94%" } as React.CSSProperties} /></li><li><span>Notfallmanagement</span><b>aktuell</b><i style={{ "--fill": "82%" } as React.CSSProperties} /></li><li><span>Lieferkette</span><b>2 offen</b><i style={{ "--fill": "68%" } as React.CSSProperties} /></li></ol>
              <p><CheckIcon /> Nächste Prüfung: 22. Oktober 2026</p><small className="sample-note">Illustrative Beispieldaten</small>
            </div>
          </article>

          <article className="feature-panel" id="freigeben">
            <div className="panel-copy"><span>Freigeben</span><h3>Jeder sieht genau das,<br />was zur Verbindung gehört.</h3><p>Berechtigungen werden nicht kopiert, sondern direkt am Nachweis gesteuert und dokumentiert.</p></div>
            <div className="permission-ui" aria-label="Beispieldaten: unterschiedliche Freigaben für drei Kunden">
              <div className="permission-source"><span>HP</span><strong>HARTMANN<br />Präzision</strong><small>Masterprofil</small></div>
              <div className="permission-lines" aria-hidden="true"><i /><i /><i /></div>
              <div className="permission-targets"><div><span>AA</span><p><strong>Atlas Anlagenbau</strong><small>12 Bereiche · aktiv</small></p><CheckIcon /></div><div><span>NW</span><p><strong>Nordwerk</strong><small>8 Bereiche · aktiv</small></p><CheckIcon /></div><div><span>KI</span><p><strong>Kern Industrie</strong><small>10 Bereiche · bis 06/27</small></p><CheckIcon /></div></div>
              <small className="sample-note">Illustrative Beispieldaten</small>
            </div>
          </article>

          <article className="feature-panel" id="wiederverwenden">
            <div className="panel-copy"><span>Wiederverwenden</span><h3>Nur die Änderung reist.<br />Nicht der ganze Prozess.</h3><p>Ein aktualisierter Nachweis erreicht jede berechtigte Verbindung mit einer prüfbaren Spur.</p></div>
            <div className="history-ui" aria-label="Beispieldaten: Auditspur einer Änderung">
              <header><span>Änderung PL-184/26</span><b>verteilt</b></header>
              <ol><li><time>10:42</time><span><strong>Nachweis aktualisiert</strong><small>Backup-Richtlinie · Version 3.2</small></span><CheckIcon /></li><li><time>10:43</time><span><strong>Freigaben geprüft</strong><small>3 aktive Verbindungen</small></span><CheckIcon /></li><li><time>10:44</time><span><strong>Änderung bereitgestellt</strong><small>Atlas, Nordwerk, Kern Industrie</small></span><CheckIcon /></li></ol>
              <footer><span>Auditspur vollständig</span><b>3 / 3</b></footer><small className="sample-note">Illustrative Beispieldaten</small>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section className="role-stage" id="rollen">
      <div className="role-heading shell"><h2>Ein System.<br /><em>Drei klare Perspektiven.</em></h2><p>Alle arbeiten mit demselben Informationsstand – aber nur mit den Freigaben, die zu ihrer Aufgabe passen.</p></div>
      <div className="role-tabs shell" role="tablist" aria-label="Zielgruppe wählen">{audienceOrder.map((key) => <button key={key} id={`audience-tab-${key}`} role="tab" aria-selected={audience === key} aria-controls="audience-panel" tabIndex={audience === key ? 0 : -1} className={audience === key ? "active" : ""} onKeyDown={(event) => navigateAudience(event, key)} onClick={() => chooseAudience(key)}>{audiences[key].label}</button>)}</div>
      <div className="role-content shell" id="audience-panel" role="tabpanel" aria-labelledby={`audience-tab-${audience}`} tabIndex={0}>
        <div className="role-copy"><h3>{active.title}</h3><p>{active.copy}</p><div><CheckIcon /><span>{active.metric}</span></div><button className="button button-light" onClick={openDemo}>Passende Demo ansehen <Arrow /></button></div>
        <div className="role-ui"><header><Brand /><span>Live-Profil</span></header><div className="role-company"><span>{audience === "zulieferer" ? "HP" : audience === "abnehmer" ? "AA" : "SY"}</span><p><strong>{audience === "zulieferer" ? "HARTMANN Präzision" : audience === "abnehmer" ? "Atlas Einkauf" : "Systemhaus Desk"}</strong><small>{active.label}</small></p><b>aktuell</b></div>{active.rows.map((row, index) => <div className="role-row" key={row}><span>0{index + 1}</span><strong>{row}</strong><small>{index === 2 && audience !== "abnehmer" ? "offen" : "geprüft"}</small></div>)}<footer><span>Letzte Synchronisation</span><strong>Heute · 10:44</strong></footer><small className="sample-note">Illustrative Beispieldaten</small></div>
      </div>
    </section>

    <section className="final-cta shell"><h2>Der nächste Fragebogen<br />kann der letzte sein.</h2><div><p>Sehen Sie, wie Prooflane in Ihre Lieferkette passt.</p><button className="button button-light" onClick={openDemo}>Pilotprogramm anfragen <Arrow /></button></div></section>

    <footer className="site-footer"><div className="shell"><div className="footer-brand"><Brand /><p>Security Evidence Exchange für industrielle Lieferketten.</p></div><nav><div><strong>Produkt</strong><a href="#produkt">Ablauf</a><a href="#rollen">Lösungen</a></div><div><strong>Prooflane</strong><a href="/anmelden">Anmelden</a><a href="mailto:hello@prooflane.de">Kontakt</a><span>Datenschutz</span><span>Impressum</span></div></nav><div className="footer-close"><span>© {new Date().getFullYear()} Prooflane</span><span>Für belastbare Verbindungen.</span></div></div></footer>
  </main>{modalOpen && <DemoModal onClose={closeDemo} />}</>;
}
