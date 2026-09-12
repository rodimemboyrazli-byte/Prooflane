import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import type { EvidenceStatus, SessionIdentity, ShareState, TaskStatus } from "@/lib/server/db/schema";
import { ApiError } from "@/lib/server/http";

function now() { return new Date().toISOString(); }
function audit(identity: SessionIdentity, entityType: string, entityId: string, action: string, metadata: Record<string, unknown> = {}) {
  db().prepare("INSERT INTO audit_log (id, organization_id, actor_user_id, entity_type, entity_id, action, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(randomUUID(), identity.organizationId, identity.userId, entityType, entityId, action, JSON.stringify(metadata), now());
}

export function workspaceSummary(identity: SessionIdentity) {
  const database = db();
  const openTasks = database.prepare("SELECT COUNT(*) AS count FROM tasks WHERE organization_id = ? AND status != 'complete'").get(identity.organizationId) as { count: number };
  const reviewEvidence = database.prepare("SELECT COUNT(*) AS count FROM evidence WHERE organization_id = ? AND status IN ('draft', 'needs_review', 'expired')").get(identity.organizationId) as { count: number };
  const sharedCustomers = database.prepare("SELECT COUNT(*) AS count FROM customer_access WHERE organization_id = ? AND share_state = 'shared'").get(identity.organizationId) as { count: number };
  return { openTasks: openTasks.count, reviewEvidence: reviewEvidence.count, sharedCustomers: sharedCustomers.count };
}

export function listEvidence(identity: SessionIdentity) {
  return db().prepare("SELECT e.id, e.title, e.area, e.evidence_level AS level, e.valid_until AS validUntil, e.status, e.version, e.created_at AS createdAt, e.updated_at AS updatedAt, (SELECT COUNT(*) FROM evidence_documents d WHERE d.evidence_id = e.id) AS documentCount FROM evidence e WHERE e.organization_id = ? ORDER BY e.updated_at DESC").all(identity.organizationId);
}

export function createEvidence(identity: SessionIdentity, input: { title: string; area: string; level: string; validUntil: string | null; status: EvidenceStatus }) {
  const id = randomUUID();
  const timestamp = now();
  db().prepare("INSERT INTO evidence (id, organization_id, title, area, evidence_level, valid_until, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, identity.organizationId, input.title, input.area, input.level, input.validUntil, input.status, identity.userId, timestamp, timestamp);
  audit(identity, "evidence", id, "created", { status: input.status });
  return db().prepare("SELECT e.id, e.title, e.area, e.evidence_level AS level, e.valid_until AS validUntil, e.status, e.version, e.created_at AS createdAt, e.updated_at AS updatedAt, 0 AS documentCount FROM evidence e WHERE e.id = ? AND e.organization_id = ?").get(id, identity.organizationId);
}

export function updateEvidence(identity: SessionIdentity, id: string, input: Partial<{ title: string; area: string; level: string; validUntil: string | null; status: EvidenceStatus }>) {
  const current = db().prepare("SELECT id, title, area, evidence_level AS level, valid_until AS validUntil, status, version FROM evidence WHERE id = ? AND organization_id = ?").get(id, identity.organizationId) as { id: string; title: string; area: string; level: string; validUntil: string | null; status: EvidenceStatus; version: number } | undefined;
  if (!current) throw new ApiError(404, "Nachweis nicht gefunden.", "not_found");
  const next = { ...current, ...input };
  const timestamp = now();
  db().prepare("UPDATE evidence SET title = ?, area = ?, evidence_level = ?, valid_until = ?, status = ?, version = ?, updated_at = ? WHERE id = ? AND organization_id = ?").run(next.title, next.area, next.level, next.validUntil, next.status, current.version + 1, timestamp, id, identity.organizationId);
  audit(identity, "evidence", id, "updated", { status: next.status, version: current.version + 1 });
  return db().prepare("SELECT e.id, e.title, e.area, e.evidence_level AS level, e.valid_until AS validUntil, e.status, e.version, e.created_at AS createdAt, e.updated_at AS updatedAt, (SELECT COUNT(*) FROM evidence_documents d WHERE d.evidence_id = e.id) AS documentCount FROM evidence e WHERE e.id = ? AND e.organization_id = ?").get(id, identity.organizationId);
}

export function listTasks(identity: SessionIdentity) {
  return db().prepare("SELECT t.id, t.title, t.assignee, t.due_date AS dueDate, t.status, t.evidence_id AS evidenceId, e.title AS evidenceTitle, t.created_at AS createdAt, t.updated_at AS updatedAt FROM tasks t LEFT JOIN evidence e ON e.id = t.evidence_id WHERE t.organization_id = ? ORDER BY CASE t.status WHEN 'complete' THEN 1 ELSE 0 END, t.due_date ASC, t.created_at DESC").all(identity.organizationId);
}

export function createTask(identity: SessionIdentity, input: { title: string; assignee: string | null; dueDate: string | null; evidenceId: string | null; status: TaskStatus }) {
  if (input.evidenceId && !db().prepare("SELECT id FROM evidence WHERE id = ? AND organization_id = ?").get(input.evidenceId, identity.organizationId)) throw new ApiError(422, "Nachweis gehört nicht zu Ihrer Organisation.", "invalid_evidence");
  const id = randomUUID();
  const timestamp = now();
  db().prepare("INSERT INTO tasks (id, organization_id, evidence_id, title, assignee, due_date, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, identity.organizationId, input.evidenceId, input.title, input.assignee, input.dueDate, input.status, identity.userId, timestamp, timestamp);
  audit(identity, "task", id, "created", { status: input.status });
  return db().prepare("SELECT id, title, assignee, due_date AS dueDate, status, evidence_id AS evidenceId, created_at AS createdAt, updated_at AS updatedAt FROM tasks WHERE id = ? AND organization_id = ?").get(id, identity.organizationId);
}

export function updateTask(identity: SessionIdentity, id: string, input: Partial<{ title: string; assignee: string | null; dueDate: string | null; evidenceId: string | null; status: TaskStatus }>) {
  const current = db().prepare("SELECT id, title, assignee, due_date AS dueDate, status, evidence_id AS evidenceId FROM tasks WHERE id = ? AND organization_id = ?").get(id, identity.organizationId) as { id: string; title: string; assignee: string | null; dueDate: string | null; status: TaskStatus; evidenceId: string | null } | undefined;
  if (!current) throw new ApiError(404, "Maßnahme nicht gefunden.", "not_found");
  const next = { ...current, ...input };
  if (next.evidenceId && !db().prepare("SELECT id FROM evidence WHERE id = ? AND organization_id = ?").get(next.evidenceId, identity.organizationId)) throw new ApiError(422, "Nachweis gehört nicht zu Ihrer Organisation.", "invalid_evidence");
  const timestamp = now();
  db().prepare("UPDATE tasks SET title = ?, assignee = ?, due_date = ?, evidence_id = ?, status = ?, updated_at = ? WHERE id = ? AND organization_id = ?").run(next.title, next.assignee, next.dueDate, next.evidenceId, next.status, timestamp, id, identity.organizationId);
  audit(identity, "task", id, "updated", { status: next.status });
  return db().prepare("SELECT id, title, assignee, due_date AS dueDate, status, evidence_id AS evidenceId, created_at AS createdAt, updated_at AS updatedAt FROM tasks WHERE id = ? AND organization_id = ?").get(id, identity.organizationId);
}

export function deleteTask(identity: SessionIdentity, id: string) {
  const database = db();
  const task = database.prepare("SELECT id, title FROM tasks WHERE id = ? AND organization_id = ?").get(id, identity.organizationId) as { id: string; title: string } | undefined;
  if (!task) throw new ApiError(404, "Maßnahme nicht gefunden.", "not_found");
  database.prepare("DELETE FROM tasks WHERE id = ? AND organization_id = ?").run(id, identity.organizationId);
  audit(identity, "task", id, "deleted", { title: task.title });
}

export function updateTasksStatus(identity: SessionIdentity, ids: string[], status: TaskStatus) {
  const uniqueIds = [...new Set(ids)];
  if (!uniqueIds.length || uniqueIds.length !== ids.length || uniqueIds.length > 100) throw new ApiError(422, "Ungültige Maßnahmenselektion.", "validation_error");
  const database = db();
  const update = database.prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ? AND organization_id = ?");
  database.transaction(() => {
    const timestamp = now();
    for (const id of uniqueIds) {
      const result = update.run(status, timestamp, id, identity.organizationId);
      if (!result.changes) throw new ApiError(404, "Eine Maßnahme wurde nicht gefunden.", "not_found");
      audit(identity, "task", id, "bulk_status_updated", { status });
    }
  })();
  const placeholders = uniqueIds.map(() => "?").join(",");
  return database.prepare(`SELECT t.id, t.title, t.assignee, t.due_date AS dueDate, t.status, t.evidence_id AS evidenceId, e.title AS evidenceTitle, t.created_at AS createdAt, t.updated_at AS updatedAt FROM tasks t LEFT JOIN evidence e ON e.id = t.evidence_id WHERE t.organization_id = ? AND t.id IN (${placeholders})`).all(identity.organizationId, ...uniqueIds);
}

export function listCustomers(identity: SessionIdentity) {
  return db().prepare("SELECT c.id, c.company_name AS companyName, c.contact_email AS contactEmail, c.scope_description AS scopeDescription, c.share_state AS shareState, c.created_at AS createdAt, c.updated_at AS updatedAt, (SELECT COUNT(*) FROM customer_evidence_grants g WHERE g.customer_access_id = c.id) AS evidenceCount, (SELECT COUNT(*) FROM customer_evidence_grants g JOIN evidence e ON e.id = g.evidence_id WHERE g.customer_access_id = c.id AND e.status = 'approved') AS currentEvidenceCount FROM customer_access c WHERE c.organization_id = ? ORDER BY c.company_name COLLATE NOCASE").all(identity.organizationId);
}

export function createCustomer(identity: SessionIdentity, input: { companyName: string; contactEmail: string; scopeDescription: string; shareState: ShareState }) {
  const id = randomUUID();
  const timestamp = now();
  db().prepare("INSERT INTO customer_access (id, organization_id, company_name, contact_email, scope_description, share_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(id, identity.organizationId, input.companyName, input.contactEmail, input.scopeDescription, input.shareState, timestamp, timestamp);
  audit(identity, "customer_access", id, "created", { shareState: input.shareState });
  return db().prepare("SELECT c.id, c.company_name AS companyName, c.contact_email AS contactEmail, c.scope_description AS scopeDescription, c.share_state AS shareState, c.created_at AS createdAt, c.updated_at AS updatedAt, 0 AS evidenceCount, 0 AS currentEvidenceCount FROM customer_access c WHERE c.id = ? AND c.organization_id = ?").get(id, identity.organizationId);
}

export function updateCustomerShare(identity: SessionIdentity, id: string, shareState: ShareState) {
  const result = db().prepare("UPDATE customer_access SET share_state = ?, updated_at = ? WHERE id = ? AND organization_id = ?").run(shareState, now(), id, identity.organizationId);
  if (!result.changes) throw new ApiError(404, "Kundenfreigabe nicht gefunden.", "not_found");
  audit(identity, "customer_access", id, "share_state_updated", { shareState });
  return db().prepare("SELECT c.id, c.company_name AS companyName, c.contact_email AS contactEmail, c.scope_description AS scopeDescription, c.share_state AS shareState, c.created_at AS createdAt, c.updated_at AS updatedAt, (SELECT COUNT(*) FROM customer_evidence_grants g WHERE g.customer_access_id = c.id) AS evidenceCount, (SELECT COUNT(*) FROM customer_evidence_grants g JOIN evidence e ON e.id = g.evidence_id WHERE g.customer_access_id = c.id AND e.status = 'approved') AS currentEvidenceCount FROM customer_access c WHERE c.id = ? AND c.organization_id = ?").get(id, identity.organizationId);
}

export function listCustomerEvidenceGrants(identity: SessionIdentity, customerId: string) {
  const database = db();
  if (!database.prepare("SELECT id FROM customer_access WHERE id = ? AND organization_id = ?").get(customerId, identity.organizationId)) throw new ApiError(404, "Kundenfreigabe nicht gefunden.", "not_found");
  return database.prepare("SELECT e.id, e.title, e.area, e.evidence_level AS level, e.valid_until AS validUntil, e.status FROM customer_evidence_grants g JOIN evidence e ON e.id = g.evidence_id WHERE g.customer_access_id = ? AND e.organization_id = ? ORDER BY e.title COLLATE NOCASE").all(customerId, identity.organizationId);
}

export function replaceCustomerEvidenceGrants(identity: SessionIdentity, customerId: string, evidenceIds: string[]) {
  const database = db();
  if (!database.prepare("SELECT id FROM customer_access WHERE id = ? AND organization_id = ?").get(customerId, identity.organizationId)) throw new ApiError(404, "Kundenfreigabe nicht gefunden.", "not_found");
  const uniqueIds = [...new Set(evidenceIds)];
  if (uniqueIds.length !== evidenceIds.length || uniqueIds.length > 100) throw new ApiError(422, "Ungültige Evidenzfreigabe.", "validation_error");
  for (const evidenceId of uniqueIds) {
    if (!database.prepare("SELECT id FROM evidence WHERE id = ? AND organization_id = ?").get(evidenceId, identity.organizationId)) throw new ApiError(422, "Nachweis gehört nicht zu Ihrer Organisation.", "invalid_evidence");
  }
  database.transaction(() => {
    database.prepare("DELETE FROM customer_evidence_grants WHERE customer_access_id = ?").run(customerId);
    const insert = database.prepare("INSERT INTO customer_evidence_grants (customer_access_id, evidence_id, created_at) VALUES (?, ?, ?)");
    for (const evidenceId of uniqueIds) insert.run(customerId, evidenceId, now());
    const areas = uniqueIds.length
      ? database.prepare(`SELECT DISTINCT area FROM evidence WHERE organization_id = ? AND id IN (${uniqueIds.map(() => "?").join(",")}) ORDER BY area COLLATE NOCASE`).all(identity.organizationId, ...uniqueIds) as { area: string }[]
      : [];
    database.prepare("UPDATE customer_access SET scope_description = ?, updated_at = ? WHERE id = ? AND organization_id = ?").run(areas.map((entry) => entry.area).join(", "), now(), customerId, identity.organizationId);
  })();
  audit(identity, "customer_access", customerId, "evidence_grants_replaced", { evidenceCount: uniqueIds.length });
  return listCustomerEvidenceGrants(identity, customerId);
}

export function listAuditLog(identity: SessionIdentity, limit = 50) {
  return db().prepare("SELECT a.id, a.entity_type AS entityType, a.entity_id AS entityId, a.action, a.metadata_json AS metadataJson, a.created_at AS createdAt, u.name AS actorName FROM audit_log a LEFT JOIN users u ON u.id = a.actor_user_id WHERE a.organization_id = ? ORDER BY a.created_at DESC LIMIT ?").all(identity.organizationId, limit);
}
