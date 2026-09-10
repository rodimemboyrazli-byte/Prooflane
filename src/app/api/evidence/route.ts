import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { evidenceStatuses } from "@/lib/server/db/schema";
import { jsonError, oneOf, optionalDate, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";
import { createEvidence, listEvidence } from "@/lib/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ evidence: listEvidence(await requireSession()) }, { headers: { "Cache-Control": "no-store" } });
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
    const evidence = createEvidence(identity, {
      title: requiredString(body.title, "Titel", 200),
      area: requiredString(body.area, "Bereich", 100),
      level: requiredString(body.level, "Evidenzstufe", 100),
      validUntil: optionalDate(body.validUntil, "Ablaufdatum"),
      status: oneOf(body.status ?? "draft", evidenceStatuses, "Status"),
    });
    return Response.json({ evidence }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
