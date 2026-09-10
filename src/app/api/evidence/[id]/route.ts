import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { evidenceStatuses } from "@/lib/server/db/schema";
import { ApiError, jsonError, oneOf, optionalDate, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";
import { updateEvidence } from "@/lib/server/workspace";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    const patch: Parameters<typeof updateEvidence>[2] = {};
    if ("title" in body) patch.title = requiredString(body.title, "Titel", 200);
    if ("area" in body) patch.area = requiredString(body.area, "Bereich", 100);
    if ("level" in body) patch.level = requiredString(body.level, "Evidenzstufe", 100);
    if ("validUntil" in body) patch.validUntil = optionalDate(body.validUntil, "Ablaufdatum");
    if ("status" in body) patch.status = oneOf(body.status, evidenceStatuses, "Status");
    if (!Object.keys(patch).length) throw new ApiError(422, "Keine Änderung übergeben.", "validation_error");
    const { id } = await params;
    return Response.json({ evidence: updateEvidence(identity, id, patch) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
