import { requireSession } from "@/lib/server/auth";
import { ApiError, jsonError } from "@/lib/server/http";
import { listAuditLog } from "@/lib/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const rawLimit = new URL(request.url).searchParams.get("limit") || "50";
    const limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new ApiError(422, "limit muss zwischen 1 und 100 liegen.", "validation_error");
    return Response.json({ events: listAuditLog(await requireSession(), limit) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
