"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AvailabilityBarProps {
  balance: number
  reserved: number
  incoming: number
}

export function AvailabilityBar({ balance, reserved, incoming }: AvailabilityBarProps) {
  const total = balance + incoming
  if (total <= 0) return <div className="h-2 w-full rounded-full bg-red-200" />

  const availableW = Math.max(((balance - reserved) / total) * 100, 0)
  const reservedW = Math.max((reserved / total) * 100, 0)
  const incomingW = Math.max((incoming / total) * 100, 0)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
          {availableW > 0 && (
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${availableW}%` }} />
          )}
          {reservedW > 0 && (
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${reservedW}%` }} />
          )}
          {incomingW > 0 && (
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${incomingW}%` }} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Available: {(balance - reserved).toLocaleString()}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" /> Reserved: {reserved.toLocaleString()}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" /> Incoming: {incoming.toLocaleString()}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
