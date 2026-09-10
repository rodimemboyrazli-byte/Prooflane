import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { shareStates } from "@/lib/server/db/schema";
import { ApiError, jsonError, oneOf, optionalString, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";
import { createCustomer, listCustomers } from "@/lib/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ customers: listCustomers(await requireSession()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    const contactEmail = requiredString(body.contactEmail, "Kontakt-E-Mail", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new ApiError(422, "Kontakt-E-Mail ist ungültig.", "validation_error");
    const customer = createCustomer(identity, {
      companyName: requiredString(body.companyName, "Unternehmen", 160),
      contactEmail,
      scopeDescription: optionalString(body.scopeDescription, "Umfang", 500) || "",
      shareState: oneOf(body.shareState ?? "private", shareStates, "Freigabestatus"),
    });
    return Response.json({ customer }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
