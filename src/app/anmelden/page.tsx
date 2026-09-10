"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "./anmelden.css";

function Mark() { return <span className="login-mark" aria-hidden="true"><i /><i /><i /></span>; }

export default function AnmeldenPage() {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@")) { setError("Bitte geschäftliche E-Mail eingeben."); return; }
    if (password.length < 8) { setError("Passwort braucht mindestens 8 Zeichen."); return; }
    window.location.assign("/arbeitsbereich");
  }

  return <main className="login-page"><header className="login-header"><Link href="/" className="login-brand"><Mark />prooflane</Link><Link href="/" className="login-back">Zur Startseite</Link></header><section className="login-main"><div className="login-context"><p>Zugang für Kunden</p><h1 className="text-balance">Nachweise, Freigaben und Maßnahmen an einem Ort.</h1><ul><li>Nachweisstand prüfen</li><li>Kundenfreigaben steuern</li><li>Maßnahmen nachverfolgen</li></ul></div><div className="login-card"><h2 className="text-balance">Anmelden</h2><p className="text-pretty">Nutzen Sie Ihren Prooflane-Zugang.</p><form onSubmit={submit} noValidate><label htmlFor="email">Geschäftliche E-Mail</label><input id="email" name="email" type="email" autoComplete="email" placeholder="name@unternehmen.de" onChange={() => setError("")} autoFocus /><div className="login-label-row"><label htmlFor="password">Passwort</label><a href="mailto:hello@prooflane.de?subject=Passwort%20zur%C3%BCcksetzen">Passwort vergessen?</a></div><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Mindestens 8 Zeichen" onChange={() => setError("")} />{error && <p className="login-error" role="alert">{error}</p>}<button type="submit">Anmelden</button></form><div className="login-preview"><b>Vorschau</b><span>Beliebige geschäftliche E-Mail und Passwort mit mindestens 8 Zeichen öffnen Arbeitsbereich.</span></div><p className="login-request">Noch kein Zugang? <a href="mailto:hello@prooflane.de?subject=Prooflane%20Zugang%20anfragen">Zugang anfragen</a></p></div></section></main>;
}
