import { requireSession } from "@/lib/server/auth";
import { createEvidenceReport } from "@/lib/server/evidence-documents";
import { jsonError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await createEvidenceReport(await requireSession(), id);
    return new Response(new Uint8Array(report.contents), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(report.fileName)}`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    return jsonError(error);
  }
}
