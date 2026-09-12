import { requireSession } from "@/lib/server/auth";
import { readEvidencePdf } from "@/lib/server/evidence-documents";
import { jsonError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { document, contents } = await readEvidencePdf(await requireSession(), id);
    return new Response(new Uint8Array(contents), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.originalName)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    return jsonError(error);
  }
}
