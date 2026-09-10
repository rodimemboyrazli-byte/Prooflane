import "server-only";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code = "request_failed") {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error("Unhandled API error", error);
  return Response.json({ error: "Interner Serverfehler.", code: "internal_error" }, { status: 500 });
}

export async function readJson(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Ungültiger JSON-Body.", "invalid_json");
  }
}

export function requiredString(value: unknown, field: string, maxLength = 255) {
  if (typeof value !== "string") throw new ApiError(422, `${field} fehlt.`, "validation_error");
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new ApiError(422, `${field} ist ungültig.`, "validation_error");
  return normalized;
}

export function optionalString(value: unknown, field: string, maxLength = 255) {
  if (value === undefined || value === null || value === "") return null;
  return requiredString(value, field, maxLength);
}

export function oneOf<T extends readonly string[]>(value: unknown, values: T, field: string): T[number] {
  if (typeof value !== "string" || !values.includes(value)) throw new ApiError(422, `${field} ist ungültig.`, "validation_error");
  return value as T[number];
}

export function optionalDate(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) throw new ApiError(422, `${field} ist ungültig.`, "validation_error");
  return value;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const fallback = `http://${request.headers.get("host")}`;
  const allowedOrigin = process.env.APP_ORIGIN || fallback;
  try {
    if (new URL(origin).origin !== new URL(allowedOrigin).origin) throw new Error();
  } catch {
    throw new ApiError(403, "Ungültige Anfrage-Herkunft.", "invalid_origin");
  }
}
