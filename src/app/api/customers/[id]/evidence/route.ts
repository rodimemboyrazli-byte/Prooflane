import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { ApiError, jsonError, readJson, requireSameOrigin } from "@/lib/server/http";
import { replaceCustomerEvidenceGrants } from "@/lib/server/workspace";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    if (!Array.isArray(body.evidenceIds) || body.evidenceIds.some((id) => typeof id !== "string" || id.length > 64)) throw new ApiError(422, "evidenceIds ist ungültig.", "validation_error");
    const { id } = await params;
    return Response.json({ evidence: replaceCustomerEvidenceGrants(identity, id, body.evidenceIds) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
