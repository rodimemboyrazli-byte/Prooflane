import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { taskStatuses } from "@/lib/server/db/schema";
import { jsonError, oneOf, optionalDate, optionalString, readJson, requireSameOrigin, requiredString } from "@/lib/server/http";
import { createTask, listTasks } from "@/lib/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ tasks: listTasks(await requireSession()) }, { headers: { "Cache-Control": "no-store" } });
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
    const task = createTask(identity, {
      title: requiredString(body.title, "Titel", 200),
      assignee: optionalString(body.assignee, "Verantwortlich", 120),
      dueDate: optionalDate(body.dueDate, "Termin"),
      evidenceId: optionalString(body.evidenceId, "Nachweis", 64),
      status: oneOf(body.status ?? "open", taskStatuses, "Status"),
    });
    return Response.json({ task }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
