"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  type ReactNode,
} from "react"
import useSWR, { mutate as globalMutate } from "swr"
import type { StockSimulationState } from "./stock-simulation-store"
import {
  FORMULAS,
  INIT_STOCK,
  INIT_POS,
  INIT_JOBS,
  calcRequired,
  getPiecesFromBatch,
} from "./stock-simulation-store"
import type {
  SimulationBatch,
  MovementLogEntry,
  SavedReservation,
} from "./stock-types"

// ---------------------------------------------------------------------------
// The context API surface is intentionally unchanged so all 4 tabs continue to
// work without modification. Only the data source moves from in-memory →
// Neon PostgreSQL via /api/stock/workflow and /api/stock/movements.
// ---------------------------------------------------------------------------

interface StockSimContextValue {
  state: StockSimulationState
  isLoading: boolean
  resetAll: () => void
  // Simulator (client-side scratchpad – memoryBank never needs to persist)
  addToMemory: (formulaId: string, batchSize: number, manualPieces?: number, formulaOverride?: import("./stock-types").Formula & { name: string }) => void
  removeFromMemory: (id: number) => void
  clearMemory: () => void
  confirmSplitReservation: (prefix: string) => void
  // Reservation linking
  linkReservation: (resId: string, jobNo: string) => void
  // Incoming
  confirmPartialReceive: (poIdx: number, quantities: number[]) => void
  generatePOForItem: (itemId: string, qty: number, orderQty: number) => void
}

const StockSimContext = createContext<StockSimContextValue | null>(null)

// ---------------------------------------------------------------------------
// SWR fetcher
// ---------------------------------------------------------------------------

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/** Revalidate all workflow + movements + stock card caches. */
function revalidateAll() {
  globalMutate("/api/stock/workflow")
  globalMutate("/api/stock/movements")
  globalMutate("/api/stock/cards")
}

// ---------------------------------------------------------------------------
// Fallback state (used while initial fetch is in-flight)
// ---------------------------------------------------------------------------

function buildFallbackState(): StockSimulationState {
  return {
    stock: INIT_STOCK(),
    purchaseOrders: INIT_POS(),
    jobReservations: INIT_JOBS(),
    savedReservations: [],
    receiveRecords: [],
    movementLog: [],
    memoryBank: [],
    docCounters: { SSI: 0, SRE: 0, SIN: 5, SRR: 0 },
  }
}

// ---------------------------------------------------------------------------
// Derive SimulationState from the workflow snapshot
// ---------------------------------------------------------------------------

function snapshotToState(snap: Record<string, unknown>, movementsData?: Record<string, unknown>): StockSimulationState {
  const movements: MovementLogEntry[] =
    ((movementsData?.movements as Array<{
      movementType: string
      itemName: string
      quantity: number
      referenceNumber: string
      notes?: string
      createdAt: string
    }>) ?? []).map((m) => {
      const t = m.movementType
      let type: MovementLogEntry["type"] = "ADJUST"
      if (["buy_in", "adjust_in", "return", "found"].includes(t)) type = "IN"
      else if (["use_out", "adjust_out", "damage", "loss", "production"].includes(t)) type = "OUT"
      else if (t === "reserve" || t === "release") type = "RESERVE"
      const ts = new Date(m.createdAt)
        .toLocaleString("sv-SE")
        .replace("T", " ")
        .slice(0, 16)
      return { ts, item: m.itemName, type, qty: m.quantity, ref: m.referenceNumber, note: m.notes ?? "" }
    })

  return {
    stock: (snap.stock as StockSimulationState["stock"]) ?? INIT_STOCK(),
    purchaseOrders: (snap.purchaseOrders as StockSimulationState["purchaseOrders"]) ?? INIT_POS(),
    jobReservations: (snap.jobReservations as StockSimulationState["jobReservations"]) ?? INIT_JOBS(),
    savedReservations: (snap.savedReservations as SavedReservation[]) ?? [],
    receiveRecords: (snap.receiveRecords as StockSimulationState["receiveRecords"]) ?? [],
    movementLog: movements,
    memoryBank: [], // always client-only
    docCounters: (snap.docCounters as StockSimulationState["docCounters"]) ?? { SSI: 0, SRE: 0, SIN: 5, SRR: 0 },
  }
}

// ---------------------------------------------------------------------------
// POST helper
// ---------------------------------------------------------------------------

async function postWorkflow(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch("/api/stock/workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Workflow action failed")
  return data
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StockSimulationProvider({ children }: { children: ReactNode }) {
  // Client-only scratchpad
  const [memoryBank, setMemoryBank] = useState<SimulationBatch[]>([])
  const [, startTransition] = useTransition()

  // Live data from DB
  const { data: snapData, isLoading: snapLoading } = useSWR("/api/stock/workflow", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const { data: movementsData, isLoading: movLoading } = useSWR("/api/stock/movements", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const isLoading = snapLoading || movLoading
  const baseState = snapData ? snapshotToState(snapData, movementsData) : buildFallbackState()
  const state: StockSimulationState = { ...baseState, memoryBank }

  // -------------------------------------------------------------------------
  // Memory bank (client-side scratchpad)
  // -------------------------------------------------------------------------

  const addToMemory = useCallback((
    formulaId: string,
    batchSize: number,
    manualPieces?: number,
    formulaOverride?: import("./stock-types").Formula & { name: string },
  ) => {
    const f = formulaOverride ?? FORMULAS[formulaId]
    if (!f || batchSize <= 0) return
    const derivedPieces = getPiecesFromBatch(formulaId, batchSize)
    const pieces = manualPieces && manualPieces > 0 ? manualPieces : derivedPieces
    const batch: SimulationBatch = {
      id: Date.now() + Math.random(),
      formulaId,
      formulaName: f.name,
      batchSize,
      pieces,
      requirements: f.ingredients.map((ing) => ({
        id: ing.id,
        qty: calcRequired(ing, batchSize, pieces),
        isPkg: !!ing.perUnit,
      })),
    }
    setMemoryBank((prev) => [...prev, batch])
  }, [])

  const removeFromMemory = useCallback((id: number) => {
    setMemoryBank((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const clearMemory = useCallback(() => setMemoryBank([]), [])

  // -------------------------------------------------------------------------
  // Split & Reserve → server
  // -------------------------------------------------------------------------

  const confirmSplitReservation = useCallback((prefix: string) => {
    if (!memoryBank.length) return
    const snapshot = [...memoryBank]
    startTransition(async () => {
      try {
        await postWorkflow({ action: "splitReserve", prefix, memoryBank: snapshot })
        setMemoryBank([])
        revalidateAll()
      } catch (e) {
        console.error("[v0] splitReserve failed:", e)
      }
    })
  }, [memoryBank])

  // -------------------------------------------------------------------------
  // Link reservation → server
  // -------------------------------------------------------------------------

  const linkReservation = useCallback((resId: string, jobNo: string) => {
    startTransition(async () => {
      try {
        await postWorkflow({ action: "linkReservation", resId, jobNo })
        revalidateAll()
      } catch (e) {
        console.error("[v0] linkReservation failed:", e)
      }
    })
  }, [])

  // -------------------------------------------------------------------------
  // Partial receive → server (by poNo, not index)
  // -------------------------------------------------------------------------

  const confirmPartialReceive = useCallback((poIdx: number, quantities: number[]) => {
    const po = state.purchaseOrders[poIdx]
    if (!po) return
    startTransition(async () => {
      try {
        await postWorkflow({ action: "partialReceive", poNo: po.poNo, quantities })
        revalidateAll()
      } catch (e) {
        console.error("[v0] partialReceive failed:", e)
      }
    })
  }, [state.purchaseOrders])

  // -------------------------------------------------------------------------
  // Generate PO → server
  // -------------------------------------------------------------------------

  const generatePOForItem = useCallback((itemId: string, shortageQty: number, orderQty: number) => {
    startTransition(async () => {
      try {
        await postWorkflow({ action: "generatePO", itemId, shortageQty, orderQty })
        revalidateAll()
      } catch (e) {
        console.error("[v0] generatePO failed:", e)
      }
    })
  }, [])

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  const resetAll = useCallback(() => {
    setMemoryBank([])
    fetch("/api/seed?reset=1", { method: "POST" }).then(() => revalidateAll())
  }, [])

  return (
    <StockSimContext.Provider
      value={{
        state,
        isLoading,
        resetAll,
        addToMemory,
        removeFromMemory,
        clearMemory,
        confirmSplitReservation,
        linkReservation,
        confirmPartialReceive,
        generatePOForItem,
      }}
    >
      {children}
    </StockSimContext.Provider>
  )
}

export function useStockSimulation() {
  const ctx = useContext(StockSimContext)
  if (!ctx) throw new Error("useStockSimulation must be used within StockSimulationProvider")
  return ctx
}
