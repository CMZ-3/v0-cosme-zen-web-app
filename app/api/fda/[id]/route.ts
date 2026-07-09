import { NextResponse } from "next/server"
import {
  getFdaDetail,
  getFdaIngredients,
  getFdaManufacturingSteps,
  getFdaRawMaterialSpecs,
  getFdaDocuments,
  getFdaChecklist,
  getFdaAuditLogs,
  updateFdaStatus,
  updateFdaRegistration,
  deleteFdaRegistration,
  cloneFdaRegistration,
} from "@/lib/db/fda-product-queries"
import type { FdaStatus } from "@/lib/fda-types"

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    if (body.action === "status") {
      const ok = await updateFdaStatus(id, body.status as FdaStatus, {
        approvalComment: body.approvalComment,
        rejectionReason: body.rejectionReason,
      })
      return ok
        ? NextResponse.json({ success: true })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (body.action === "clone") {
      const cloned = await cloneFdaRegistration(id)
      return cloned
        ? NextResponse.json({ id: cloned.id, registrationCode: cloned.registrationCode })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    // General field update
    const { action, ...data } = body
    const ok = await updateFdaRegistration(id, data)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[FDA PATCH API]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const ok = await deleteFdaRegistration(id)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[FDA DELETE API]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
