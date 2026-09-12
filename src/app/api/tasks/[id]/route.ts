import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { taskStatuses } from "@/lib/server/db/schema";
import { ApiError, jsonError, oneOf, optionalDate, optionalString, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";
import { deleteTask, updateTask } from "@/lib/server/workspace";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const { id } = await params;
    deleteTask(identity, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    const patch: Parameters<typeof updateTask>[2] = {};
    if ("title" in body) patch.title = requiredString(body.title, "Titel", 200);
    if ("assignee" in body) patch.assignee = optionalString(body.assignee, "Verantwortlich", 120);
    if ("dueDate" in body) patch.dueDate = optionalDate(body.dueDate, "Termin");
    if ("evidenceId" in body) patch.evidenceId = optionalString(body.evidenceId, "Nachweis", 64);
    if ("status" in body) patch.status = oneOf(body.status, taskStatuses, "Status");
    if (!Object.keys(patch).length) throw new ApiError(422, "Keine Änderung übergeben.", "validation_error");
    const { id } = await params;
    return Response.json({ task: updateTask(identity, id, patch) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
