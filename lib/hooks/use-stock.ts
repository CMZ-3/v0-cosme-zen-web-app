"use client"

import useSWR from "swr"
import type {
  StockCard,
  StockMovement,
  StockLot,
  StockReservation,
} from "@/lib/stock-types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

/**
 * Live stock cards from the database. Falls back gracefully: while loading or
 * on error the caller can substitute mock data so the UI never blanks out.
 */
export function useStockCards() {
  const { data, error, isLoading, mutate } = useSWR<{ cards: StockCard[] }>(
    "/api/stock/cards",
    fetcher,
  )
  return { cards: data?.cards ?? [], error, isLoading, mutate }
}

/** A single stock card with its related lots, movements and reservations. */
export function useStockCard(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{
    card: StockCard
    lots: StockLot[]
    movements: StockMovement[]
    reservations: StockReservation[]
  }>(id ? `/api/stock/cards/${id}` : null, fetcher)

  return {
    card: data?.card ?? null,
    lots: data?.lots ?? [],
    movements: data?.movements ?? [],
    reservations: data?.reservations ?? [],
    error,
    isLoading,
    mutate,
  }
}

/** Live stock movements ledger. */
export function useStockMovements() {
  const { data, error, isLoading, mutate } = useSWR<{ movements: StockMovement[] }>(
    "/api/stock/movements",
    fetcher,
  )
  return { movements: data?.movements ?? [], error, isLoading, mutate }
}

/** Live stock lots across all cards (for expiry / FEFO views). */
export function useStockLots() {
  const { data, error, isLoading, mutate } = useSWR<{ lots: StockLot[] }>(
    "/api/stock/lots",
    fetcher,
  )
  return { lots: data?.lots ?? [], error, isLoading, mutate }
}

/** Live stock reservations across all cards. */
export function useStockReservations() {
  const { data, error, isLoading, mutate } = useSWR<{ reservations: StockReservation[] }>(
    "/api/stock/reservations",
    fetcher,
  )
  return { reservations: data?.reservations ?? [], error, isLoading, mutate }
}
