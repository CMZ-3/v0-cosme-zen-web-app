"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { StockSimulationState } from "./stock-simulation-store"
import {
  createInitialState,
  FORMULAS,
  generateDocNo,
  calcRequired,
  getPiecesFromBatch,
  getStockItem,
  getPendingPOQty,
  getEstDate,
  nowTimestamp,
} from "./stock-simulation-store"
import type {
  SimulationBatch,
  PurchaseOrder,
  ReceiveRecord,
  MovementLogEntry,
  SavedReservation,
  JobReservation,
} from "./stock-types"

interface StockSimContextValue {
  state: StockSimulationState
  resetAll: () => void
  // Simulator
  addToMemory: (formulaId: string, batchSize: number, manualPieces?: number) => void
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

export function StockSimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StockSimulationState>(createInitialState)

  const resetAll = useCallback(() => {
    setState(createInitialState())
  }, [])

  const addToMemory = useCallback((formulaId: string, batchSize: number, manualPieces?: number) => {
    setState((prev) => {
      const f = FORMULAS[formulaId]
      if (!f || batchSize <= 0) return prev
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
      return { ...prev, memoryBank: [...prev.memoryBank, batch] }
    })
  }, [])

  const removeFromMemory = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      memoryBank: prev.memoryBank.filter((m) => m.id !== id),
    }))
  }, [])

  const clearMemory = useCallback(() => {
    setState((prev) => ({ ...prev, memoryBank: [] }))
  }, [])

  const confirmSplitReservation = useCallback((prefix: string) => {
    setState((prev) => {
      const newState = { ...prev }
      const counters = { ...prev.docCounters }
      const ssiNo = generateDocNo(counters, "SSI")
      const newReservations: SavedReservation[] = []
      const newMovements: MovementLogEntry[] = []
      const newStock = prev.stock.map((s) => ({ ...s }))

      prev.memoryBank.forEach((sim) => {
        const sreNo = generateDocNo(counters, "SRE")
        const name = prefix ? `${prefix} -- ${sim.formulaName}` : sim.formulaName

        newReservations.push({
          id: sreNo,
          ssiRef: ssiNo,
          name,
          formulaName: sim.formulaName,
          date: new Date().toLocaleTimeString(),
          batchData: sim,
          status: "DRAFT",
          linkedJo: null,
        })

        sim.requirements.forEach((req) => {
          const si = newStock.find((s) => s.id === req.id)
          if (si) si.reserved += req.qty
        })

        newMovements.push({
          ts: nowTimestamp(),
          item: sim.formulaName,
          type: "RESERVE",
          qty: 0,
          ref: `${ssiNo} -> ${sreNo}`,
          note: `Reserved ${sim.batchSize}kg batch`,
        })
      })

      return {
        ...newState,
        stock: newStock,
        docCounters: counters,
        memoryBank: [],
        savedReservations: [...newReservations, ...prev.savedReservations],
        movementLog: [...newMovements, ...prev.movementLog],
      }
    })
  }, [])

  const linkReservation = useCallback((resId: string, jobNo: string) => {
    setState((prev) => {
      const newReservations = prev.savedReservations.map((r) =>
        r.id === resId ? { ...r, status: "LINKED" as const, linkedJo: jobNo } : r
      )
      const res = prev.savedReservations.find((r) => r.id === resId)
      if (!res) return prev

      const newJobReservations: JobReservation[] = [...prev.jobReservations]
      res.batchData.requirements.forEach((req) => {
        const si = getStockItem(prev.stock, req.id)
        const available = si ? si.balance : 0
        newJobReservations.push({
          jobNo,
          itemCode: req.id,
          itemName: si?.name || req.id,
          qtyNeeded: req.qty,
          qtyAllocated: Math.min(req.qty, available),
          status: available >= req.qty ? "READY" : "WAITING",
        })
      })

      const newMovements: MovementLogEntry[] = [
        {
          ts: nowTimestamp(),
          item: res.formulaName,
          type: "RESERVE",
          qty: 0,
          ref: jobNo,
          note: `Linked ${resId} -> ${jobNo}`,
        },
        ...prev.movementLog,
      ]

      return {
        ...prev,
        savedReservations: newReservations,
        jobReservations: newJobReservations,
        movementLog: newMovements,
      }
    })
  }, [])

  const confirmPartialReceive = useCallback((poIdx: number, quantities: number[]) => {
    setState((prev) => {
      const newPOs = prev.purchaseOrders.map((po) => ({
        ...po,
        items: po.items.map((it) => ({ ...it })),
      }))
      const po = newPOs[poIdx]
      if (!po || po.status === "RECEIVED") return prev

      let anyReceived = false
      const filledJobs: string[] = []
      const receivedItems: ReceiveRecord["items"] = []
      let totalExcess = 0
      const newStock = prev.stock.map((s) => ({ ...s }))
      const newJobRes = prev.jobReservations.map((j) => ({ ...j }))
      const counters = { ...prev.docCounters }

      po.items.forEach((poItem, idx) => {
        const receiveQty = Math.max(0, quantities[idx] || 0)
        if (receiveQty <= 0) return

        anyReceived = true
        const remaining = poItem.qty - (poItem.receivedQty || 0)
        const excessQty = Math.max(0, receiveQty - remaining)
        totalExcess += excessQty

        poItem.receivedQty = (poItem.receivedQty || 0) + receiveQty
        receivedItems.push({
          itemId: poItem.itemId,
          name: poItem.name,
          qty: receiveQty,
          excessQty,
        })

        const si = newStock.find((s) => s.id === poItem.itemId)
        if (si) {
          si.balance += receiveQty
          si.incoming = Math.max(0, si.incoming - Math.min(receiveQty, remaining))
        }

        // FIFO Auto-Allocation
        const waiting = newJobRes
          .filter((j) => j.itemCode === poItem.itemId && j.status === "WAITING")
          .sort((a, b) => a.jobNo.localeCompare(b.jobNo))
        let remainingBalance = si ? si.balance : 0

        waiting.forEach((j) => {
          const stillNeeded = j.qtyNeeded - j.qtyAllocated
          if (remainingBalance >= stillNeeded) {
            j.qtyAllocated += stillNeeded
            j.status = "READY"
            remainingBalance -= stillNeeded
            if (!filledJobs.includes(j.jobNo)) filledJobs.push(j.jobNo)
          } else if (remainingBalance > 0) {
            j.qtyAllocated += remainingBalance
            remainingBalance = 0
          }
        })
      })

      if (!anyReceived) return prev

      const allDone = po.items.every((it) => (it.receivedQty || 0) >= it.qty)
      po.status = allDone ? "RECEIVED" : "PARTIAL"

      const srrNo = generateDocNo(counters, "SRR")
      const hasExcess = totalExcess > 0
      const newReceiveRecords: ReceiveRecord[] = [
        {
          srrNo,
          sinRef: po.poNo,
          supplier: po.supplier,
          items: receivedItems,
          receivedAt: nowTimestamp(),
          isPartial: !allDone,
          hasExcess,
          totalExcess,
          note: hasExcess ? `Received with excess (+${totalExcess})` : allDone ? "Full receive" : "Partial receive",
        },
        ...prev.receiveRecords,
      ]

      const newMovements: MovementLogEntry[] = receivedItems.map((ri) => ({
        ts: nowTimestamp(),
        item: ri.name,
        type: "IN" as const,
        qty: ri.qty,
        ref: srrNo,
        note: `${allDone ? "Full" : "Partial"} Receive from ${po.poNo}${ri.excessQty > 0 ? ` (excess +${ri.excessQty})` : ""}`,
      }))

      return {
        ...prev,
        stock: newStock,
        purchaseOrders: newPOs,
        jobReservations: newJobRes,
        receiveRecords: newReceiveRecords,
        movementLog: [...newMovements, ...prev.movementLog],
        docCounters: counters,
      }
    })
  }, [])

  const generatePOForItem = useCallback((itemId: string, shortageQty: number, orderQty: number) => {
    setState((prev) => {
      const si = getStockItem(prev.stock, itemId)
      if (!si) return prev

      const counters = { ...prev.docCounters }
      const poNo = generateDocNo(counters, "SIN")
      const extraQty = Math.max(0, orderQty - shortageQty)
      const newStock = prev.stock.map((s) => (s.id === itemId ? { ...s, incoming: s.incoming + orderQty } : s))

      const newPO: PurchaseOrder = {
        poNo,
        supplier: si.supplier,
        items: [{ itemId: si.id, name: si.name, qty: orderQty, receivedQty: 0, shortageQty: Math.min(shortageQty, orderQty), extraQty }],
        status: "PENDING",
        eta: getEstDate(7),
        autoGenerated: true,
        reason: "shortage",
        extraNote: extraQty > 0 ? `Extra +${extraQty}` : null,
      }

      const newMovement: MovementLogEntry = {
        ts: nowTimestamp(),
        item: si.name,
        type: "RESERVE",
        qty: 0,
        ref: poNo,
        note: `Ordered ${orderQty} ${si.unit}${extraQty > 0 ? ` (shortage ${Math.min(shortageQty, orderQty)} + extra ${extraQty})` : " (shortage)"}`,
      }

      return {
        ...prev,
        stock: newStock,
        purchaseOrders: [...prev.purchaseOrders, newPO],
        movementLog: [newMovement, ...prev.movementLog],
        docCounters: counters,
      }
    })
  }, [])

  return (
    <StockSimContext.Provider
      value={{
        state,
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
