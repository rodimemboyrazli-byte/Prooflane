import { createAccessRequest } from "@/lib/server/access-requests";
import { jsonError, optionalString, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    createAccessRequest({
      email: requiredString(body.email, "E-Mail", 254),
      name: requiredString(body.name, "Name", 120),
      organizationName: requiredString(body.organizationName, "Organisation", 160),
      message: optionalString(body.message, "Nachricht", 1000),
    });
    return Response.json({ message: "Anfrage erhalten." }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
