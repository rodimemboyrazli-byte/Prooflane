import { revokeCurrentSession } from "@/lib/server/auth";
import { jsonError, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const response = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    response.headers.append("Set-Cookie", await revokeCurrentSession());
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
