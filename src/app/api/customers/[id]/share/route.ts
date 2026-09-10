import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { shareStates } from "@/lib/server/db/schema";
import { jsonError, oneOf, readJson, requireSameOrigin } from "@/lib/server/http";
import { updateCustomerShare } from "@/lib/server/workspace";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const body = await readJson(request);
    const { id } = await params;
    return Response.json({ customer: updateCustomerShare(identity, id, oneOf(body.shareState, shareStates, "Freigabestatus")) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
