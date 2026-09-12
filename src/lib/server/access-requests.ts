import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/db";
import { ApiError } from "@/lib/server/http";

function normalizeEmail(input: string) {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new ApiError(422, "E-Mail ist ungültig.", "invalid_email");
  return email;
}

export function createAccessRequest(input: { email: string; name: string; organizationName: string; message: string | null }) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const organizationName = input.organizationName.trim();
  if (!name || name.length > 120 || !organizationName || organizationName.length > 160) throw new ApiError(422, "Name oder Organisation ist ungültig.", "validation_error");

  const timestamp = new Date().toISOString();
  db().prepare("INSERT INTO access_requests (id, email, name, organization_name, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?) ON CONFLICT(email) DO UPDATE SET name = excluded.name, organization_name = excluded.organization_name, message = excluded.message, status = CASE WHEN access_requests.status = 'rejected' THEN 'pending' ELSE access_requests.status END, updated_at = excluded.updated_at").run(randomUUID(), email, name, organizationName, input.message, timestamp, timestamp);
}
