"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DeliveryOrder = {
  id: string
  deliveryNumber: string
  customerName: string
  status: string
  scheduledDate?: string | null
  totalQuantity?: number
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  reserved: "bg-blue-100 text-blue-700 border-blue-200",
  picking: "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
}

interface Props {
  orders: DeliveryOrder[]
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
const DOW_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

export function DeliveryCalendar({ orders }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Group orders by date string YYYY-MM-DD
  const byDate = useMemo(() => {
    const map: Record<string, DeliveryOrder[]> = {}
    for (const o of orders) {
      if (!o.scheduledDate) continue
      const d = o.scheduledDate.slice(0, 10)
      if (!map[d]) map[d] = []
      map[d].push(o)
    }
    return map
  }, [orders])

  // Selected day orders
  const selectedOrders = selected ? (byDate[selected] ?? []) : []

  const days = daysInMonth(year, month)
  const startDow = firstDayOfMonth(year, month)
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="px-8 pt-4 pb-8 flex gap-6">
      {/* Calendar Grid */}
      <div className="flex-1 rounded-2xl border border-border bg-card p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[15px] font-bold text-foreground">
            {MONTH_TH[month]} {year + 543}
          </span>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* DOW headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW_TH.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayOrders = byDate[dateStr] ?? []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = selected === dateStr
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(isSelected ? null : dateStr)}
                className={cn(
                  "relative rounded-xl p-1.5 text-left transition-colors min-h-[56px]",
                  isToday && "ring-2 ring-primary ring-offset-1",
                  isSelected ? "bg-primary/10" : "hover:bg-secondary",
                )}
              >
                <span className={cn(
                  "text-[11px] font-bold",
                  isToday ? "text-primary" : "text-foreground"
                )}>{day}</span>
                {dayOrders.length > 0 && (
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {dayOrders.slice(0, 2).map((o) => (
                      <div key={o.id} className={cn("rounded-md px-1 py-px text-[8px] font-bold border truncate", STATUS_COLORS[o.status] || "bg-secondary text-foreground border-border")}>
                        {o.deliveryNumber}
                      </div>
                    ))}
                    {dayOrders.length > 2 && (
                      <div className="text-[8px] text-muted-foreground px-1">+{dayOrders.length - 2} อื่นๆ</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="w-[280px] flex-shrink-0">
        <div className="rounded-2xl border border-border bg-card p-4 sticky top-4">
          {selected ? (
            <>
              <div className="text-[13px] font-bold text-foreground mb-3">
                {new Date(selected + "T00:00:00").toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              {selectedOrders.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">ไม่มีการจัดส่งวันนี้</p>
              ) : (
                <div className="space-y-2">
                  {selectedOrders.map((o) => (
                    <div key={o.id} className="rounded-xl border border-border p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-primary">{o.deliveryNumber}</span>
                        <Badge variant="outline" className={cn("text-[9px] font-bold", STATUS_COLORS[o.status])}>
                          {o.status}
                        </Badge>
                      </div>
                      <div className="text-[12px] font-semibold text-foreground">{o.customerName}</div>
                      {o.totalQuantity && (
                        <div className="text-[10px] text-muted-foreground">{o.totalQuantity.toLocaleString()} pcs</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[12px] text-muted-foreground">คลิกวันที่เพื่อดูรายการจัดส่ง</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
