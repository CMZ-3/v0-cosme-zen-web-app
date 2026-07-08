import { NextResponse } from "next/server"
import {
  getWorkflowSnapshot,
  splitReserve,
  linkReservation,
  partialReceive,
  generatePO,
} from "@/lib/db/sim-workflow"

export async function GET() {
  try {
    const snapshot = await getWorkflowSnapshot()
    return NextResponse.json(snapshot)
  } catch (err) {
    console.error("[v0] GET /api/stock/workflow error:", err)
    return NextResponse.json({ error: "Failed to load workflow" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const action = body.action as string

    switch (action) {
      case "splitReserve": {
        const result = await splitReserve(body.prefix ?? "", body.memoryBank ?? [])
        return NextResponse.json({ ok: true, ...result })
      }
      case "linkReservation": {
        const result = await linkReservation(body.resId, body.jobNo)
        return NextResponse.json({ ok: true, ...result })
      }
      case "partialReceive": {
        const result = await partialReceive(body.poNo, body.quantities ?? [])
        return NextResponse.json({ ok: true, ...result })
      }
      case "generatePO": {
        const result = await generatePO(body.itemId, body.shortageQty, body.orderQty)
        return NextResponse.json({ ok: true, ...result })
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Workflow action failed"
    console.error("[v0] POST /api/stock/workflow error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
