import { requireSession } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { workspaceSummary } from "@/lib/server/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ summary: workspaceSummary(await requireSession()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
