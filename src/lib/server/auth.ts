import "server-only";

import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { db } from "@/lib/server/db";
import type { Role, SessionIdentity } from "@/lib/server/db/schema";
import { ApiError } from "@/lib/server/http";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "prooflane_session";
const SESSION_DAYS = 7;
const DEMO_EMAIL = "demo@prooflane.test";
const DEMO_PASSWORD = "Prooflane!2026";
type UserRow = { id: string; email: string; name: string; password_hash: string };
type IdentityRow = { user_id: string; organization_id: string; role: Role; email: string; name: string; organization_name: string };

function now() { return new Date().toISOString(); }
function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
function expiry() { return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString(); }

async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}

async function passwordMatches(password: string, stored: string) {
  const [algorithm, salt, encoded] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  const expected = Buffer.from(encoded, "hex");
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function validatePassword(password: string) {
  if (password.length < 12 || password.length > 256) throw new ApiError(422, "Passwort braucht 12 bis 256 Zeichen.", "weak_password");
}

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) throw new ApiError(422, "E-Mail ist ungültig.", "invalid_email");
  return normalized;
}

function demoAccountAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_ACCOUNT === "true";
}

async function provisionDemoAccount(email: string, password: string): Promise<UserRow | null> {
  if (!demoAccountAllowed() || email !== DEMO_EMAIL || password !== DEMO_PASSWORD) return null;
  const database = db();
  let user = database.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(DEMO_EMAIL) as UserRow | undefined;
  if (user) return user;

  try {
    const account = await registerUser({ email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Mara Hoffmann", organizationName: "Musterwerk GmbH" });
    const timestamp = now();
    const evidenceCurrent = randomUUID();
    const evidenceReview = randomUUID();
    const taskId = randomUUID();
    const customerId = randomUUID();
    database.transaction(() => {
      database.prepare("INSERT INTO evidence (id, organization_id, title, area, evidence_level, valid_until, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(evidenceCurrent, account.organizationId, "ISO 27001 Zertifikat", "Informationssicherheit", "Extern bestätigt", "2027-06-30", "approved", account.id, timestamp, timestamp);
      database.prepare("INSERT INTO evidence (id, organization_id, title, area, evidence_level, valid_until, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(evidenceReview, account.organizationId, "Notfallhandbuch", "Notfallmanagement", "Technisch belegt", "2026-10-15", "needs_review", account.id, timestamp, timestamp);
      database.prepare("INSERT INTO tasks (id, organization_id, evidence_id, title, assignee, due_date, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(taskId, account.organizationId, evidenceReview, "Notfallhandbuch prüfen", "Mara Hoffmann", "2026-10-01", "open", account.id, timestamp, timestamp);
      database.prepare("INSERT INTO customer_access (id, organization_id, company_name, contact_email, scope_description, share_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(customerId, account.organizationId, "Nordwerk GmbH", "security@nordwerk.test", "Informationssicherheit", "shared", timestamp, timestamp);
      database.prepare("INSERT INTO customer_evidence_grants (customer_access_id, evidence_id, created_at) VALUES (?, ?, ?)").run(customerId, evidenceCurrent, timestamp);
      database.prepare("INSERT INTO audit_log (id, organization_id, actor_user_id, entity_type, entity_id, action, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(randomUUID(), account.organizationId, account.id, "organization", account.organizationId, "demo_seeded", JSON.stringify({ source: "local_demo" }), timestamp);
    })();
    user = database.prepare("SELECT id, email, name, password_hash FROM users WHERE id = ?").get(account.id) as UserRow;
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== "email_taken") throw error;
    user = database.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(DEMO_EMAIL) as UserRow | undefined;
  }
  return user || null;
}

export async function registerUser(input: { email: string; password: string; name: string; organizationName: string }) {
  const email = normalizeEmail(input.email);
  validatePassword(input.password);
  const name = input.name.trim();
  const organizationName = input.organizationName.trim();
  if (!name || name.length > 120 || !organizationName || organizationName.length > 160) throw new ApiError(422, "Name oder Organisation ist ungültig.", "validation_error");
  const database = db();
  if (database.prepare("SELECT id FROM users WHERE email = ?").get(email)) throw new ApiError(409, "Für diese E-Mail existiert bereits ein Konto.", "email_taken");
  const userId = randomUUID();
  const organizationId = randomUUID();
  const timestamp = now();
  const hash = await passwordHash(input.password);
  database.transaction(() => {
    database.prepare("INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(userId, email, name, hash, timestamp, timestamp);
    database.prepare("INSERT INTO organizations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)").run(organizationId, organizationName, timestamp, timestamp);
    database.prepare("INSERT INTO memberships (user_id, organization_id, role, created_at) VALUES (?, ?, ?, ?)").run(userId, organizationId, "owner", timestamp);
  })();
  return { id: userId, email, name, organizationId, role: "owner" as const };
}

export async function authenticate(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  if (email === DEMO_EMAIL && !demoAccountAllowed()) throw new ApiError(401, "E-Mail oder Passwort falsch.", "invalid_credentials");
  let user = db().prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?").get(email) as UserRow | undefined;
  if (!user) user = await provisionDemoAccount(email, password) || undefined;
  if (!user || !(await passwordMatches(password, user.password_hash))) throw new ApiError(401, "E-Mail oder Passwort falsch.", "invalid_credentials");
  return user;
}

export function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  db().prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(tokenHash(token), userId, expiry(), now());
  return token;
}

export function attachSession(response: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  response.headers.append("Set-Cookie", `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${isProduction ? "; Secure" : ""}`);
  return response;
}

export async function getSession(): Promise<SessionIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const identity = db().prepare("SELECT u.id AS user_id, m.organization_id, m.role, u.email, u.name, o.name AS organization_name FROM sessions s JOIN users u ON u.id = s.user_id JOIN memberships m ON m.user_id = u.id JOIN organizations o ON o.id = m.organization_id WHERE s.token_hash = ? AND s.expires_at > ? ORDER BY m.created_at ASC LIMIT 1").get(tokenHash(token), now()) as IdentityRow | undefined;
  if (!identity) return null;
  return { userId: identity.user_id, organizationId: identity.organization_id, role: identity.role, email: identity.email, name: identity.name, organizationName: identity.organization_name };
}

export async function requireSession() {
  const identity = await getSession();
  if (!identity) throw new ApiError(401, "Anmeldung erforderlich.", "unauthenticated");
  return identity;
}

export function requireWriteRole(identity: SessionIdentity) {
  if (identity.role === "viewer") throw new ApiError(403, "Ihre Rolle darf keine Änderungen vornehmen.", "forbidden");
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
