import { attachSession, authenticate, createSession } from "@/lib/server/auth";
import { jsonError, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const user = await authenticate(requiredString(body.email, "E-Mail", 254), requiredString(body.password, "Passwort", 256));
    const response = Response.json({ user: { id: user.id, email: user.email, name: user.name } }, { headers: { "Cache-Control": "no-store" } });
    return attachSession(response, createSession(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
