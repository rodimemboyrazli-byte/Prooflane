"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./arbeitsbereich.css";

type View = "ueberblick" | "nachweise" | "freigaben" | "massnahmen";
type TaskStatus = "Offen" | "In Arbeit" | "Erledigt";
type EvidenceStatus = "Aktuell" | "Prüfung nötig" | "Läuft bald ab";
type Task = { id: string; title: string; owner: string; due: string; status: TaskStatus; evidence?: string };
type Evidence = { id: string; title: string; area: string; level: string; validUntil: string; status: EvidenceStatus };
type Customer = { id: string; name: string; email: string; scope: string; shared: boolean };
type Dialog = "task" | "evidence" | "customer" | null;

function Icon({ name }: { name: "grid" | "proof" | "share" | "task" | "plus" | "close" | "arrow" | "check" | "exit" }) {
  const props = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx=".7" {...props} /><rect x="12" y="3" width="5" height="5" rx=".7" {...props} /><rect x="3" y="12" width="5" height="5" rx=".7" {...props} /><rect x="12" y="12" width="5" height="5" rx=".7" {...props} /></svg>;
  if (name === "proof") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.8h7l3 3V17H5zM12 2.8V6h3" {...props} /><path d="m7.2 11 1.5 1.5 3.5-3.6" {...props} /></svg>;
  if (name === "share") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="10" r="2" {...props} /><circle cx="15" cy="5" r="2" {...props} /><circle cx="15" cy="15" r="2" {...props} /><path d="m6.8 9 6.2-3M6.8 11l6.2 3" {...props} /></svg>;
  if (name === "task") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" {...props} /><path d="m6.5 10 2.2 2.2 4.8-4.8" {...props} /></svg>;
  if (name === "plus") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" {...props} /></svg>;
  if (name === "close") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" {...props} /></svg>;
  if (name === "arrow") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h12M11 5l5 5-5 5" {...props} /></svg>;
  if (name === "check") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.2 3.2 7.8-7.8" {...props} /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 3H4v14h4M11 6l4 4-4 4M6 10h9" {...props} /></svg>;
}

function Brand() { return <Link className="workspace-brand" href="/"><span><i /><i /><i /></span><b>prooflane</b><small>OPS</small></Link>; }
function Status({ value }: { value: TaskStatus | EvidenceStatus | "Freigegeben" | "Privat" }) { return <span className={`workspace-status status-${value.toLowerCase().replaceAll(" ", "-").replace("ü", "ue").replace("ä", "ae")}`}>{value}</span>; }

type ApiError = { error?: string };
type ApiEvidence = { id: string; title: string; area: string; level: string; validUntil: string | null; status: "draft" | "needs_review" | "approved" | "expired" };
type ApiTask = { id: string; title: string; assignee: string | null; dueDate: string | null; status: "open" | "in_progress" | "complete"; evidenceId: string | null; evidenceTitle?: string | null };
type ApiCustomer = { id: string; companyName: string; contactEmail: string; scopeDescription: string; shareState: "private" | "shared" };

const taskStatus: Record<ApiTask["status"], TaskStatus> = { open: "Offen", in_progress: "In Arbeit", complete: "Erledigt" };
const taskStatusApi: Record<TaskStatus, ApiTask["status"]> = { Offen: "open", "In Arbeit": "in_progress", Erledigt: "complete" };
const evidenceStatus: Record<ApiEvidence["status"], EvidenceStatus> = { draft: "Prüfung nötig", needs_review: "Prüfung nötig", approved: "Aktuell", expired: "Läuft bald ab" };
function mapEvidence(item: ApiEvidence): Evidence { return { id: item.id, title: item.title, area: item.area, level: item.level, validUntil: item.validUntil || "—", status: evidenceStatus[item.status] }; }
function mapTask(item: ApiTask, evidence: Evidence[]): Task { return { id: item.id, title: item.title, owner: item.assignee || "Nicht zugeordnet", due: item.dueDate || "—", status: taskStatus[item.status], evidence: item.evidenceTitle || evidence.find((entry) => entry.id === item.evidenceId)?.title }; }
function mapCustomer(item: ApiCustomer): Customer { return { id: item.id, name: item.companyName, email: item.contactEmail, scope: item.scopeDescription || "Noch keine Bereiche", shared: item.shareState === "shared" }; }
async function api<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(path, { ...init, credentials: "same-origin", headers: { "Content-Type": "application/json", ...init?.headers } }); const body = await response.json().catch(() => null) as T & ApiError; if (!response.ok) throw new Error(body?.error || "Serveranfrage fehlgeschlagen."); return body; }

export default function ArbeitsbereichPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("ueberblick");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      try {
        const [me, evidenceResponse, taskResponse, customerResponse] = await Promise.all([
          api<{ user: { name: string; organizationName: string } }>("/api/auth/me"),
          api<{ evidence: ApiEvidence[] }>("/api/evidence"),
          api<{ tasks: ApiTask[] }>("/api/tasks"),
          api<{ customers: ApiCustomer[] }>("/api/customers"),
        ]);
        if (!active) return;
        const mappedEvidence = evidenceResponse.evidence.map(mapEvidence);
        setName(me.user.name);
        setOrganizationName(me.user.organizationName);
        setEvidence(mappedEvidence);
        setTasks(taskResponse.tasks.map((item) => mapTask(item, mappedEvidence)));
        setCustomers(customerResponse.customers.map(mapCustomer));
      } catch (loadFailure) {
        if (!active) return;
        const message = loadFailure instanceof Error ? loadFailure.message : "Arbeitsbereich konnte nicht geladen werden.";
        if (message === "Anmeldung erforderlich.") router.replace("/anmelden");
        else setLoadError(message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadWorkspace();
    return () => { active = false; };
  }, [router]);
  const openTasks = tasks.filter((task) => task.status !== "Erledigt");
  const attentionEvidence = evidence.filter((item) => item.status !== "Aktuell");
  const navigation: { id: View; label: string; icon: "grid" | "proof" | "share" | "task"; count?: number }[] = [
    { id: "ueberblick", label: "Überblick", icon: "grid" }, { id: "nachweise", label: "Nachweise", icon: "proof", count: evidence.length }, { id: "freigaben", label: "Freigaben", icon: "share", count: customers.filter((customer) => customer.shared).length }, { id: "massnahmen", label: "Maßnahmen", icon: "task", count: openTasks.length },
  ];
  function showNotice(message: string) { setNotice(message); }
  function closeDialog() { setDialog(null); setError(""); }
  async function updateTask(id: string, status: TaskStatus) { try { const response = await api<{ task: ApiTask }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: taskStatusApi[status] }) }); setTasks((items) => items.map((item) => item.id === id ? mapTask(response.task, evidence) : item)); showNotice("Maßnahme gespeichert."); } catch (requestFailure) { showNotice(requestFailure instanceof Error ? requestFailure.message : "Maßnahme konnte nicht gespeichert werden."); } }
  async function toggleCustomer(id: string) { const current = customers.find((customer) => customer.id === id); if (!current) return; try { const response = await api<{ customer: ApiCustomer }>(`/api/customers/${id}/share`, { method: "PATCH", body: JSON.stringify({ shareState: current.shared ? "private" : "shared" }) }); setCustomers((items) => items.map((item) => item.id === id ? mapCustomer(response.customer) : item)); showNotice("Freigabe aktualisiert."); } catch (requestFailure) { showNotice(requestFailure instanceof Error ? requestFailure.message : "Freigabe konnte nicht gespeichert werden."); } }
  async function addTask(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { const response = await api<{ task: ApiTask }>("/api/tasks", { method: "POST", body: JSON.stringify({ title: data.get("title"), assignee: data.get("owner"), dueDate: data.get("due"), evidenceId: data.get("evidence") || null, status: "open" }) }); setTasks((items) => [...items, mapTask(response.task, evidence)]); closeDialog(); showNotice("Maßnahme angelegt."); } catch (requestFailure) { setError(requestFailure instanceof Error ? requestFailure.message : "Maßnahme konnte nicht angelegt werden."); } }
  async function addEvidence(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { const response = await api<{ evidence: ApiEvidence }>("/api/evidence", { method: "POST", body: JSON.stringify({ title: data.get("title"), area: data.get("area"), level: data.get("level"), validUntil: data.get("validUntil"), status: "needs_review" }) }); setEvidence((items) => [...items, mapEvidence(response.evidence)]); closeDialog(); showNotice("Nachweis erfasst. Er bleibt privat bis zur Freigabe."); } catch (requestFailure) { setError(requestFailure instanceof Error ? requestFailure.message : "Nachweis konnte nicht erfasst werden."); } }
  async function addCustomer(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { const response = await api<{ customer: ApiCustomer }>("/api/customers", { method: "POST", body: JSON.stringify({ companyName: data.get("name"), contactEmail: data.get("email"), shareState: "private" }) }); setCustomers((items) => [...items, mapCustomer(response.customer)]); closeDialog(); showNotice("Kunde angelegt. Freigabe bleibt zunächst privat."); } catch (requestFailure) { setError(requestFailure instanceof Error ? requestFailure.message : "Kunde konnte nicht angelegt werden."); } }
  async function logout() { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); router.replace("/anmelden"); }

  if (loading) return <main className="workspace-loading">Arbeitsbereich wird geladen.</main>;
  if (loadError) return <main className="workspace-loading"><p>{loadError}</p><Link href="/anmelden">Zur Anmeldung</Link></main>;
  return <main className="workspace-shell"><aside className="workspace-sidebar" aria-label="Arbeitsbereich Navigation"><Brand /><div className="workspace-org"><span>{organizationName.slice(0, 1).toUpperCase()}</span><div><b>{organizationName}</b><small>Zulieferer · Deutschland</small></div></div><p className="workspace-nav-label">Arbeitsbereiche</p><nav className="workspace-nav">{navigation.map((item, index) => <button key={item.id} type="button" aria-current={view === item.id ? "page" : undefined} className={view === item.id ? "is-active" : ""} onClick={() => setView(item.id)}><small>0{index + 1}</small><Icon name={item.icon} /><span>{item.label}</span>{item.count !== undefined && <b>{item.count}</b>}</button>)}</nav><div className="workspace-sidebar-bottom"><button type="button" onClick={logout}><Icon name="exit" />Abmelden</button><small>Prooflane Operations<br />Session geschützt</small></div></aside><section className="workspace-main"><header className="workspace-header"><div className="workspace-header-context"><small>Aktiver Bereich</small><p>{organizationName.toUpperCase()} <span>/</span> {navigation.find((item) => item.id === view)?.label}</p></div><div className="workspace-user"><span className="workspace-avatar">{name.slice(0, 1).toUpperCase()}</span><p><b>{name}</b><small>Owner</small></p></div></header><div className="workspace-content">{notice && <div className="workspace-notice" role="status"><Icon name="check" /><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Hinweis schließen"><Icon name="close" /></button></div>}{view === "ueberblick" && <Overview name={name} tasks={openTasks} attentionEvidence={attentionEvidence} sharedCount={customers.filter((customer) => customer.shared).length} onView={setView} onUpdateTask={updateTask} />}{view === "nachweise" && <EvidenceView evidence={evidence} onAdd={() => setDialog("evidence")} />}{view === "freigaben" && <ApprovalsView customers={customers} onAdd={() => setDialog("customer")} onToggle={toggleCustomer} />}{view === "massnahmen" && <MeasuresView tasks={tasks} evidence={evidence} onAdd={() => setDialog("task")} onUpdate={updateTask} />}</div></section>{dialog === "task" && <WorkDialog title="Maßnahme anlegen" error={error} onClose={closeDialog}><TaskForm evidence={evidence} onSubmit={addTask} /></WorkDialog>}{dialog === "evidence" && <WorkDialog title="Nachweis erfassen" error={error} onClose={closeDialog}><EvidenceForm onSubmit={addEvidence} /></WorkDialog>}{dialog === "customer" && <WorkDialog title="Kunde hinzufügen" error={error} onClose={closeDialog}><CustomerForm onSubmit={addCustomer} /></WorkDialog>}</main>;
}

function Overview({ name, tasks, attentionEvidence, sharedCount, onView, onUpdateTask }: { name: string; tasks: Task[]; attentionEvidence: Evidence[]; sharedCount: number; onView: (view: View) => void; onUpdateTask: (id: string, status: TaskStatus) => void }) { const firstName = name.trim().split(/\s+/)[0] || "Team"; return <><div className="workspace-page-title workspace-page-title-overview"><div><span className="workspace-eyebrow">Control Center / 01</span><h1 className="text-balance">Guten Tag, {firstName}.</h1><p className="text-pretty">Hier liegen alle Punkte, die vor nächster Kundenfreigabe zählen.</p></div><button className="workspace-primary" onClick={() => onView("massnahmen")}><Icon name="task" />Maßnahmen öffnen</button></div><section className="workspace-summary" aria-label="Zusammenfassung"><div className="summary-urgent"><small>01 / Handlungsdruck</small><b>{tasks.length}</b><span>offene Maßnahmen</span></div><div><small>02 / Evidenz</small><b>{attentionEvidence.length}</b><span>Nachweise prüfen</span></div><div><small>03 / Verbindungen</small><b>{sharedCount}</b><span>Kunden freigegeben</span></div></section><section className="workspace-section"><SectionHeading title="Nächste Maßnahmen" copy="Status direkt in Liste ändern." action="Alle Maßnahmen" onClick={() => onView("massnahmen")} />{tasks.length ? <TaskTable tasks={tasks.slice(0, 4)} onUpdate={onUpdateTask} /> : <EmptyState text="Keine offenen Maßnahmen." action="Maßnahmen öffnen" onAction={() => onView("massnahmen")} />}</section><section className="workspace-section"><SectionHeading title="Nachweise mit Handlungsbedarf" copy="Neue Nachweise bleiben bis Freigabe privat." action="Nachweise" onClick={() => onView("nachweise")} />{attentionEvidence.length ? <EvidenceTable evidence={attentionEvidence} /> : <EmptyState text="Keine Nachweise mit Handlungsbedarf." action="Nachweis erfassen" onAction={() => onView("nachweise")} />}</section></>; }
function SectionHeading({ title, copy, action, onClick }: { title: string; copy: string; action: string; onClick: () => void }) { return <div className="workspace-section-heading"><div><h2 className="text-balance">{title}</h2><p className="text-pretty">{copy}</p></div><button className="workspace-text-button" onClick={onClick}>{action} <Icon name="arrow" /></button></div>; }
function EvidenceView({ evidence, onAdd }: { evidence: Evidence[]; onAdd: () => void }) { return <><PageTitle title="Nachweise" copy="Dokumentiert, geprüft und gezielt freigegeben." action="Nachweis erfassen" icon="plus" onClick={onAdd} /><EvidenceTable evidence={evidence} /></>; }
function ApprovalsView({ customers, onAdd, onToggle }: { customers: Customer[]; onAdd: () => void; onToggle: (id: string) => void }) { return <><PageTitle title="Freigaben" copy="Kunden sehen nur bewusst freigegebene Bereiche." action="Kunde hinzufügen" icon="plus" onClick={onAdd} /><div className="workspace-table-wrap"><table className="workspace-table approvals-table"><thead><tr><th>Kunde</th><th>E-Mail</th><th>Umfang</th><th>Status</th><th /></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><b>{customer.name}</b></td><td>{customer.email}</td><td>{customer.scope}</td><td><Status value={customer.shared ? "Freigegeben" : "Privat"} /></td><td><button className="workspace-inline-action" onClick={() => onToggle(customer.id)}>{customer.shared ? "Freigabe stoppen" : "Freigeben"}</button></td></tr>)}</tbody></table></div></>; }
function MeasuresView({ tasks, evidence, onAdd, onUpdate }: { tasks: Task[]; evidence: Evidence[]; onAdd: () => void; onUpdate: (id: string, status: TaskStatus) => void }) { return <><PageTitle title="Maßnahmen" copy="Zuständigkeit, Termin und Status in einer Liste." action="Maßnahme anlegen" icon="plus" onClick={onAdd} />{tasks.length ? <TaskTable tasks={tasks} onUpdate={onUpdate} /> : <EmptyState text="Noch keine Maßnahmen angelegt." action="Maßnahme anlegen" onAction={onAdd} />}{evidence.length === 0 && <EmptyState text="Erfassen Sie zuerst einen Nachweis." action="Nachweis erfassen" onAction={onAdd} />}</>; }
function PageTitle({ title, copy, action, icon, onClick }: { title: string; copy: string; action: string; icon: "plus"; onClick: () => void }) { return <div className="workspace-page-title"><div><span className="workspace-eyebrow">Workspace / {title}</span><h1 className="text-balance">{title}</h1><p className="text-pretty">{copy}</p></div><button className="workspace-primary" onClick={onClick}><Icon name={icon} />{action}</button></div>; }
function TaskTable({ tasks, onUpdate }: { tasks: Task[]; onUpdate: (id: string, status: TaskStatus) => void }) { return <div className="workspace-table-wrap"><table className="workspace-table task-table"><thead><tr><th>Maßnahme</th><th>Nachweis</th><th>Verantwortlich</th><th>Fällig</th><th>Status</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td><b>{task.title}</b></td><td>{task.evidence || "—"}</td><td>{task.owner}</td><td>{task.due}</td><td><label className="workspace-select-label"><span className="sr-only">Status für {task.title}</span><select value={task.status} onChange={(event) => onUpdate(task.id, event.target.value as TaskStatus)}><option>Offen</option><option>In Arbeit</option><option>Erledigt</option></select></label></td></tr>)}</tbody></table></div>; }
function EvidenceTable({ evidence }: { evidence: Evidence[] }) { return <div className="workspace-table-wrap"><table className="workspace-table evidence-table"><thead><tr><th>Nachweis</th><th>Bereich</th><th>Stufe</th><th>Gültig bis</th><th>Status</th></tr></thead><tbody>{evidence.map((item) => <tr key={item.id}><td><b>{item.title}</b></td><td>{item.area}</td><td>{item.level}</td><td>{item.validUntil}</td><td><Status value={item.status} /></td></tr>)}</tbody></table></div>; }
function EmptyState({ text, action, onAction }: { text: string; action: string; onAction: () => void }) { return <div className="workspace-empty"><p>{text}</p><button className="workspace-text-button" onClick={onAction}>{action} <Icon name="arrow" /></button></div>; }
function WorkDialog({ title, error, onClose, children }: { title: string; error: string; onClose: () => void; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const focusFrame = window.requestAnimationFrame(() => (dialog.querySelector<HTMLElement>("input, select") ?? dialog.querySelector<HTMLElement>("button"))?.focus());
    return () => { window.cancelAnimationFrame(focusFrame); if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={dialogRef} className="workspace-dialog" aria-modal="true" aria-labelledby="work-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}><div className="workspace-dialog-header"><div><span>Neuer Eintrag</span><h2 id="work-dialog-title" className="text-balance">{title}</h2></div><button type="button" onClick={onClose} aria-label="Dialog schließen"><Icon name="close" /></button></div>{children}{error && <p className="workspace-form-error" role="alert">{error}</p>}<p className="workspace-dialog-note">Änderungen werden sicher im Arbeitsbereich gespeichert.</p></dialog>;
}
function TaskForm({ evidence, onSubmit }: { evidence: Evidence[]; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form className="workspace-form" onSubmit={onSubmit}><label>Maßnahme<input name="title" required placeholder="z. B. MFA-Nachweis aktualisieren" /></label><label>Verantwortlich<input name="owner" required placeholder="Name oder Team" /></label><div className="workspace-form-grid"><label>Termin<input name="due" required type="date" /></label><label>Verknüpfter Nachweis<select name="evidence"><option value="">Nicht zugeordnet</option>{evidence.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></div><button className="workspace-primary" type="submit">Maßnahme speichern</button></form>; }
function EvidenceForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form className="workspace-form" onSubmit={onSubmit}><label>Name des Nachweises<input name="title" required placeholder="z. B. Netzwerksegmentierung" /></label><div className="workspace-form-grid"><label>Bereich<select name="area" defaultValue=""><option value="" disabled>Bitte wählen</option><option>Informationssicherheit</option><option>Notfallmanagement</option><option>Lieferkette</option></select></label><label>Stufe<select name="level"><option>Selbstauskunft</option><option>Technisch belegt</option><option>Extern bestätigt</option></select></label></div><label>Gültig bis<input name="validUntil" required type="date" /></label><button className="workspace-primary" type="submit">Nachweis erfassen</button></form>; }
function CustomerForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form className="workspace-form" onSubmit={onSubmit}><label>Unternehmen<input name="name" required placeholder="Unternehmensname" /></label><label>Kontakt-E-Mail<input name="email" required type="email" placeholder="kontakt@unternehmen.de" /></label><button className="workspace-primary" type="submit">Kunde anlegen</button></form>; }
