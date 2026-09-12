import { requireSession, requireWriteRole } from "@/lib/server/auth";
import { listEvidenceDocuments, uploadEvidencePdf } from "@/lib/server/evidence-documents";
import { ApiError, jsonError, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const identity = await requireSession();
    const { id } = await params;
    return Response.json({ documents: listEvidenceDocuments(identity, id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const identity = await requireSession();
    requireWriteRole(identity);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(422, "PDF-Datei fehlt.", "validation_error");
    const { id } = await params;
    return Response.json({ document: await uploadEvidencePdf(identity, id, file) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
