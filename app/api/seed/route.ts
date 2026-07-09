import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { stockCards, stockLots, stockMovements, stockReservations, simWorkflow, formulas, formulaIngredients, jobOrders, deliveryOrders, customers, suppliers, fdaRegistrations, products } from "@/lib/db/schema"
import { FORMULA_ROWS, INGREDIENT_ROWS, JOB_ORDER_ROWS } from "@/lib/db/formula-seed-data"
import { STOCK_IMPORT_ROWS } from "@/lib/db/stock-import-data"
import { mockDeliveryOrders } from "@/lib/delivery-mock-data"
import { mockCustomerList } from "@/lib/customer-mock-data"
import { mockSupplierList } from "@/lib/supplier-mock-data"
import { mockFdaList } from "@/lib/fda-mock-data"
import { mockProducts } from "@/lib/mock-data"

// Reset + seed the unified stock catalog. This REPLACES all stock rows with the
// 12-item simulation catalog so the whole module shares one source of truth.
// Destructive by design (it is the "Reset demo data" action); requires ?reset=1.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    if (url.searchParams.get("reset") !== "1") {
      return NextResponse.json(
        { ok: false, error: "Pass ?reset=1 to confirm a destructive reseed." },
        { status: 400 },
      )
    }

    // Stock catalog now comes from the imported Excel file (353 items).
    const cardRows = STOCK_IMPORT_ROWS.map((item) => ({
      ...item,
      userId: null,
    }))

    // Opening-balance ledger: one approved "buy_in" per item that has stock.
    const movementRows = STOCK_IMPORT_ROWS.filter((i) => i.balance > 0).map((i, idx) => ({
      id: `seed-open-${idx + 1}`,
      referenceNumber: `OPEN-${String(idx + 1).padStart(4, "0")}`,
      movementType: "buy_in",
      stockCardId: i.id,
      itemCode: i.itemCode,
      itemName: i.itemName,
      quantity: i.balance,
      unitCost: i.unitCost,
      totalCost: i.unitCost * i.balance,
      status: "approved",
      notes: "ยอดยกมา (นำเข้าจากไฟล์ StockCards)",
      createdBy: "seed",
    }))

    await db.transaction(async (tx) => {
      // Clear existing rows (order-independent since there are no FK constraints).
      await tx.delete(stockMovements)
      await tx.delete(stockLots)
      await tx.delete(stockReservations)
      await tx.delete(stockCards)
      await tx.delete(simWorkflow)

      // Insert stock cards in chunks to stay well under statement limits.
      for (let i = 0; i < cardRows.length; i += 100) {
        await tx.insert(stockCards).values(cardRows.slice(i, i + 100))
      }
      for (let i = 0; i < movementRows.length; i += 100) {
        await tx.insert(stockMovements).values(movementRows.slice(i, i + 100))
      }

      // Fresh simulation workflow — the old demo catalog is gone, so start empty.
      await tx.insert(simWorkflow).values({
        id: "default",
        purchaseOrders: [],
        jobReservations: [],
        savedReservations: [],
        receiveRecords: [],
        docCounters: { SSI: 0, SRE: 0, SIN: 0, SRR: 0 },
      })
    })

    // Seed formula + delivery + customers + suppliers on full reset.
    await seedFormulas()
    await seedDelivery()
    await seedCustomers()
    await seedSuppliers()
    await seedFda()
    await seedProducts()
    // Link formula ingredients to the freshly-imported stock catalog by name.
    const link = await linkFormulaIngredients()

    return NextResponse.json({
      ok: true,
      seeded: {
        stockCards: cardRows.length,
        stockMovements: movementRows.length,
        simWorkflow: 1,
        formulas: FORMULA_ROWS.length,
        formulaIngredients: INGREDIENT_ROWS.length,
        jobOrders: JOB_ORDER_ROWS.length,
        deliveryOrders: mockDeliveryOrders.length,
        customers: mockCustomerList.length,
        suppliers: mockSupplierList.length,
        fdaRegistrations: mockFdaList.length,
        products: mockProducts.length,
      },
      ingredientLink: link,
    })
  } catch (err) {
    console.error("[v0] seed error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// GET ?part=formulas  — re-seed formulas/ingredients/job_orders
// GET ?part=delivery  — re-seed delivery orders from mock
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const part = url.searchParams.get("part")
    if (part === "formulas") {
      await seedFormulas()
      const link = await linkFormulaIngredients()
      return NextResponse.json({
        ok: true,
        seeded: { formulas: FORMULA_ROWS.length, formulaIngredients: INGREDIENT_ROWS.length, jobOrders: JOB_ORDER_ROWS.length },
        ingredientLink: link,
      })
    }
    if (part === "link") {
      const link = await linkFormulaIngredients()
      return NextResponse.json({ ok: true, ingredientLink: link })
    }
    if (part === "delivery") {
      await seedDelivery()
      return NextResponse.json({ ok: true, seeded: { deliveryOrders: mockDeliveryOrders.length } })
    }
    if (part === "customers") {
      await seedCustomers()
      return NextResponse.json({ ok: true, seeded: { customers: mockCustomerList.length } })
    }
    if (part === "suppliers") {
      await seedSuppliers()
      return NextResponse.json({ ok: true, seeded: { suppliers: mockSupplierList.length } })
    }
    if (part === "fda") {
      await seedFda()
      return NextResponse.json({ ok: true, seeded: { fdaRegistrations: mockFdaList.length } })
    }
    if (part === "products") {
      await seedProducts()
      return NextResponse.json({ ok: true, seeded: { products: mockProducts.length } })
    }
    if (part === "stock") {
      // Seed opening-balance movements without touching stock cards
      const count = await seedStockMovements()
      return NextResponse.json({ ok: true, seeded: { stockMovements: count } })
    }
    return NextResponse.json({ ok: false, error: "Use ?part=formulas|link|delivery|customers|suppliers|fda|products|stock" }, { status: 400 })
  } catch (err) {
    console.error("[v0] seed GET error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

async function seedCustomers() {
  await db.delete(customers)
  await db.insert(customers).values(
    mockCustomerList.map((c) => ({
      id: c.id,
      customerCode: c.customerCode,
      customerName: c.customerName,
      customerNameEn: c.customerNameEn ?? null,
      customerType: c.customerType,
      customerTier: c.customerTier,
      businessType: c.businessType,
      contactPerson: c.contactPerson ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      creditLimit: c.creditLimit ?? null,
      creditUsed: c.creditUsed ?? null,
      isActive: c.isActive,
      totalOrders: c.totalOrders,
      totalRevenue: c.totalRevenue,
      productCount: c.productCount,
      brandCount: c.brandCount,
      leadSource: c.leadSource ?? null,
      province: c.province ?? null,
      country: c.country,
      address: null,
      city: null,
      postalCode: null,
      taxId: null,
      creditDays: 30,
      salesRepresentative: null,
      website: null,
      notes: null,
    }))
  )
}

async function seedSuppliers() {
  await db.delete(suppliers)
  await db.insert(suppliers).values(
    mockSupplierList.map((s) => ({
      id: s.id,
      supplierCode: s.supplierCode,
      supplierName: s.supplierName,
      supplierNameEn: s.supplierNameEn ?? null,
      supplierType: s.supplierType,
      country: s.country,
      city: s.city ?? null,
      contactPerson: s.contactPerson ?? null,
      email: s.email ?? null,
      phone: s.phone ?? null,
      isActive: s.isActive,
      isApproved: s.isApproved,
      grade: s.grade,
      qualityRating: s.qualityRating ?? null,
      deliveryRating: s.deliveryRating ?? null,
      priceRating: s.priceRating ?? null,
      materialTags: s.materialTags,
      status: s.status,
      description: null,
      address: null,
      taxId: null,
      paymentTerms: null,
      paymentDays: 30,
      website: null,
      notes: null,
      avgLeadTimeDays: null,
      ytdOrderValue: null,
      moq: null,
      onTimeDeliveryPct: null,
    }))
  )
}

async function seedFda() {
  await db.delete(fdaRegistrations)
  await db.insert(fdaRegistrations).values(
    mockFdaList.map((r) => ({
      id: r.id,
      registrationCode: r.registrationCode,
      registrationType: r.registrationType,
      registrationNumber: r.registrationNumber ?? null,
      productNameTh: r.productNameTh,
      productNameEn: r.productNameEn ?? null,
      tradeName: r.tradeName ?? null,
      cosmeticType: r.cosmeticType ?? null,
      status: r.status,
      expiryDate: r.expiryDate ?? null,
      daysUntilExpiry: r.daysUntilExpiry ?? null,
      customerName: r.customerName ?? null,
      manufacturerName: r.manufacturerName ?? null,
      renewalCount: r.renewalCount,
      ingredientCount: r.ingredientCount ?? null,
      serviceFee: r.serviceFee ?? null,
      submittedDate: r.submittedDate ?? null,
      createdAt: r.createdAt,
    }))
  )
}

async function seedProducts() {
  await db.delete(products)
  await db.insert(products).values(
    mockProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      nameInternal: p.nameInternal,
      thumbnailUrl: p.thumbnailUrl ?? null,
      customerName: p.customerName,
      brandName: p.brandName ?? null,
      category: p.category,
      sellingPrice: p.sellingPrice ?? null,
      totalCostPerUnit: p.totalCostPerUnit,
      marginPercent: p.marginPercent,
      fdaStatus: p.fdaStatus,
      status: p.status,
      packageSize: p.packageSize ?? null,
      containerType: p.containerType,
    }))
  )
}

async function seedDelivery() {
  await db.delete(deliveryOrders)
  const rows = mockDeliveryOrders.map((o) => ({
    id: o.id,
    deliveryNumber: o.deliveryNumber,
    jobOrderId: null,
    customerId: o.customerId ?? null,
    customerName: o.customerName,
    customerBrand: o.customerBrand ?? null,
    salesOrderRef: o.salesOrderRef ?? null,
    orderDate: o.orderDate,
    deliveryDate: o.deliveryDate ?? null,
    actualDeliveryDate: o.actualDeliveryDate ?? null,
    deliveryAddress: o.deliveryAddress ?? null,
    deliveryCity: o.deliveryCity ?? null,
    deliveryProvince: o.deliveryProvince ?? null,
    deliveryPostalCode: o.deliveryPostalCode ?? null,
    contactName: o.contactName ?? null,
    contactPhone: o.contactPhone ?? null,
    status: o.status,
    totalQuantity: o.totalQuantity ?? null,
    totalAmount: o.totalAmount ?? null,
    shippingMethod: o.shippingMethod ?? null,
    trackingNumber: o.trackingNumber ?? null,
    shippingCost: null,
    weightKg: o.weightKg ?? null,
    boxesCount: o.boxesCount ?? null,
    productSummary: o.productSummary ?? null,
    jobStatus: o.jobStatus ?? null,
    pickedBy: null,
    pickedAt: null,
    shippedBy: null,
    shippedAt: null,
    receiverName: null,
    podNotes: null,
    podSignedAt: null,
    notes: null,
    createdBy: "seed",
  }))
  await db.insert(deliveryOrders).values(rows)
}

async function seedFormulas() {
  await db.transaction(async (tx) => {
    // Replace all formula data on every seed. Stock cards come solely from the
    // imported Excel catalog now, so ingredient -> stock links are resolved by
    // linkFormulaIngredients() (name auto-match) rather than hardcoded ids.
    await tx.delete(jobOrders)
    await tx.delete(formulaIngredients)
    await tx.delete(formulas)

    await tx.insert(formulas).values(FORMULA_ROWS)
    await tx.insert(formulaIngredients).values(
      INGREDIENT_ROWS.map((r) => ({
        ...r,
        stockCardId: null, // resolved later via auto-match
        notes: r.notes ?? null,
      })),
    )
    await tx.insert(jobOrders).values(
      JOB_ORDER_ROWS.map((r) => ({
        id: r.id,
        jobNo: r.jobNo,
        formulaId: r.formulaId,
        formulaName: r.formulaName,
        formulaCode: r.formulaCode,
        customer: r.customer,
        batchSizeKg: r.batchSizeKg,
        plannedQty: r.plannedQty,
        unit: r.unit,
        status: r.status,
        priority: r.priority,
        plannedStart: r.plannedStart ?? null,
        plannedEnd: r.plannedEnd ?? null,
        actualStart: ("actualStart" in r ? r.actualStart as string : null) ?? null,
        actualEnd: ("actualEnd" in r ? r.actualEnd as string : null) ?? null,
        assignedTo: r.assignedTo ?? null,
        productionNotes: null,
        materials: [],
        batches: [],
        qcResults: [],
        costBreakdown: {},
      })),
    )
  })
}

// ------------------------------------------------------------
// Auto-match: link each formula ingredient to a stock card by name.
// Matches rawMaterialName against stock itemName / itemNameEn / tradeName /
// inciName using normalized exact -> contains scoring. Returns match stats.
// ------------------------------------------------------------
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\d+\s*:\s*\d+/g, " ")   // drop dilution ratios e.g. "2:100"
    .replace(/[^\p{L}\p{N}]+/gu, " ") // keep letters/numbers (incl. Thai) only
    .replace(/\s+/g, " ")
    .trim()
}

const STOPWORDS = new Set([
  "rm", "fg", "oh", "pk", "pa", "the", "of", "and", "premium", "normal",
  "v", "soap", "base", "color", "fragrance", "powder", "solvent", "oem", "brand",
])

function tokenize(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

async function linkFormulaIngredients() {
  const cards = await db
    .select({
      id: stockCards.id,
      itemName: stockCards.itemName,
      itemNameEn: stockCards.itemNameEn,
      tradeName: stockCards.tradeName,
      inciName: stockCards.inciName,
      itemType: stockCards.itemType,
    })
    .from(stockCards)

  // Ingredients are materials — restrict the candidate pool for precision.
  const candidates = cards
    .filter(
      (c) =>
        c.itemType === "raw_material" ||
        c.itemType === "packaging" ||
        c.itemType === "packaging_aux",
    )
    .map((c) => {
      const combined = [c.itemName, c.itemNameEn, c.tradeName, c.inciName]
        .filter(Boolean)
        .map((k) => normalize(String(k)))
        .join(" ")
      return { id: c.id, text: combined, tokens: new Set(tokenize(combined)) }
    })

  const ingredients = await db
    .select({ id: formulaIngredients.id, name: formulaIngredients.rawMaterialName })
    .from(formulaIngredients)

  let matched = 0
  const unmatched: string[] = []

  for (const ing of ingredients) {
    const rawName = ing.name ?? ""
    const targetNorm = normalize(rawName)
    const targetTokens = tokenize(rawName)
    if (!targetNorm) {
      unmatched.push(rawName)
      continue
    }

    let best: { id: string; score: number } | null = null
    for (const cand of candidates) {
      let score = 0
      // Strong signal: candidate text contains the whole normalized ingredient.
      if (targetNorm.length >= 3 && cand.text.includes(targetNorm)) score += 1000
      // Token coverage: fraction of ingredient tokens present in candidate.
      if (targetTokens.length) {
        const hits = targetTokens.filter((t) => cand.tokens.has(t)).length
        const coverage = hits / targetTokens.length
        score += coverage * 100
        // Bonus for absolute number of matching tokens (multi-word names).
        score += hits * 10
      }
      // Substring fallback for Thai compound words (e.g. "น้ำหอมกาแฟ" ⊃ "กาแฟ").
      // Only long tokens (>=4 chars) to avoid spurious short matches.
      if (score < 50) {
        for (const ct of cand.tokens) {
          if (ct.length >= 4 && targetNorm.includes(ct)) { score += 55; break }
        }
        if (score < 50) {
          for (const tt of targetTokens) {
            if (tt.length >= 4 && cand.text.includes(tt)) { score += 55; break }
          }
        }
      }
      if (score > (best?.score ?? 0)) best = { id: cand.id, score }
    }

    // Require a meaningful match: full-string contains, or >=50% token coverage.
    if (best && best.score >= 50) {
      await db
        .update(formulaIngredients)
        .set({ stockCardId: best.id })
        .where(eq(formulaIngredients.id, ing.id))
      matched++
    } else {
      unmatched.push(rawName)
    }
  }

  return { total: ingredients.length, matched, unmatched }
}

async function seedStockMovements() {
  // Upsert opening-balance movements from the current stock cards
  const cards = await db
    .select({ id: stockCards.id, itemCode: stockCards.itemCode, itemName: stockCards.itemName, balance: stockCards.balance, unitCost: stockCards.unitCost })
    .from(stockCards)

  const movementRows = cards
    .filter((c) => (c.balance ?? 0) > 0)
    .map((c, idx) => ({
      id: `seed-open-${String(idx + 1).padStart(5, "0")}`,
      referenceNumber: `OPEN-${String(idx + 1).padStart(4, "0")}`,
      movementType: "buy_in",
      stockCardId: c.id,
      itemCode: c.itemCode,
      itemName: c.itemName,
      quantity: c.balance ?? 0,
      unitCost: c.unitCost ?? 0,
      totalCost: (c.unitCost ?? 0) * (c.balance ?? 0),
      status: "approved",
      notes: "ยอดยกมา (นำเข้าจากไฟล์ StockCards)",
      createdBy: "seed",
    }))

  if (movementRows.length === 0) return 0

  // Delete old seed movements and re-insert
  await db.delete(stockMovements)
  for (let i = 0; i < movementRows.length; i += 100) {
    await db.insert(stockMovements).values(movementRows.slice(i, i + 100))
  }
  return movementRows.length
}
