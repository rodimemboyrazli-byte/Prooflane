import { attachSession, createSession, registerUser } from "@/lib/server/auth";
import { jsonError, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    const user = await registerUser({
      email: requiredString(body.email, "E-Mail", 254),
      password: requiredString(body.password, "Passwort", 256),
      name: requiredString(body.name, "Name", 120),
      organizationName: requiredString(body.organizationName, "Organisation", 160),
    });
    const response = Response.json({ user }, { status: 201, headers: { "Cache-Control": "no-store" } });
    return attachSession(response, createSession(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
