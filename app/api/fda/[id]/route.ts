import { NextResponse } from "next/server"
import {
  getFdaDetail,
  getFdaIngredients,
  getFdaManufacturingSteps,
  getFdaRawMaterialSpecs,
  getFdaDocuments,
  getFdaChecklist,
  getFdaAuditLogs,
} from "@/lib/db/fda-product-queries"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const [detail, ingredients, manufacturingSteps, rawMaterialSpecs, documents, checklist, auditLogs] =
      await Promise.all([
        getFdaDetail(id),
        getFdaIngredients(id),
        getFdaManufacturingSteps(id),
        getFdaRawMaterialSpecs(id),
        getFdaDocuments(id),
        getFdaChecklist(id),
        getFdaAuditLogs(id),
      ])

    if (!detail) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({
      detail,
      ingredients,
      manufacturingSteps,
      rawMaterialSpecs,
      documents,
      checklist,
      auditLogs,
    })
  } catch (err) {
    console.error("[FDA detail API]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
