import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockLots } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const lots = await db.select().from(stockLots).orderBy(desc(stockLots.createdAt))
    return NextResponse.json({ lots })
  } catch (err) {
    console.error("[lots] GET error:", err)
    return NextResponse.json({ error: "Failed to fetch lots" }, { status: 500 })
  }
}
