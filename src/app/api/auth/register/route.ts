import { ApiError, jsonError, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    throw new ApiError(403, "Konten werden erst nach interner Freigabe angelegt.", "registration_closed");
  } catch (error) {
    return jsonError(error);
  }
}
