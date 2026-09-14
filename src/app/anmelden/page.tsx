"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./anmelden.css";

type Mode = "login" | "request";

function Mark() { return <span className="login-mark" aria-hidden="true"><i /><i /><i /></span>; }

export default function AnmeldenPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  function switchMode(nextMode: Mode) { setMode(nextMode); setError(""); setSuccess(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@")) { setError("Bitte geschäftliche E-Mail eingeben."); return; }
    if (isLogin && password.length < 12) { setError("Passwort braucht mindestens 12 Zeichen."); return; }
    setPending(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(isLogin ? "/api/auth/login" : "/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(isLogin ? { email, password } : { email, name: data.get("name"), organizationName: data.get("organizationName"), message: data.get("message") }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) { setError(result?.error || "Anfrage fehlgeschlagen."); return; }
      if (isLogin) router.replace("/arbeitsbereich");
      else { form.reset(); setSuccess("Anfrage erhalten. Wir prüfen den Zugang und melden uns."); }
    } catch {
      setError("Server nicht erreichbar. Bitte erneut versuchen.");
    } finally {
      setPending(false);
    }
  }

  return <main className="login-page"><header className="login-header"><Link href="/" className="login-brand"><Mark />prooflane</Link><Link href="/" className="login-back">Zur Startseite</Link></header><section className="login-main"><div className="login-context"><p>Zugang für Kunden</p><h1 className="text-balance">Nachweise, Freigaben und Maßnahmen an einem Ort.</h1><ul><li>Nachweisstand prüfen</li><li>Kundenfreigaben steuern</li><li>Maßnahmen nachverfolgen</li></ul></div><div className="login-card"><div className="login-mode" aria-label="Zugang auswählen"><button type="button" className={isLogin ? "is-active" : ""} onClick={() => switchMode("login")}>Anmelden</button><button type="button" className={!isLogin ? "is-active" : ""} onClick={() => switchMode("request")}>Zugang anfragen</button></div><h2 className="text-balance">{isLogin ? "Anmelden" : "Zugang anfragen"}</h2><p className="text-pretty">{isLogin ? "Nutzen Sie Ihren freigegebenen Prooflane-Zugang." : "Wir prüfen jede Anfrage, bevor wir ein Konto anlegen."}</p><form onSubmit={submit} noValidate>{!isLogin && <><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" placeholder="Vor- und Nachname" onChange={() => setError("")} /><label htmlFor="organizationName">Organisation</label><input id="organizationName" name="organizationName" required autoComplete="organization" placeholder="Unternehmensname" onChange={() => setError("")} /></>}<label htmlFor="email">Geschäftliche E-Mail</label><input id="email" name="email" type="email" autoComplete="email" placeholder="name@unternehmen.de" onChange={() => setError("")} autoFocus />{isLogin ? <><div className="login-label-row"><label htmlFor="password">Passwort</label><a href="mailto:hello@prooflane.de?subject=Passwort%20zur%C3%BCcksetzen">Passwort vergessen?</a></div><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Mindestens 12 Zeichen" onChange={() => setError("")} /></> : <><label htmlFor="message">Nachricht <span>optional</span></label><textarea id="message" name="message" maxLength={1000} placeholder="Wofür möchten Sie Prooflane nutzen?" onChange={() => setError("")} /></>}{error && <p className="login-error" role="alert">{error}</p>}{success && <p className="login-success" role="status">{success}</p>}<button type="submit" disabled={pending}>{pending ? "Wird verarbeitet …" : isLogin ? "Anmelden" : "Anfrage senden"}</button></form><p className="login-request">{isLogin ? <>Noch kein Zugang? <button type="button" onClick={() => switchMode("request")}>Zugang anfragen</button></> : <>Bereits freigegeben? <button type="button" onClick={() => switchMode("login")}>Zur Anmeldung</button></>}</p><nav className="login-legal-links" aria-label="Rechtliche Navigation"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link></nav></div></section></main>;
}
