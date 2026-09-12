import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { taskStatuses } from "@/lib/server/db/schema";
import { ApiError, jsonError, oneOf, readJson, requireSameOrigin } from "@/lib/server/http";
import { updateTasksStatus } from "@/lib/server/workspace";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string" || id.length > 64)) throw new ApiError(422, "ids ist ungültig.", "validation_error");
    const status = oneOf(body.status, taskStatuses, "Status");
    return Response.json({ tasks: updateTasksStatus(identity, body.ids, status) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
