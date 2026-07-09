import { NextResponse } from "next/server"
import { updateFdaRawMaterialSpec, deleteFdaRawMaterialSpec } from "@/lib/db/fda-product-queries"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const ok = await updateFdaRawMaterialSpec(id, body)
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[FDA raw material spec PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const ok = await deleteFdaRawMaterialSpec(id)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[FDA raw material spec DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
