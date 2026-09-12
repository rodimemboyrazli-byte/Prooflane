import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import PDFDocument from "pdfkit";
import { db } from "@/lib/server/db";
import type { SessionIdentity } from "@/lib/server/db/schema";
import { ApiError } from "@/lib/server/http";

const MAX_PDF_BYTES = 15 * 1024 * 1024;
type DocumentRow = { id: string; evidenceId: string; originalName: string; storageKey: string; mimeType: "application/pdf"; sizeBytes: number; source: "upload" | "generated"; createdAt: string };
type EvidenceRow = { id: string; title: string; area: string; level: string; validUntil: string | null; status: string; createdAt: string; updatedAt: string };

function uploadsPath() {
  const configured = process.env.UPLOADS_PATH;
  return configured ? resolve(/* turbopackIgnore: true */ configured) : join(process.cwd(), "data", "uploads");
}

function findEvidence(identity: SessionIdentity, evidenceId: string) {
  const evidence = db().prepare("SELECT id, title, area, evidence_level AS level, valid_until AS validUntil, status, created_at AS createdAt, updated_at AS updatedAt FROM evidence WHERE id = ? AND organization_id = ?").get(evidenceId, identity.organizationId) as EvidenceRow | undefined;
  if (!evidence) throw new ApiError(404, "Nachweis nicht gefunden.", "not_found");
  return evidence;
}

function documentRow(identity: SessionIdentity, documentId: string) {
  const document = db().prepare("SELECT id, evidence_id AS evidenceId, original_name AS originalName, storage_key AS storageKey, mime_type AS mimeType, size_bytes AS sizeBytes, source, created_at AS createdAt FROM evidence_documents WHERE id = ? AND organization_id = ?").get(documentId, identity.organizationId) as DocumentRow | undefined;
  if (!document) throw new ApiError(404, "PDF nicht gefunden.", "not_found");
  return document;
}

function safeFileName(name: string) {
  const normalized = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
  return (normalized || "nachweis.pdf").slice(0, 180).toLowerCase().endsWith(".pdf") ? (normalized || "nachweis.pdf").slice(0, 180) : `${(normalized || "nachweis").slice(0, 176)}.pdf`;
}

export function listEvidenceDocuments(identity: SessionIdentity, evidenceId: string) {
  findEvidence(identity, evidenceId);
  return db().prepare("SELECT id, evidence_id AS evidenceId, original_name AS originalName, size_bytes AS sizeBytes, source, created_at AS createdAt FROM evidence_documents WHERE evidence_id = ? AND organization_id = ? ORDER BY created_at DESC").all(evidenceId, identity.organizationId);
}

export async function uploadEvidencePdf(identity: SessionIdentity, evidenceId: string, file: File) {
  findEvidence(identity, evidenceId);
  if (file.size < 1 || file.size > MAX_PDF_BYTES) throw new ApiError(422, "PDF muss zwischen 1 Byte und 15 MB groß sein.", "invalid_file_size");
  if (file.type && file.type !== "application/pdf") throw new ApiError(422, "Nur PDF-Dateien sind erlaubt.", "invalid_file_type");
  const contents = Buffer.from(await file.arrayBuffer());
  if (!contents.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new ApiError(422, "Datei ist kein gültiges PDF.", "invalid_pdf");

  const id = randomUUID();
  const storageKey = `${id}.pdf`;
  const root = uploadsPath();
  const path = join(root, storageKey);
  await mkdir(root, { recursive: true });
  await writeFile(path, contents, { flag: "wx" });
  const timestamp = new Date().toISOString();
  try {
    db().prepare("INSERT INTO evidence_documents (id, organization_id, evidence_id, original_name, storage_key, mime_type, size_bytes, source, created_by, created_at) VALUES (?, ?, ?, ?, ?, 'application/pdf', ?, 'upload', ?, ?)").run(id, identity.organizationId, evidenceId, safeFileName(file.name), storageKey, contents.length, identity.userId, timestamp);
  } catch (error) {
    await unlink(path).catch(() => undefined);
    throw error;
  }
  return documentRow(identity, id);
}

export async function readEvidencePdf(identity: SessionIdentity, documentId: string) {
  const document = documentRow(identity, documentId);
  try {
    return { document, contents: await readFile(join(uploadsPath(), document.storageKey)) };
  } catch {
    throw new ApiError(404, "PDF-Datei nicht gefunden.", "file_missing");
  }
}

function statusLabel(status: string) {
  return ({ approved: "Aktuell", needs_review: "Prüfung nötig", draft: "Entwurf", expired: "Abgelaufen" } as Record<string, string>)[status] || status;
}

export async function createEvidenceReport(identity: SessionIdentity, evidenceId: string) {
  const evidence = findEvidence(identity, evidenceId);
  const documents = listEvidenceDocuments(identity, evidenceId) as Array<{ originalName: string; createdAt: string }>;
  const tasks = db().prepare("SELECT title, assignee, due_date AS dueDate, status FROM tasks WHERE evidence_id = ? AND organization_id = ? ORDER BY due_date ASC").all(evidenceId, identity.organizationId) as Array<{ title: string; assignee: string | null; dueDate: string | null; status: string }>;
  const document = new PDFDocument({ size: "A4", margin: 54, info: { Title: `Nachweisbericht - ${evidence.title}`, Author: "Prooflane" } });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  const result = new Promise<Buffer>((resolve, reject) => { document.on("end", () => resolve(Buffer.concat(chunks))); document.on("error", reject); });
  document.fillColor("#1b2430").fontSize(10).text("PROOFLANE / NACHWEISBERICHT");
  document.moveDown(1.1).fontSize(24).text(evidence.title);
  document.moveDown(.5).fontSize(10).fillColor("#59636e").text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`);
  document.moveDown(1.4).fillColor("#1b2430").fontSize(14).text("Stammdaten");
  document.moveDown(.45).fontSize(10).text(`Bereich: ${evidence.area}\nEvidenzstufe: ${evidence.level}\nStatus: ${statusLabel(evidence.status)}\nGültig bis: ${evidence.validUntil || "Nicht hinterlegt"}`);
  document.moveDown(1.3).fontSize(14).text("Angehängte PDFs");
  document.moveDown(.45).fontSize(10).text(documents.length ? documents.map((item, index) => `${index + 1}. ${item.originalName}`).join("\n") : "Keine PDFs angehängt.");
  document.moveDown(1.3).fontSize(14).text("Verknüpfte Maßnahmen");
  document.moveDown(.45).fontSize(10).text(tasks.length ? tasks.map((item, index) => `${index + 1}. ${item.title} - ${item.status}${item.dueDate ? ` - fällig ${item.dueDate}` : ""}${item.assignee ? ` - ${item.assignee}` : ""}`).join("\n") : "Keine Maßnahmen verknüpft.");
  document.moveDown(2).fontSize(8).fillColor("#59636e").text("Dieser Bericht wurde aus dem geschützten Prooflane Operations System erzeugt.");
  document.end();
  return { fileName: `prooflane-${safeFileName(evidence.title).replace(/\.pdf$/i, "")}-bericht.pdf`, contents: await result };
}
