"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./anmelden.css";

function Mark() { return <span className="login-mark" aria-hidden="true"><i /><i /><i /></span>; }

export default function AnmeldenPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@")) { setError("Bitte geschäftliche E-Mail eingeben."); return; }
    if (password.length < 12) { setError("Passwort braucht mindestens 12 Zeichen."); return; }
    setPending(true);
    setError("");
    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name: data.get("name"), organizationName: data.get("organizationName") }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) { setError(result?.error || "Anmeldung fehlgeschlagen."); return; }
      router.replace("/arbeitsbereich");
    } catch {
      setError("Server nicht erreichbar. Bitte erneut versuchen.");
    } finally {
      setPending(false);
    }
  }

  return <main className="login-page"><header className="login-header"><Link href="/" className="login-brand"><Mark />prooflane</Link><Link href="/" className="login-back">Zur Startseite</Link></header><section className="login-main"><div className="login-context"><p>Zugang für Kunden</p><h1 className="text-balance">Nachweise, Freigaben und Maßnahmen an einem Ort.</h1><ul><li>Nachweisstand prüfen</li><li>Kundenfreigaben steuern</li><li>Maßnahmen nachverfolgen</li></ul></div><div className="login-card"><div className="login-mode" aria-label="Zugang auswählen"><button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); }}>Anmelden</button><button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setError(""); }}>Konto erstellen</button></div><h2 className="text-balance">{mode === "login" ? "Anmelden" : "Konto erstellen"}</h2><p className="text-pretty">{mode === "login" ? "Nutzen Sie Ihren Prooflane-Zugang." : "Sie erstellen Organisation und erstes Owner-Konto."}</p><form onSubmit={submit} noValidate>{mode === "register" && <><label htmlFor="name">Name</label><input id="name" name="name" required autoComplete="name" placeholder="Vor- und Nachname" onChange={() => setError("")} /><label htmlFor="organizationName">Organisation</label><input id="organizationName" name="organizationName" required autoComplete="organization" placeholder="Unternehmensname" onChange={() => setError("")} /></>}<label htmlFor="email">Geschäftliche E-Mail</label><input id="email" name="email" type="email" autoComplete="email" placeholder="name@unternehmen.de" onChange={() => setError("")} autoFocus /><div className="login-label-row"><label htmlFor="password">Passwort</label>{mode === "login" && <a href="mailto:hello@prooflane.de?subject=Passwort%20zur%C3%BCcksetzen">Passwort vergessen?</a>}</div><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Mindestens 12 Zeichen" onChange={() => setError("")} />{error && <p className="login-error" role="alert">{error}</p>}<button type="submit" disabled={pending}>{pending ? "Wird verarbeitet …" : mode === "login" ? "Anmelden" : "Konto erstellen"}</button></form><p className="login-request">{mode === "login" ? <>Noch kein Zugang? <button type="button" onClick={() => setMode("register")}>Konto erstellen</button></> : <>Schon registriert? <button type="button" onClick={() => setMode("login")}>Anmelden</button></>}</p></div></section></main>;
}
