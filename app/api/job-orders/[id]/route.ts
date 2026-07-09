import { NextResponse } from "next/server"
import { getJobOrder, updateJobOrderStatus, deleteJobOrder, cloneJobOrder, updateJobOrder, addQCResult, buildMaterials } from "@/lib/db/job-order-queries"
import { issueStock } from "@/lib/db/stock-mutations"
import { db } from "@/lib/db"
import { jobOrders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { JOStatus } from "@/lib/job-order-types"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const jo = await getJobOrder(id)
    if (!jo) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ jobOrder: jo })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()

    if (body.action === "clone") {
      const newId = await cloneJobOrder(id)
      return newId
        ? NextResponse.json({ id: newId })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (body.action === "edit") {
      const { action, ...data } = body
      const ok = await updateJobOrder(id, data)
      return ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (body.action === "add_qc_result") {
      const { parameter, specification, result, status: qcStatus, tester } = body
      if (!parameter || !result) return NextResponse.json({ error: "parameter and result required" }, { status: 400 })
      const entry = {
        id: `qc-${id}-${Date.now()}`,
        parameter,
        specification: specification ?? "",
        result,
        status: qcStatus ?? "pending",
        tester: tester ?? "Admin",
        testedAt: new Date().toISOString(),
      }
      const ok = await addQCResult(id, entry)
      return ok ? NextResponse.json({ ok: true, entry }) : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Default: status change
    const { status } = body
    if (!status) return NextResponse.json({ error: "status required" }, { status: 400 })

    // When JO moves to production, auto-issue raw materials from stock
    const stockIssues: { item: string; qty: number; ok: boolean; error?: string }[] = []
    if (status === "in_production" || status === "in_progress") {
      const [joRow] = await db.select().from(jobOrders).where(eq(jobOrders.id, id)).limit(1)
      if (joRow?.formulaId) {
        const materials = await buildMaterials(joRow.formulaId, joRow.batchSizeKg)
        for (const mat of materials) {
          const scId = mat.stockCardId
          if (!scId || mat.requiredQty <= 0) continue
          try {
            await issueStock({
              stockCardId: scId,
              quantity: mat.requiredQty,
              movementType: "use_out",
              notes: `JO ${joRow.jobNo} — production issue`,
              createdBy: "system",
            })
            stockIssues.push({ item: mat.name, qty: mat.requiredQty, ok: true })
          } catch (err) {
            // Insufficient stock is not fatal — record and continue
            stockIssues.push({ item: mat.name, qty: mat.requiredQty, ok: false, error: String(err) })
          }
        }
      }
    }

    await updateJobOrderStatus(id, status as JOStatus)
    return NextResponse.json({ ok: true, stockIssues })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const ok = await deleteJobOrder(id)
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
