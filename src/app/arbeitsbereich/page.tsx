"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./arbeitsbereich.css";

type View = "ueberblick" | "eingang" | "nachweise" | "freigaben" | "massnahmen";
type TaskStatus = "Offen" | "In Arbeit" | "Erledigt";
type EvidenceStatus = "Aktuell" | "Prüfung nötig" | "Läuft bald ab";
type EvidenceFilter = "Alle" | EvidenceStatus;
type CustomerFilter = "Alle" | "Freigegeben" | "Privat";
type TaskFilter = "Alle" | "Überfällig" | "Nächste 7 Tage" | "Ohne Zuordnung";
type SignalFilter = "Alle" | "Kritisch" | "Nachweise" | "Kunden";
type Dialog = "task" | "evidence" | "customer" | "shortcuts" | null;
type Notice = { message: string; tone: "success" | "error" | "info" };
type Task = { id: string; title: string; owner: string; due: string; status: TaskStatus; evidence?: string };
type Evidence = { id: string; title: string; area: string; level: string; validUntil: string; status: EvidenceStatus; documentCount: number };
type Customer = { id: string; name: string; email: string; scope: string; shared: boolean; evidenceCount: number; currentEvidenceCount: number; updatedAt: string };
type AuditEvent = { id: string; entityType: string; entityId: string; action: string; metadataJson: string; createdAt: string; actorName: string | null };
type Signal = { id: string; category: "Nachweise" | "Kunden" | "Maßnahmen"; tone: "critical" | "warning" | "info"; title: string; copy: string; meta: string; view: View; customerId?: string };
type IconName = "grid" | "inbox" | "proof" | "share" | "task" | "plus" | "close" | "arrow" | "check" | "exit" | "search" | "copy" | "upload" | "download" | "clock" | "bolt" | "help" | "brief" | "trash";

type ApiError = { error?: string };
type ApiEvidence = { id: string; title: string; area: string; level: string; validUntil: string | null; status: "draft" | "needs_review" | "approved" | "expired"; documentCount?: number };
type ApiEvidenceDocument = { id: string; originalName: string; sizeBytes: number; source: "upload" | "generated"; createdAt: string };
type ApiTask = { id: string; title: string; assignee: string | null; dueDate: string | null; status: "open" | "in_progress" | "complete"; evidenceId: string | null; evidenceTitle?: string | null };
type ApiCustomer = { id: string; companyName: string; contactEmail: string; scopeDescription: string; shareState: "private" | "shared"; evidenceCount?: number; currentEvidenceCount?: number; updatedAt?: string };

const taskStatus: Record<ApiTask["status"], TaskStatus> = { open: "Offen", in_progress: "In Arbeit", complete: "Erledigt" };
const taskStatusApi: Record<TaskStatus, ApiTask["status"]> = { Offen: "open", "In Arbeit": "in_progress", Erledigt: "complete" };
const taskColumns: TaskStatus[] = ["Offen", "In Arbeit", "Erledigt"];
const evidenceStatus: Record<ApiEvidence["status"], EvidenceStatus> = { draft: "Prüfung nötig", needs_review: "Prüfung nötig", approved: "Aktuell", expired: "Läuft bald ab" };
const viewIds: View[] = ["ueberblick", "eingang", "nachweise", "freigaben", "massnahmen"];

function Icon({ name }: { name: IconName }) {
  const props = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "grid") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx=".7" {...props} /><rect x="12" y="3" width="5" height="5" rx=".7" {...props} /><rect x="3" y="12" width="5" height="5" rx=".7" {...props} /><rect x="12" y="12" width="5" height="5" rx=".7" {...props} /></svg>;
  if (name === "inbox") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14v12H3zM3 11h4l1.5 2h3l1.5-2h4" {...props} /></svg>;
  if (name === "proof") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.8h7l3 3V17H5zM12 2.8V6h3" {...props} /><path d="m7.2 11 1.5 1.5 3.5-3.6" {...props} /></svg>;
  if (name === "share") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="10" r="2" {...props} /><circle cx="15" cy="5" r="2" {...props} /><circle cx="15" cy="15" r="2" {...props} /><path d="m6.8 9 6.2-3M6.8 11l6.2 3" {...props} /></svg>;
  if (name === "task") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" {...props} /><path d="m6.5 10 2.2 2.2 4.8-4.8" {...props} /></svg>;
  if (name === "plus") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" {...props} /></svg>;
  if (name === "close") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" {...props} /></svg>;
  if (name === "arrow") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h12M11 5l5 5-5 5" {...props} /></svg>;
  if (name === "check") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.5 3.2 3.2 7.8-7.8" {...props} /></svg>;
  if (name === "search") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" {...props} /><path d="m12.2 12.2 4 4" {...props} /></svg>;
  if (name === "copy") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6.5" y="6.5" width="10" height="10" rx="1.5" {...props} /><path d="M13.5 6.5v-3h-10v10h3" {...props} /></svg>;
  if (name === "upload") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 12v4h12v-4" {...props} /></svg>;
  if (name === "download") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10m0 0 3.5-3.5M10 13 6.5 9.5M4 16h12" {...props} /></svg>;
  if (name === "clock") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" {...props} /><path d="M10 6v4l3 2" {...props} /></svg>;
  if (name === "bolt") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m11.5 2.5-7 9h5l-1 6 7-9h-5z" {...props} /></svg>;
  if (name === "help") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" {...props} /><path d="M8.2 7.5a2 2 0 1 1 2.4 2c-.6.2-.9.7-.9 1.4M10 14h.01" {...props} /></svg>;
  if (name === "brief") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" {...props} /></svg>;
  if (name === "trash") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3h4l1 3H7zM6 6l.7 11h6.6L14 6M8.5 9v5M11.5 9v5" {...props} /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 3H4v14h4M11 6l4 4-4 4M6 10h9" {...props} /></svg>;
}

function Brand() {
  return <Link className="workspace-brand" href="/arbeitsbereich" aria-label="Prooflane Operations Arbeitsbereich"><span className="workspace-brand-symbol" aria-hidden="true"><i /><i /></span><span className="workspace-brand-name"><b>Prooflane</b><small>Operations</small></span></Link>;
}

function Status({ value }: { value: TaskStatus | EvidenceStatus | "Freigegeben" | "Privat" }) {
  const slug = value.toLowerCase().replaceAll(" ", "-").replace("ü", "ue").replace("ä", "ae");
  return <span className={"workspace-status status-" + slug}>{value}</span>;
}

function normalize(value: string) {
  return value.toLocaleLowerCase("de-DE").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchesQuery(query: string, values: Array<string | undefined>) {
  const needle = normalize(query.trim());
  return values.some((value) => normalize(value || "").includes(needle));
}

function todayIso() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value || value === "—") return "Kein Termin";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00"));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function dueMeta(task: Task) {
  if (task.status === "Erledigt") return { label: "Erledigt", tone: "done" };
  if (!task.due || task.due === "—") return { label: "Ohne Termin", tone: "neutral" };
  const today = todayIso();
  if (task.due < today) return { label: "Überfällig · " + formatDate(task.due), tone: "late" };
  if (task.due === today) return { label: "Heute fällig", tone: "today" };
  return { label: "Fällig " + formatDate(task.due), tone: "normal" };
}

function mapEvidence(item: ApiEvidence): Evidence {
  return { id: item.id, title: item.title, area: item.area, level: item.level, validUntil: item.validUntil || "—", status: evidenceStatus[item.status], documentCount: item.documentCount || 0 };
}

function mapTask(item: ApiTask, evidence: Evidence[]): Task {
  return { id: item.id, title: item.title, owner: item.assignee || "Nicht zugeordnet", due: item.dueDate || "—", status: taskStatus[item.status], evidence: item.evidenceTitle || evidence.find((entry) => entry.id === item.evidenceId)?.title };
}

function mapCustomer(item: ApiCustomer): Customer {
  return { id: item.id, name: item.companyName, email: item.contactEmail, scope: item.scopeDescription || "Noch keine Nachweise ausgewählt", shared: item.shareState === "shared", evidenceCount: item.evidenceCount || 0, currentEvidenceCount: item.currentEvidenceCount || 0, updatedAt: item.updatedAt || new Date().toISOString() };
}

function buildSignals(tasks: Task[], evidence: Evidence[], customers: Customer[]) {
  const today = todayIso();
  const signals: Signal[] = [];
  for (const task of tasks) {
    if (task.status !== "Erledigt" && task.due !== "—" && task.due < today) signals.push({ id: "task-overdue-" + task.id, category: "Maßnahmen", tone: "critical", title: task.title, copy: "Die Maßnahme ist überfällig und blockiert die Freigabebereitschaft.", meta: dueMeta(task).label + " · " + task.owner, view: "massnahmen" });
  }
  for (const item of evidence) {
    if (item.status !== "Aktuell") signals.push({ id: "evidence-review-" + item.id, category: "Nachweise", tone: item.status === "Läuft bald ab" ? "critical" : "warning", title: item.title, copy: item.status === "Läuft bald ab" ? "Der Nachweis ist abgelaufen oder erreicht bald sein Fristende." : "Der Nachweis benötigt eine fachliche Prüfung.", meta: item.area + " · " + formatDate(item.validUntil), view: "nachweise" });
  }
  for (const customer of customers) {
    if (customer.shared && customer.evidenceCount === 0) signals.push({ id: "customer-empty-" + customer.id, category: "Kunden", tone: "critical", title: customer.name + " sieht noch keine Nachweise", copy: "Der Kundenzugriff ist aktiv, aber der freigegebene Umfang ist leer.", meta: customer.email, view: "freigaben", customerId: customer.id });
    else if (customer.shared && customer.currentEvidenceCount < customer.evidenceCount) signals.push({ id: "customer-review-" + customer.id, category: "Kunden", tone: "warning", title: customer.name + " erhält prüfbedürftige Evidenz", copy: "Mindestens ein ausgewählter Nachweis ist nicht aktuell.", meta: customer.currentEvidenceCount + " von " + customer.evidenceCount + " Nachweisen aktuell", view: "freigaben", customerId: customer.id });
  }
  return signals;
}

function csvCell(value: string | number) {
  return '"' + String(value).replaceAll('"', '""') + '"';
}

function downloadCsv(fileName: string, headers: string[], rows: Array<Array<string | number>>) {
  const contents = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: "same-origin", headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null) as T & ApiError;
  if (!response.ok) throw new Error(body?.error || "Serveranfrage fehlgeschlagen.");
  return body;
}

export default function ArbeitsbereichPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<View>("ueberblick");
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [documents, setDocuments] = useState<Record<string, ApiEvidenceDocument[]>>({});
  const [dialog, setDialog] = useState<Dialog>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [grantCustomer, setGrantCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState("");
  const [pendingCustomerId, setPendingCustomerId] = useState("");
  const [uploadingEvidenceId, setUploadingEvidenceId] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [dismissedSignals, setDismissedSignals] = useState<string[]>([]);

  useEffect(() => {
    function restoreViewFromHash() {
      const hash = window.location.hash.slice(1) as View;
      if (viewIds.includes(hash)) setView(hash);
    }
    const frame = window.requestAnimationFrame(() => {
      restoreViewFromHash();
      try {
        const stored = JSON.parse(window.localStorage.getItem("prooflane-dismissed-signals") || "{}") as { date?: string; ids?: string[] };
        if (stored.date === todayIso() && Array.isArray(stored.ids)) setDismissedSignals(stored.ids);
      } catch {
        window.localStorage.removeItem("prooflane-dismissed-signals");
      }
    });
    window.addEventListener("hashchange", restoreViewFromHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restoreViewFromHash);
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      try {
        const [me, evidenceResponse, taskResponse, customerResponse, auditResponse] = await Promise.all([
          api<{ user: { name: string; organizationName: string } }>("/api/auth/me"),
          api<{ evidence: ApiEvidence[] }>("/api/evidence"),
          api<{ tasks: ApiTask[] }>("/api/tasks"),
          api<{ customers: ApiCustomer[] }>("/api/customers"),
          api<{ events: AuditEvent[] }>("/api/audit?limit=12").catch(() => ({ events: [] })),
        ]);
        if (!active) return;
        const mappedEvidence = evidenceResponse.evidence.map(mapEvidence);
        setName(me.user.name);
        setOrganizationName(me.user.organizationName);
        setEvidence(mappedEvidence);
        setTasks(taskResponse.tasks.map((item) => mapTask(item, mappedEvidence)));
        setCustomers(customerResponse.customers.map(mapCustomer));
        setEvents(auditResponse.events);
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

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const editing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (!editing && event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (!editing && !dialog && !grantCustomer && !taskToDelete && event.key === "?") {
        event.preventDefault();
        setDialog("shortcuts");
        return;
      }
      const index = Number(event.key) - 1;
      if (!editing && !event.metaKey && !event.ctrlKey && !event.altKey && !dialog && !grantCustomer && !taskToDelete && index >= 0 && index < viewIds.length) {
        const nextView = viewIds[index];
        setView(nextView);
        setQuery("");
        window.history.replaceState(null, "", "#" + nextView);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, grantCustomer, taskToDelete]);

  const openTasks = tasks.filter((task) => task.status !== "Erledigt");
  const attentionEvidence = evidence.filter((item) => item.status !== "Aktuell");
  const allSignals = buildSignals(tasks, evidence, customers);
  const signals = allSignals.filter((signal) => !dismissedSignals.includes(signal.id));
  const navigation: { id: View; label: string; icon: "grid" | "inbox" | "proof" | "share" | "task"; count?: number }[] = [
    { id: "ueberblick", label: "Überblick", icon: "grid" },
    { id: "eingang", label: "Eingang", icon: "inbox", count: signals.length },
    { id: "nachweise", label: "Nachweise", icon: "proof", count: evidence.length },
    { id: "freigaben", label: "Freigaben", icon: "share", count: customers.filter((customer) => customer.shared).length },
    { id: "massnahmen", label: "Maßnahmen", icon: "task", count: openTasks.length },
  ];

  function changeView(nextView: View) {
    setView(nextView);
    setQuery("");
    window.history.replaceState(null, "", "#" + nextView);
  }

  function showNotice(message: string, tone: Notice["tone"] = "success") {
    setNotice({ message, tone });
  }

  function dismissSignal(id: string) {
    setDismissedSignals((current) => {
      const next = [...new Set([...current, id])];
      window.localStorage.setItem("prooflane-dismissed-signals", JSON.stringify({ date: todayIso(), ids: next }));
      return next;
    });
  }

  function restoreSignals() {
    setDismissedSignals([]);
    window.localStorage.removeItem("prooflane-dismissed-signals");
  }

  function closeDialog() {
    if (saving) return;
    setDialog(null);
    setError("");
  }

  async function updateTask(id: string, status: TaskStatus) {
    setPendingTaskId(id);
    try {
      const response = await api<{ task: ApiTask }>("/api/tasks/" + id, { method: "PATCH", body: JSON.stringify({ status: taskStatusApi[status] }) });
      setTasks((items) => items.map((item) => item.id === id ? mapTask(response.task, evidence) : item));
      showNotice("Maßnahme gespeichert.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "Maßnahme konnte nicht gespeichert werden.", "error");
    } finally {
      setPendingTaskId("");
    }
  }

  async function deleteTask() {
    if (!taskToDelete) return;
    const task = taskToDelete;
    setPendingTaskId(task.id);
    try {
      await api<void>("/api/tasks/" + task.id, { method: "DELETE" });
      setTasks((items) => items.filter((item) => item.id !== task.id));
      setTaskToDelete(null);
      showNotice("Maßnahme gelöscht.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "Maßnahme konnte nicht gelöscht werden.", "error");
    } finally {
      setPendingTaskId("");
    }
  }

  async function bulkUpdateTasks(ids: string[], status: TaskStatus) {
    setBulkSaving(true);
    try {
      const response = await api<{ tasks: ApiTask[] }>("/api/tasks/bulk", { method: "PATCH", body: JSON.stringify({ ids, status: taskStatusApi[status] }) });
      const updates = new Map(response.tasks.map((item) => [item.id, mapTask(item, evidence)]));
      setTasks((items) => items.map((item) => updates.get(item.id) || item));
      showNotice(ids.length + " Maßnahmen aktualisiert.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "Maßnahmen konnten nicht aktualisiert werden.", "error");
      throw requestFailure;
    } finally {
      setBulkSaving(false);
    }
  }

  async function toggleCustomer(id: string) {
    const current = customers.find((customer) => customer.id === id);
    if (!current) return;
    setPendingCustomerId(id);
    try {
      const response = await api<{ customer: ApiCustomer }>("/api/customers/" + id + "/share", { method: "PATCH", body: JSON.stringify({ shareState: current.shared ? "private" : "shared" }) });
      setCustomers((items) => items.map((item) => item.id === id ? mapCustomer(response.customer) : item));
      showNotice(current.shared ? "Freigabe gestoppt." : "Kundenzugriff freigegeben.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "Freigabe konnte nicht gespeichert werden.", "error");
    } finally {
      setPendingCustomerId("");
    }
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      showNotice("E-Mail-Adresse kopiert.");
    } catch {
      showNotice("E-Mail-Adresse konnte nicht kopiert werden.", "error");
    }
  }

  async function copyCustomerBriefing(customer: Customer) {
    try {
      const response = await api<{ evidence: ApiEvidence[] }>("/api/customers/" + customer.id + "/evidence");
      const list = response.evidence.length
        ? response.evidence.map((item) => "• " + item.title + " – " + item.area + " – " + evidenceStatus[item.status]).join("\n")
        : "• Noch keine Nachweise ausgewählt";
      const briefing = [
        "Prooflane Kundenbriefing",
        customer.name,
        "",
        "Kontakt: " + customer.email,
        "Freigabe: " + (customer.shared ? "Aktiv" : "Privat"),
        "Umfang: " + customer.scope,
        "",
        "Ausgewählte Nachweise:",
        list,
      ].join("\n");
      await navigator.clipboard.writeText(briefing);
      showNotice("Kundenbriefing kopiert.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "Kundenbriefing konnte nicht kopiert werden.", "error");
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const response = await api<{ task: ApiTask }>("/api/tasks", { method: "POST", body: JSON.stringify({ title: data.get("title"), assignee: data.get("owner"), dueDate: data.get("due"), evidenceId: data.get("evidence") || null, status: "open" }) });
      setTasks((items) => [...items, mapTask(response.task, evidence)]);
      setDialog(null);
      showNotice("Maßnahme angelegt.");
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Maßnahme konnte nicht angelegt werden.");
    } finally {
      setSaving(false);
    }
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const response = await api<{ evidence: ApiEvidence }>("/api/evidence", { method: "POST", body: JSON.stringify({ title: data.get("title"), area: data.get("area"), level: data.get("level"), validUntil: data.get("validUntil"), status: "needs_review" }) });
      setEvidence((items) => [...items, mapEvidence(response.evidence)]);
      setDialog(null);
      showNotice("Nachweis erfasst. Er bleibt privat bis zur Freigabe.");
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Nachweis konnte nicht erfasst werden.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPdf(id: string, file: File) {
    setUploadingEvidenceId(id);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/evidence/" + id + "/documents", { method: "POST", credentials: "same-origin", body: form });
      const body = await response.json().catch(() => null) as { document?: ApiEvidenceDocument } & ApiError;
      if (!response.ok || !body?.document) throw new Error(body?.error || "PDF konnte nicht angehängt werden.");
      setEvidence((items) => items.map((item) => item.id === id ? { ...item, documentCount: item.documentCount + 1 } : item));
      setDocuments((items) => ({ ...items, [id]: [body.document!, ...(items[id] || [])] }));
      showNotice("PDF sicher am Nachweis angehängt.");
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "PDF konnte nicht angehängt werden.", "error");
    } finally {
      setUploadingEvidenceId("");
    }
  }

  async function toggleDocuments(id: string) {
    if (documents[id]) {
      setDocuments((items) => {
        const next = { ...items };
        delete next[id];
        return next;
      });
      return;
    }
    try {
      const response = await api<{ documents: ApiEvidenceDocument[] }>("/api/evidence/" + id + "/documents");
      setDocuments((items) => ({ ...items, [id]: response.documents }));
    } catch (requestFailure) {
      showNotice(requestFailure instanceof Error ? requestFailure.message : "PDFs konnten nicht geladen werden.", "error");
    }
  }

  async function addCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const response = await api<{ customer: ApiCustomer }>("/api/customers", { method: "POST", body: JSON.stringify({ companyName: data.get("name"), contactEmail: data.get("email"), scopeDescription: data.get("scope"), shareState: "private" }) });
      setCustomers((items) => [...items, mapCustomer(response.customer)]);
      setDialog(null);
      showNotice("Kunde angelegt. Freigabe bleibt zunächst privat.");
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Kunde konnte nicht angelegt werden.");
    } finally {
      setSaving(false);
    }
  }

  function updateCustomerScope(customerId: string, selectedIds: string[]) {
    const areas = [...new Set(evidence.filter((item) => selectedIds.includes(item.id)).map((item) => item.area))];
    const currentEvidenceCount = evidence.filter((item) => selectedIds.includes(item.id) && item.status === "Aktuell").length;
    setCustomers((items) => items.map((customer) => customer.id === customerId ? { ...customer, scope: areas.join(", ") || "Noch keine Nachweise ausgewählt", evidenceCount: selectedIds.length, currentEvidenceCount, updatedAt: new Date().toISOString() } : customer));
    setGrantCustomer(null);
    showNotice("Nachweise für den Kunden gespeichert.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.replace("/anmelden");
  }

  if (loading) return <main className="workspace-loading">Arbeitsbereich wird geladen.</main>;
  if (loadError) return <main className="workspace-loading"><p>{loadError}</p><Link href="/anmelden">Zur Anmeldung</Link></main>;

  const currentLabel = navigation.find((item) => item.id === view)?.label || "Überblick";
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar" aria-label="Arbeitsbereich Navigation">
        <Brand />
        <div className="workspace-org"><span>{organizationName.slice(0, 1).toUpperCase()}</span><div><b>{organizationName}</b><small>Zulieferer · Deutschland</small></div></div>
        <p className="workspace-nav-label">Arbeitsbereiche</p>
        <nav className="workspace-nav">
          {navigation.map((item, index) => <button key={item.id} type="button" aria-current={view === item.id && !query ? "page" : undefined} className={view === item.id && !query ? "is-active" : ""} onClick={() => changeView(item.id)}><small>0{index + 1}</small><Icon name={item.icon} /><span>{item.label}</span>{item.count !== undefined && <b>{item.count}</b>}</button>)}
        </nav>
        <button className="workspace-sidebar-help" type="button" onClick={() => setDialog("shortcuts")}><Icon name="help" /><span>Hilfe & Kürzel</span><kbd>?</kbd></button>
        <div className="workspace-sidebar-bottom"><button type="button" onClick={logout}><Icon name="exit" />Abmelden</button><small>Prooflane Operations<br />Session geschützt</small></div>
      </aside>

      <section className="workspace-main">
        <header className="workspace-header">
          <div className="workspace-header-context"><small>Aktiver Bereich</small><p>{organizationName.toUpperCase()} <span>/</span> {query ? "Suche" : currentLabel}</p></div>
          <div className="workspace-global-search" role="search">
            <Icon name="search" />
            <input ref={searchRef} type="search" aria-label="Arbeitsbereich durchsuchen" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nachweise, Kunden, Maßnahmen durchsuchen" />
            {query ? <button type="button" onClick={() => setQuery("")} aria-label="Suche leeren"><Icon name="close" /></button> : <kbd>⌘ K</kbd>}
          </div>
          <div className="workspace-user"><span className="workspace-avatar">{name.slice(0, 1).toUpperCase()}</span><p><b>{name}</b><small>Owner</small></p></div>
        </header>

        <div className="workspace-content">
          {notice && <div className={"workspace-notice workspace-notice-" + notice.tone} role={notice.tone === "error" ? "alert" : "status"}><Icon name={notice.tone === "error" ? "help" : "check"} /><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Hinweis schließen"><Icon name="close" /></button></div>}
          {query ? <SearchResults query={query} tasks={tasks} evidence={evidence} customers={customers} onOpen={changeView} onClear={() => setQuery("")} /> : <>
            {view === "ueberblick" && <Overview name={name} tasks={openTasks} allEvidence={evidence} attentionEvidence={attentionEvidence} sharedCount={customers.filter((customer) => customer.shared).length} signalCount={signals.length} events={events} onView={changeView} onUpdateTask={updateTask} pendingTaskId={pendingTaskId} onAddTask={() => setDialog("task")} onAddEvidence={() => setDialog("evidence")} onAddCustomer={() => setDialog("customer")} onHelp={() => setDialog("shortcuts")} />}
            {view === "eingang" && <InboxView signals={signals} dismissedCount={allSignals.length - signals.length} customers={customers} onOpen={changeView} onConfigureCustomer={setGrantCustomer} onDismiss={dismissSignal} onRestore={restoreSignals} />}
            {view === "nachweise" && <EvidenceView evidence={evidence} documents={documents} uploadingEvidenceId={uploadingEvidenceId} onAdd={() => setDialog("evidence")} onUpload={uploadPdf} onToggleDocuments={toggleDocuments} />}
            {view === "freigaben" && <ApprovalsView customers={customers} pendingCustomerId={pendingCustomerId} onAdd={() => setDialog("customer")} onToggle={toggleCustomer} onCopy={copyEmail} onBriefing={copyCustomerBriefing} onConfigure={setGrantCustomer} />}
            {view === "massnahmen" && <MeasuresView tasks={tasks} pendingTaskId={pendingTaskId} bulkSaving={bulkSaving} onAdd={() => setDialog("task")} onUpdate={updateTask} onBulkUpdate={bulkUpdateTasks} onDelete={setTaskToDelete} />}
          </>}
        </div>
      </section>

      {dialog === "task" && <WorkDialog eyebrow="Neue Aufgabe" title="Maßnahme anlegen" error={error} note="Die Maßnahme erscheint sofort im Board und im Control Center." onClose={closeDialog}><TaskForm evidence={evidence} saving={saving} onSubmit={addTask} /></WorkDialog>}
      {dialog === "evidence" && <WorkDialog eyebrow="Neue Evidenz" title="Nachweis erfassen" error={error} note="Neue Nachweise bleiben privat, bis Sie eine Kundenfreigabe aktivieren." onClose={closeDialog}><EvidenceForm saving={saving} onSubmit={addEvidence} /></WorkDialog>}
      {dialog === "customer" && <WorkDialog eyebrow="Neue Verbindung" title="Kunde hinzufügen" error={error} note="Der Zugriff ist nach dem Anlegen noch nicht aktiv." onClose={closeDialog}><CustomerForm saving={saving} onSubmit={addCustomer} /></WorkDialog>}
      {dialog === "shortcuts" && <WorkDialog eyebrow="Navigation" title="Schneller arbeiten" error="" note="Die Kürzel funktionieren überall außerhalb von Eingabefeldern." onClose={closeDialog}><ShortcutList /></WorkDialog>}
      {taskToDelete && <DeleteTaskDialog task={taskToDelete} pending={pendingTaskId === taskToDelete.id} onClose={() => setTaskToDelete(null)} onConfirm={deleteTask} />}
      {grantCustomer && <CustomerEvidenceDialog customer={grantCustomer} evidence={evidence} onClose={() => setGrantCustomer(null)} onSaved={updateCustomerScope} />}
    </main>
  );
}

function Overview({ name, tasks, allEvidence, attentionEvidence, sharedCount, signalCount, events, onView, onUpdateTask, pendingTaskId, onAddTask, onAddEvidence, onAddCustomer, onHelp }: {
  name: string; tasks: Task[]; allEvidence: Evidence[]; attentionEvidence: Evidence[]; sharedCount: number; signalCount: number; events: AuditEvent[];
  onView: (view: View) => void; onUpdateTask: (id: string, status: TaskStatus) => void; pendingTaskId: string;
  onAddTask: () => void; onAddEvidence: () => void; onAddCustomer: () => void; onHelp: () => void;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "Team";
  const readiness = allEvidence.length ? Math.round((allEvidence.filter((item) => item.status === "Aktuell").length / allEvidence.length) * 100) : 0;
  return <>
    <div className="workspace-page-title workspace-page-title-overview"><div><span className="workspace-eyebrow">Control Center / 01</span><h1 className="text-balance">Guten Tag, {firstName}.</h1><p className="text-pretty">Alles, was vor der nächsten Kundenfreigabe zählt.</p></div><button className="workspace-primary" onClick={() => onView("massnahmen")}><Icon name="task" />Maßnahmen öffnen</button></div>
    <QuickActions signalCount={signalCount} onInbox={() => onView("eingang")} onTask={onAddTask} onEvidence={onAddEvidence} onCustomer={onAddCustomer} onHelp={onHelp} />
    <section className="workspace-summary" aria-label="Zusammenfassung"><div className="summary-urgent"><small>01 / Handlungsdruck</small><b>{tasks.length}</b><span>offene Maßnahmen</span></div><div><small>02 / Evidenz</small><b>{attentionEvidence.length}</b><span>Nachweise prüfen</span></div><div><small>03 / Verbindungen</small><b>{sharedCount}</b><span>Kunden freigegeben</span></div></section>
    <section className="workspace-readiness" aria-label="Freigabebereitschaft"><div><small>Freigabebereitschaft</small><strong>{readiness}%</strong></div><progress max="100" value={readiness}>{readiness}%</progress><p>{allEvidence.length ? allEvidence.filter((item) => item.status === "Aktuell").length + " von " + allEvidence.length + " Nachweisen sind aktuell." : "Erfassen Sie den ersten Nachweis, um die Bereitschaft zu berechnen."}</p></section>
    <div className="workspace-activity-grid">
      <section className="workspace-board-panel workspace-queue"><SectionHeading title="Prioritäts-Queue" copy="Was jetzt entschieden werden muss." action="Alle Maßnahmen" onClick={() => onView("massnahmen")} />
        {tasks.length ? <div className="queue-list">{tasks.slice(0, 4).map((task, index) => { const due = dueMeta(task); return <article className="queue-item" key={task.id}><span className="queue-index">0{index + 1}</span><div className="queue-copy"><small>{task.evidence || "Ohne Nachweis"}</small><h3>{task.title}</h3><p>{task.owner} <i /> <span className={"due-label due-" + due.tone}>{due.label}</span></p></div><TaskStatusControl task={task} pending={pendingTaskId === task.id} onUpdate={onUpdateTask} /></article>; })}</div> : <EmptyState text="Keine offenen Maßnahmen." action="Maßnahmen öffnen" onAction={() => onView("massnahmen")} />}
      </section>
      <section className="workspace-board-panel workspace-watch"><SectionHeading title="Evidenz-Watch" copy="Ablauf und Prüfung im Blick." action="Nachweise" onClick={() => onView("nachweise")} />
        {attentionEvidence.length ? <div className="watch-list">{attentionEvidence.slice(0, 4).map((item, index) => <article className="watch-item" key={item.id}><header><span>0{index + 1}</span><Status value={item.status} /></header><h3>{item.title}</h3><p>{item.area}</p><footer><span>{item.level}</span><time>{formatDate(item.validUntil)}</time></footer></article>)}</div> : <EmptyState text="Kein Handlungsbedarf." action="Nachweise öffnen" onAction={() => onView("nachweise")} />}
      </section>
    </div>
    <ActivityLog events={events} />
  </>;
}

function QuickActions({ signalCount, onInbox, onTask, onEvidence, onCustomer, onHelp }: { signalCount: number; onInbox: () => void; onTask: () => void; onEvidence: () => void; onCustomer: () => void; onHelp: () => void }) {
  return <section className="workspace-command-strip" aria-label="Schnellaktionen"><span><Icon name="bolt" />Schnell erledigen</span><button type="button" onClick={onInbox}><Icon name="inbox" />Eingang <b>{signalCount}</b></button><button type="button" onClick={onEvidence}><Icon name="proof" />Nachweis erfassen</button><button type="button" onClick={onTask}><Icon name="task" />Maßnahme anlegen</button><button type="button" onClick={onCustomer}><Icon name="share" />Kunde hinzufügen</button><button type="button" onClick={onHelp}><Icon name="help" />Kürzel</button></section>;
}

function InboxView({ signals, dismissedCount, customers, onOpen, onConfigureCustomer, onDismiss, onRestore }: { signals: Signal[]; dismissedCount: number; customers: Customer[]; onOpen: (view: View) => void; onConfigureCustomer: (customer: Customer) => void; onDismiss: (id: string) => void; onRestore: () => void }) {
  const [filter, setFilter] = useState<SignalFilter>("Alle");
  const filtered = signals.filter((signal) => filter === "Alle" || (filter === "Kritisch" ? signal.tone === "critical" : signal.category === filter));
  function act(signal: Signal) {
    if (signal.customerId) {
      const customer = customers.find((item) => item.id === signal.customerId);
      if (customer) {
        onConfigureCustomer(customer);
        return;
      }
    }
    onOpen(signal.view);
  }
  function exportSignals() {
    downloadCsv("prooflane-operations-eingang.csv", ["Priorität", "Bereich", "Signal", "Kontext"], filtered.map((signal) => [signal.tone === "critical" ? "Kritisch" : signal.tone === "warning" ? "Prüfen" : "Hinweis", signal.category, signal.title, signal.meta]));
  }
  return <>
    <div className="workspace-page-title inbox-page-title"><div><span className="workspace-eyebrow">Operations / Triage</span><h1 className="text-balance">Eingang</h1><p className="text-pretty">Automatisch erkannte Fristen, Lücken und Kundenrisiken – zentral priorisiert.</p></div><div className="workspace-page-actions">{dismissedCount > 0 && <button type="button" className="workspace-secondary" onClick={onRestore}>{dismissedCount} wieder einblenden</button>}<button type="button" className="workspace-primary" disabled={!filtered.length} onClick={exportSignals}><Icon name="download" />CSV exportieren</button></div></div>
    <section className="inbox-overview" aria-label="Eingang Zusammenfassung"><div><small>Offene Signale</small><b>{signals.length}</b></div><div><small>Kritisch</small><b>{signals.filter((signal) => signal.tone === "critical").length}</b></div><div><small>Kundenbezug</small><b>{signals.filter((signal) => signal.category === "Kunden").length}</b></div><p><Icon name="bolt" />Signale werden aus Status, Fristen und Kundenfreigaben abgeleitet.</p></section>
    <FilterBar label="Eingang filtern" options={["Alle", "Kritisch", "Nachweise", "Kunden"] as SignalFilter[]} value={filter} onChange={setFilter} resultCount={filtered.length} />
    {filtered.length ? <section className="inbox-list" aria-label="Operations Eingang">{filtered.map((signal, index) => <article className={"inbox-signal signal-" + signal.tone} key={signal.id}><div className="signal-rank"><span>{String(index + 1).padStart(2, "0")}</span><i /></div><div className="signal-main"><header><span>{signal.category}</span><b>{signal.tone === "critical" ? "Kritisch" : signal.tone === "warning" ? "Prüfen" : "Hinweis"}</b></header><h2>{signal.title}</h2><p>{signal.copy}</p><small>{signal.meta}</small></div><div className="signal-actions"><button type="button" className="workspace-primary" onClick={() => act(signal)}>Öffnen <Icon name="arrow" /></button><button type="button" className="workspace-text-button" onClick={() => onDismiss(signal.id)}>Für heute ausblenden</button></div></article>)}</section> : <div className="inbox-empty"><Icon name="check" /><h2>{signals.length ? "Keine Signale in diesem Filter." : "Eingang erledigt."}</h2><p>{signals.length ? "Wählen Sie einen anderen Filter." : "Aktuell gibt es keine offenen Fristen oder Freigabelücken."}</p>{signals.length > 0 && <button type="button" className="workspace-secondary" onClick={() => setFilter("Alle")}>Alle anzeigen</button>}</div>}
  </>;
}

function ActivityLog({ events }: { events: AuditEvent[] }) {
  const descriptions: Record<string, string> = { created: "erstellt", updated: "aktualisiert", deleted: "gelöscht", bulk_status_updated: "Status gesammelt geändert", share_state_updated: "Freigabe geändert", evidence_grants_replaced: "Kundenauswahl geändert", document_uploaded: "PDF angehängt" };
  return <section className="workspace-board-panel workspace-activity-log"><SectionHeading title="Letzte Aktivitäten" copy="Änderungen im Arbeitsbereich – nachvollziehbar für Ihr Team." />{events.length ? <ol>{events.slice(0, 6).map((event) => <li key={event.id}><span><Icon name={event.entityType === "task" ? "task" : event.entityType === "customer_access" ? "share" : "proof"} /></span><div><p><b>{event.actorName || "Team"}</b> hat {descriptions[event.action] || event.action.replaceAll("_", " ")}.</p><small>{formatDateTime(event.createdAt)}</small></div></li>)}</ol> : <p className="workspace-activity-empty">Noch keine Aktivitäten protokolliert.</p>}</section>;
}

function SearchResults({ query, tasks, evidence, customers, onOpen, onClear }: { query: string; tasks: Task[]; evidence: Evidence[]; customers: Customer[]; onOpen: (view: View) => void; onClear: () => void }) {
  const foundEvidence = evidence.filter((item) => matchesQuery(query, [item.title, item.area, item.level, item.status]));
  const foundCustomers = customers.filter((item) => matchesQuery(query, [item.name, item.email, item.scope]));
  const foundTasks = tasks.filter((item) => matchesQuery(query, [item.title, item.owner, item.evidence, item.status]));
  const total = foundEvidence.length + foundCustomers.length + foundTasks.length;
  return <section className="workspace-search-results"><div className="workspace-search-heading"><span className="workspace-eyebrow">Globale Suche</span><h1>{total} {total === 1 ? "Treffer" : "Treffer"} für „{query}“</h1><button type="button" className="workspace-text-button" onClick={onClear}>Suche schließen <Icon name="close" /></button></div>{total ? <div className="search-result-groups">
    <SearchGroup title="Nachweise" count={foundEvidence.length}>{foundEvidence.map((item) => <button type="button" key={item.id} onClick={() => onOpen("nachweise")}><Icon name="proof" /><span><b>{item.title}</b><small>{item.area} · {item.level}</small></span><Status value={item.status} /></button>)}</SearchGroup>
    <SearchGroup title="Kunden" count={foundCustomers.length}>{foundCustomers.map((item) => <button type="button" key={item.id} onClick={() => onOpen("freigaben")}><Icon name="share" /><span><b>{item.name}</b><small>{item.email} · {item.scope}</small></span><Status value={item.shared ? "Freigegeben" : "Privat"} /></button>)}</SearchGroup>
    <SearchGroup title="Maßnahmen" count={foundTasks.length}>{foundTasks.map((item) => <button type="button" key={item.id} onClick={() => onOpen("massnahmen")}><Icon name="task" /><span><b>{item.title}</b><small>{item.owner} · {dueMeta(item).label}</small></span><Status value={item.status} /></button>)}</SearchGroup>
  </div> : <div className="workspace-search-empty"><Icon name="search" /><h2>Nichts gefunden</h2><p>Versuchen Sie einen Kundennamen, einen Bereich oder eine verantwortliche Person.</p><button className="workspace-primary" type="button" onClick={onClear}>Suche leeren</button></div>}</section>;
}

function SearchGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return <section className="search-result-group"><header><h2>{title}</h2><span>{count}</span></header><div>{children}</div></section>;
}

function SectionHeading({ title, copy, action, onClick }: { title: string; copy: string; action?: string; onClick?: () => void }) {
  return <div className="workspace-section-heading"><div><h2 className="text-balance">{title}</h2><p className="text-pretty">{copy}</p></div>{action && onClick && <button className="workspace-text-button" onClick={onClick}>{action} <Icon name="arrow" /></button>}</div>;
}

function FilterBar<T extends string>({ label, options, value, onChange, resultCount }: { label: string; options: T[]; value: T; onChange: (value: T) => void; resultCount: number }) {
  return <div className="workspace-filterbar"><div role="group" aria-label={label}>{options.map((option) => <button key={option} type="button" className={value === option ? "is-active" : ""} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</button>)}</div><span>{resultCount} {resultCount === 1 ? "Eintrag" : "Einträge"}</span></div>;
}

function EvidenceView({ evidence, documents, uploadingEvidenceId, onAdd, onUpload, onToggleDocuments }: { evidence: Evidence[]; documents: Record<string, ApiEvidenceDocument[]>; uploadingEvidenceId: string; onAdd: () => void; onUpload: (id: string, file: File) => void; onToggleDocuments: (id: string) => void }) {
  const [filter, setFilter] = useState<EvidenceFilter>("Alle");
  const filtered = filter === "Alle" ? evidence : evidence.filter((item) => item.status === filter);
  function exportEvidence() {
    downloadCsv("prooflane-nachweise.csv", ["Nachweis", "Bereich", "Stufe", "Status", "Gültig bis", "Dokumente"], filtered.map((item) => [item.title, item.area, item.level, item.status, item.validUntil, item.documentCount]));
  }
  return <><PageTitle title="Nachweise" copy="Dokumentiert, geprüft und gezielt freigegeben." action="Nachweis erfassen" onClick={onAdd} secondaryAction="CSV" onSecondary={exportEvidence} /><FilterBar label="Nachweise filtern" options={["Alle", "Aktuell", "Prüfung nötig", "Läuft bald ab"] as EvidenceFilter[]} value={filter} onChange={setFilter} resultCount={filtered.length} />{filtered.length ? <section className="evidence-catalog" aria-label="Nachweiskatalog">{filtered.map((item, index) => <article className="evidence-card" key={item.id}><header><span>EV / {String(index + 1).padStart(2, "0")}</span><Status value={item.status} /></header><div className="evidence-card-main"><small>{item.area}</small><h2>{item.title}</h2></div><dl><div><dt>Evidenzstufe</dt><dd>{item.level}</dd></div><div><dt>Gültig bis</dt><dd>{formatDate(item.validUntil)}</dd></div><div><dt>Dokumente</dt><dd>{item.documentCount} PDF</dd></div></dl><div className="evidence-pdf-actions"><label className={uploadingEvidenceId === item.id ? "is-loading" : ""}><Icon name="upload" />{uploadingEvidenceId === item.id ? "Wird hochgeladen…" : "PDF anhängen"}<input type="file" accept="application/pdf,.pdf" disabled={uploadingEvidenceId === item.id} onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (file) onUpload(item.id, file); }} /></label><a href={"/api/evidence/" + item.id + "/report"} target="_blank" rel="noreferrer"><Icon name="download" />Bericht</a><button type="button" onClick={() => onToggleDocuments(item.id)}><Icon name="proof" />{documents[item.id] ? "PDFs schließen" : "PDFs anzeigen (" + item.documentCount + ")"}</button></div>{documents[item.id] && <ul className="evidence-pdf-list">{documents[item.id].length ? documents[item.id].map((document) => <li key={document.id}><a href={"/api/documents/" + document.id} target="_blank" rel="noreferrer">{document.originalName}</a><span>{Math.ceil(document.sizeBytes / 1024)} KB</span></li>) : <li>Keine PDFs angehängt.</li>}</ul>}</article>)}</section> : <EmptyState text={evidence.length ? "Keine Nachweise mit diesem Status." : "Noch keine Nachweise erfasst."} action={evidence.length ? "Alle anzeigen" : "Nachweis erfassen"} onAction={() => evidence.length ? setFilter("Alle") : onAdd()} />}</>;
}

function ApprovalsView({ customers, pendingCustomerId, onAdd, onToggle, onCopy, onBriefing, onConfigure }: { customers: Customer[]; pendingCustomerId: string; onAdd: () => void; onToggle: (id: string) => void; onCopy: (email: string) => void; onBriefing: (customer: Customer) => void; onConfigure: (customer: Customer) => void }) {
  const [filter, setFilter] = useState<CustomerFilter>("Alle");
  const filtered = filter === "Alle" ? customers : customers.filter((customer) => customer.shared === (filter === "Freigegeben"));
  function exportCustomers() {
    downloadCsv("prooflane-kundenfreigaben.csv", ["Kunde", "E-Mail", "Status", "Umfang", "Nachweise", "Davon aktuell", "Letzte Änderung"], filtered.map((customer) => [customer.name, customer.email, customer.shared ? "Freigegeben" : "Privat", customer.scope, customer.evidenceCount, customer.currentEvidenceCount, customer.updatedAt]));
  }
  return <><PageTitle title="Freigaben" copy="Kunden sehen ausschließlich bewusst ausgewählte Nachweise." action="Kunde hinzufügen" onClick={onAdd} secondaryAction="CSV" onSecondary={exportCustomers} /><FilterBar label="Kunden filtern" options={["Alle", "Freigegeben", "Privat"] as CustomerFilter[]} value={filter} onChange={setFilter} resultCount={filtered.length} />{filtered.length ? <section className="connection-list" aria-label="Kundenverbindungen">{filtered.map((customer, index) => { const readiness = customer.evidenceCount ? Math.round(customer.currentEvidenceCount / customer.evidenceCount * 100) : 0; return <article className="connection-card" key={customer.id}><div className="connection-index">CN<br />{String(index + 1).padStart(2, "0")}</div><div className="connection-company"><span>{customer.name.slice(0, 2).toUpperCase()}</span><div><small>Kundenverbindung</small><h2>{customer.name}</h2><div className="connection-contact"><a href={"mailto:" + customer.email}>{customer.email}</a><button type="button" onClick={() => onCopy(customer.email)} aria-label={"E-Mail von " + customer.name + " kopieren"}><Icon name="copy" /></button></div></div></div><div className="connection-scope"><small>Ausgewählter Umfang</small><p>{customer.scope}</p><div className="customer-readiness"><span><b>{readiness}%</b> kundenbereit</span><progress max="100" value={readiness}>{readiness}%</progress><small>{customer.currentEvidenceCount} / {customer.evidenceCount} aktuell</small></div><button className="workspace-inline-action" type="button" onClick={() => onConfigure(customer)}>Nachweise auswählen <Icon name="arrow" /></button></div><div className="connection-action"><Status value={customer.shared ? "Freigegeben" : "Privat"} /><div className="customer-tools"><button type="button" onClick={() => onBriefing(customer)}><Icon name="copy" />Briefing</button><a href={"/api/customers/" + customer.id + "/report"} target="_blank" rel="noreferrer"><Icon name="brief" />PDF</a></div><button className="workspace-secondary workspace-share-button" type="button" disabled={pendingCustomerId === customer.id} onClick={() => onToggle(customer.id)}>{pendingCustomerId === customer.id ? "Speichert…" : customer.shared ? "Freigabe stoppen" : "Jetzt freigeben"}</button></div></article>; })}</section> : <EmptyState text={customers.length ? "Keine Kunden mit diesem Status." : "Noch keine Kundenverbindung."} action={customers.length ? "Alle anzeigen" : "Kunde hinzufügen"} onAction={() => customers.length ? setFilter("Alle") : onAdd()} />}</>;
}

function MeasuresView({ tasks, pendingTaskId, bulkSaving, onAdd, onUpdate, onBulkUpdate, onDelete }: { tasks: Task[]; pendingTaskId: string; bulkSaving: boolean; onAdd: () => void; onUpdate: (id: string, status: TaskStatus) => void; onBulkUpdate: (ids: string[], status: TaskStatus) => Promise<void>; onDelete: (task: Task) => void }) {
  const [filter, setFilter] = useState<TaskFilter>("Alle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekIso = new Date(nextWeek.getTime() - nextWeek.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const filtered = tasks.filter((task) => {
    if (filter === "Alle") return true;
    if (filter === "Ohne Zuordnung") return !task.evidence;
    if (filter === "Überfällig") return task.status !== "Erledigt" && task.due !== "—" && task.due < todayIso();
    return task.status !== "Erledigt" && task.due !== "—" && task.due >= todayIso() && task.due <= nextWeekIso;
  });
  function toggleSelection(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  async function applyBulk(status: TaskStatus) {
    try {
      await onBulkUpdate([...selected], status);
      setSelected(new Set());
    } catch {
      return;
    }
  }
  function exportTasks() {
    downloadCsv("prooflane-massnahmen.csv", ["Maßnahme", "Status", "Verantwortlich", "Termin", "Nachweis"], filtered.map((task) => [task.title, task.status, task.owner, task.due, task.evidence || "Ohne Zuordnung"]));
  }
  return <><PageTitle title="Maßnahmen" copy="Fristen, Zuständigkeit und Status auf einen Blick." action="Maßnahme anlegen" onClick={onAdd} secondaryAction="CSV" onSecondary={exportTasks} /><FilterBar label="Maßnahmen filtern" options={["Alle", "Überfällig", "Nächste 7 Tage", "Ohne Zuordnung"] as TaskFilter[]} value={filter} onChange={(next) => { setFilter(next); setSelected(new Set()); }} resultCount={filtered.length} />{selected.size > 0 && <div className="bulk-toolbar" role="toolbar" aria-label="Ausgewählte Maßnahmen bearbeiten"><b>{selected.size} ausgewählt</b><button type="button" disabled={bulkSaving} onClick={() => applyBulk("In Arbeit")}>In Arbeit setzen</button><button type="button" disabled={bulkSaving} onClick={() => applyBulk("Erledigt")}>Als erledigt markieren</button><button type="button" disabled={bulkSaving} onClick={() => setSelected(new Set())}>Auswahl aufheben</button></div>}{filtered.length ? <section className="measure-board" aria-label="Maßnahmen nach Status">{taskColumns.map((status, columnIndex) => { const columnTasks = filtered.filter((task) => task.status === status); return <div className={"measure-column measure-column-" + status.toLowerCase().replaceAll(" ", "-")} key={status}><header><span>0{columnIndex + 1}</span><h2>{status}</h2><b>{columnTasks.length}</b></header><div>{columnTasks.length ? columnTasks.map((task) => { const due = dueMeta(task); return <article className={"measure-card" + (selected.has(task.id) ? " is-selected" : "")} key={task.id}><div className="measure-card-heading"><label className="measure-select"><span className="sr-only">{task.title} auswählen</span><input type="checkbox" checked={selected.has(task.id)} onChange={() => toggleSelection(task.id)} /></label><small>{task.evidence || "Ohne Nachweis"}</small><button type="button" className="measure-delete" onClick={() => onDelete(task)} aria-label={'Maßnahme „' + task.title + '“ löschen'}><Icon name="trash" /></button></div><h3>{task.title}</h3><dl><div><dt>Verantwortlich</dt><dd>{task.owner}</dd></div><div><dt>Termin</dt><dd><span className={"measure-due due-" + due.tone}><Icon name="clock" />{due.label}</span></dd></div></dl><TaskStatusControl task={task} pending={pendingTaskId === task.id || bulkSaving} onUpdate={onUpdate} /></article>; }) : <p className="measure-column-empty">Keine Maßnahmen</p>}</div></div>; })}</section> : <EmptyState text={tasks.length ? "Keine Maßnahmen passen zum Filter." : "Noch keine Maßnahmen angelegt."} action={tasks.length ? "Alle anzeigen" : "Maßnahme anlegen"} onAction={() => tasks.length ? setFilter("Alle") : onAdd()} />}</>;
}

function PageTitle({ title, copy, action, onClick, secondaryAction, onSecondary }: { title: string; copy: string; action: string; onClick: () => void; secondaryAction?: string; onSecondary?: () => void }) {
  return <div className="workspace-page-title"><div><span className="workspace-eyebrow">Workspace / {title}</span><h1 className="text-balance">{title}</h1><p className="text-pretty">{copy}</p></div><div className="workspace-page-actions">{secondaryAction && onSecondary && <button type="button" className="workspace-secondary" onClick={onSecondary}><Icon name="download" />{secondaryAction}</button>}<button className="workspace-primary" type="button" onClick={onClick}><Icon name="plus" />{action}</button></div></div>;
}

function TaskStatusControl({ task, pending, onUpdate }: { task: Task; pending: boolean; onUpdate: (id: string, status: TaskStatus) => void }) {
  return <label className="workspace-select-label"><span className="sr-only">Status für {task.title}</span><select value={task.status} disabled={pending} aria-busy={pending} onChange={(event) => onUpdate(task.id, event.target.value as TaskStatus)}><option>Offen</option><option>In Arbeit</option><option>Erledigt</option></select></label>;
}

function DeleteTaskDialog({ task, pending, onClose, onConfirm }: { task: Task; pending: boolean; onClose: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const focusFrame = window.requestAnimationFrame(() => dialog.querySelector<HTMLElement>("button[data-cancel]")?.focus());
    return () => { window.cancelAnimationFrame(focusFrame); if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={dialogRef} className="workspace-dialog workspace-confirm-dialog" aria-modal="true" aria-labelledby="delete-task-title" onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}><div className="workspace-dialog-header"><div><span>Maßnahme entfernen</span><h2 id="delete-task-title" className="text-balance">Maßnahme löschen?</h2></div><button type="button" disabled={pending} onClick={onClose} aria-label="Dialog schließen"><Icon name="close" /></button></div><p className="workspace-confirm-copy">„{task.title}“ wird dauerhaft aus dem Arbeitsbereich entfernt. Dieser Schritt kann nicht rückgängig gemacht werden.</p><div className="workspace-confirm-actions"><button type="button" className="workspace-secondary" data-cancel onClick={onClose} disabled={pending}>Abbrechen</button><button type="button" className="workspace-danger" onClick={onConfirm} disabled={pending}>{pending ? "Wird gelöscht…" : "Dauerhaft löschen"}</button></div></dialog>;
}

function EmptyState({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return <div className="workspace-empty"><p>{text}</p><button className="workspace-text-button" onClick={onAction}>{action} <Icon name="arrow" /></button></div>;
}

function WorkDialog({ eyebrow, title, error, note, onClose, children }: { eyebrow: string; title: string; error: string; note: string; onClose: () => void; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const focusFrame = window.requestAnimationFrame(() => (dialog.querySelector<HTMLElement>("input, select") ?? dialog.querySelector<HTMLElement>("button"))?.focus());
    return () => { window.cancelAnimationFrame(focusFrame); if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={dialogRef} className="workspace-dialog" aria-modal="true" aria-labelledby="work-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}><div className="workspace-dialog-header"><div><span>{eyebrow}</span><h2 id="work-dialog-title" className="text-balance">{title}</h2></div><button type="button" onClick={onClose} aria-label="Dialog schließen"><Icon name="close" /></button></div>{children}{error && <p className="workspace-form-error" role="alert">{error}</p>}<p className="workspace-dialog-note">{note}</p></dialog>;
}

function ShortcutList() {
  return <div className="workspace-shortcuts"><div><kbd>⌘ K</kbd><span><b>Globale Suche</b><small>Auf Windows: Strg K</small></span></div><div><kbd>/</kbd><span><b>Suche fokussieren</b><small>Wenn kein Feld aktiv ist</small></span></div><div><kbd>1–5</kbd><span><b>Bereich wechseln</b><small>Überblick bis Maßnahmen</small></span></div><div><kbd>?</kbd><span><b>Diese Hilfe öffnen</b><small>Jederzeit nachschlagen</small></span></div></div>;
}

function CustomerEvidenceDialog({ customer, evidence, onClose, onSaved }: { customer: Customer; evidence: Evidence[]; onClose: () => void; onSaved: (customerId: string, selectedIds: string[]) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  useEffect(() => {
    let active = true;
    api<{ evidence: ApiEvidence[] }>("/api/customers/" + customer.id + "/evidence")
      .then((response) => { if (active) setSelected(new Set(response.evidence.map((item) => item.id))); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Auswahl konnte nicht geladen werden."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [customer.id]);
  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  async function save() {
    setSaving(true);
    setError("");
    try {
      const ids = [...selected];
      await api<{ evidence: ApiEvidence[] }>("/api/customers/" + customer.id + "/evidence", { method: "PATCH", body: JSON.stringify({ evidenceIds: ids }) });
      onSaved(customer.id, ids);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Auswahl konnte nicht gespeichert werden.");
      setSaving(false);
    }
  }
  return <dialog ref={dialogRef} className="workspace-dialog workspace-grant-dialog" aria-modal="true" aria-labelledby="grant-dialog-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}><div className="workspace-dialog-header"><div><span>Kundensicht konfigurieren</span><h2 id="grant-dialog-title">{customer.name}</h2></div><button type="button" disabled={saving} onClick={onClose} aria-label="Dialog schließen"><Icon name="close" /></button></div><p className="grant-intro">Wählen Sie exakt die Nachweise, die dieser Kunde sehen darf. Die allgemeine Freigabe aktivieren Sie anschließend separat.</p><div className="grant-tools"><span>{selected.size} von {evidence.length} ausgewählt</span><div><button type="button" onClick={() => setSelected(new Set(evidence.map((item) => item.id)))}>Alle</button><button type="button" onClick={() => setSelected(new Set())}>Keine</button></div></div>{loading ? <p className="grant-loading">Auswahl wird geladen…</p> : evidence.length ? <div className="grant-list">{evidence.map((item) => <label key={item.id}><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} /><span><b>{item.title}</b><small>{item.area} · {item.level}</small></span><Status value={item.status} /></label>)}</div> : <p className="grant-loading">Noch keine Nachweise vorhanden.</p>}{error && <p className="workspace-form-error" role="alert">{error}</p>}<div className="grant-save"><button type="button" className="workspace-secondary" disabled={saving} onClick={onClose}>Abbrechen</button><button type="button" className="workspace-primary" disabled={saving || loading} onClick={save}>{saving ? "Speichert…" : "Auswahl speichern"}</button></div></dialog>;
}

function TaskForm({ evidence, saving, onSubmit }: { evidence: Evidence[]; saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="workspace-form" onSubmit={onSubmit}><label>Maßnahme<input name="title" required autoComplete="off" placeholder="z. B. MFA-Nachweis aktualisieren" /></label><label>Verantwortlich<input name="owner" required autoComplete="name" placeholder="Name oder Team" /></label><div className="workspace-form-grid"><label>Termin<input name="due" required type="date" min={todayIso()} /></label><label>Verknüpfter Nachweis<select name="evidence"><option value="">Nicht zugeordnet</option>{evidence.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></div><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Wird gespeichert…" : "Maßnahme speichern"}</button></form>;
}

function EvidenceForm({ saving, onSubmit }: { saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="workspace-form" onSubmit={onSubmit}><label>Name des Nachweises<input name="title" required autoComplete="off" placeholder="z. B. Netzwerksegmentierung" /></label><div className="workspace-form-grid"><label>Bereich<select name="area" required defaultValue=""><option value="" disabled>Bitte wählen</option><option>Informationssicherheit</option><option>Notfallmanagement</option><option>Lieferkette</option></select></label><label>Stufe<select name="level"><option>Selbstauskunft</option><option>Technisch belegt</option><option>Extern bestätigt</option></select></label></div><label>Gültig bis<input name="validUntil" required type="date" min={todayIso()} /></label><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Wird gespeichert…" : "Nachweis erfassen"}</button></form>;
}

function CustomerForm({ saving, onSubmit }: { saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form className="workspace-form" onSubmit={onSubmit}><label>Unternehmen<input name="name" required autoComplete="organization" placeholder="Unternehmensname" /></label><label>Kontakt-E-Mail<input name="email" required type="email" autoComplete="email" placeholder="kontakt@unternehmen.de" /></label><label>Vorgesehener Umfang<input name="scope" autoComplete="off" placeholder="z. B. Informationssicherheit, Lieferkette" /><small>Kann später über „Nachweise auswählen“ präzise gesetzt werden.</small></label><button className="workspace-primary" disabled={saving} type="submit">{saving ? "Wird gespeichert…" : "Kunde anlegen"}</button></form>;
}
