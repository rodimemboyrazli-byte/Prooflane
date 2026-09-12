import "server-only";

import PDFDocument from "pdfkit";
import { db } from "@/lib/server/db";
import type { SessionIdentity } from "@/lib/server/db/schema";
import { ApiError } from "@/lib/server/http";

type CustomerRow = { id: string; companyName: string; contactEmail: string; scopeDescription: string; shareState: "private" | "shared"; updatedAt: string };
type GrantedEvidenceRow = { title: string; area: string; level: string; validUntil: string | null; status: string; documentCount: number };

function safeFilePart(value: string) {
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").trim().replace(/\s+/g, "-").slice(0, 90) || "kunde";
}

function statusLabel(status: string) {
  return ({ approved: "Aktuell", needs_review: "Prüfung nötig", draft: "Entwurf", expired: "Abgelaufen" } as Record<string, string>)[status] || status;
}

export async function createCustomerReport(identity: SessionIdentity, customerId: string) {
  const database = db();
  const customer = database.prepare("SELECT id, company_name AS companyName, contact_email AS contactEmail, scope_description AS scopeDescription, share_state AS shareState, updated_at AS updatedAt FROM customer_access WHERE id = ? AND organization_id = ?").get(customerId, identity.organizationId) as CustomerRow | undefined;
  if (!customer) throw new ApiError(404, "Kundenfreigabe nicht gefunden.", "not_found");
  const evidence = database.prepare("SELECT e.title, e.area, e.evidence_level AS level, e.valid_until AS validUntil, e.status, (SELECT COUNT(*) FROM evidence_documents d WHERE d.evidence_id = e.id) AS documentCount FROM customer_evidence_grants g JOIN evidence e ON e.id = g.evidence_id WHERE g.customer_access_id = ? AND e.organization_id = ? ORDER BY e.area COLLATE NOCASE, e.title COLLATE NOCASE").all(customerId, identity.organizationId) as GrantedEvidenceRow[];

  const currentCount = evidence.filter((item) => item.status === "approved").length;
  const document = new PDFDocument({ size: "A4", margin: 54, info: { Title: `Kundenfreigabe - ${customer.companyName}`, Author: "Prooflane" } });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  const result = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  document.fillColor("#4556ff").fontSize(10).text("PROOFLANE / KUNDENFREIGABE");
  document.moveDown(1.1).fillColor("#191b25").fontSize(25).text(customer.companyName);
  document.moveDown(.4).fontSize(10).fillColor("#666b7d").text(`Erstellt am ${new Date().toLocaleDateString("de-DE")} · Kontakt: ${customer.contactEmail}`);
  document.moveDown(1.5).fillColor("#191b25").fontSize(14).text("Freigabestatus");
  document.moveDown(.4).fontSize(10).text(`Zugriff: ${customer.shareState === "shared" ? "Freigegeben" : "Privat"}\nUmfang: ${customer.scopeDescription || "Noch keine Bereiche"}\nAktuelle Nachweise: ${currentCount} von ${evidence.length}`);
  document.moveDown(1.5).fontSize(14).text("Ausgewählte Nachweise");
  document.moveDown(.5).fontSize(10);
  if (!evidence.length) document.fillColor("#666b7d").text("Keine Nachweise ausgewählt.");
  for (const [index, item] of evidence.entries()) {
    document.fillColor("#191b25").fontSize(11).text(`${index + 1}. ${item.title}`);
    document.fillColor("#666b7d").fontSize(9).text(`${item.area} · ${item.level} · ${statusLabel(item.status)} · gültig bis ${item.validUntil || "offen"} · ${item.documentCount} PDF`);
    document.moveDown(.65);
  }
  document.moveDown(1.3).fontSize(8).fillColor("#666b7d").text("Dieser Bericht bildet die aktuell konfigurierte Kundensicht im geschützten Prooflane Operations System ab.");
  document.end();
  return { fileName: `prooflane-${safeFilePart(customer.companyName)}-freigabe.pdf`, contents: await result };
}
