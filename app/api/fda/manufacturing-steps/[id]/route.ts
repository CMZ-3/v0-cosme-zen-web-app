import { NextResponse } from "next/server"
import { deleteFdaManufacturingStep } from "@/lib/db/fda-product-queries"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const ok = await deleteFdaManufacturingStep(id)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[FDA manufacturing step DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
