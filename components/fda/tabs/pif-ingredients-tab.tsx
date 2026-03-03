"use client"

import { AlertTriangle, FlaskConical, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { FdaIngredient } from "@/lib/fda-types"

interface IngredientsTabProps {
  ingredients: FdaIngredient[]
  isDraft: boolean
}

function formatPct(ing: FdaIngredient): string {
  if (ing.percentage != null) return `${ing.percentage}%`
  if (ing.percentageMin != null && ing.percentageMax != null)
    return `${ing.percentageMin}-${ing.percentageMax}%`
  return "--"
}

export function FdaPifIngredientsTab({ ingredients, isDraft }: IngredientsTabProps) {
  const totalPct = ingredients.reduce((sum, ing) => {
    if (ing.percentage != null) return sum + Number(ing.percentage)
    if (ing.percentageMin != null && ing.percentageMax != null)
      return sum + (Number(ing.percentageMin) + Number(ing.percentageMax)) / 2
    return sum
  }, 0)

  return (
    <div className="flex flex-col gap-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-foreground">{ingredients.length} Ingredients</p>
          <span className={`text-xs font-mono font-semibold ${Math.abs(totalPct - 100) < 0.1 ? "text-emerald-600" : "text-amber-600"}`}>
            Total: {totalPct.toFixed(2)}%
          </span>
        </div>
        {isDraft && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <FlaskConical className="h-3 w-3" />
              Populate from Formula
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-10 text-[10px] font-bold uppercase">#</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Ingredient</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">INCI Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[80px]">CAS</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[70px] text-right">%</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Function</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[90px]">Supplier</TableHead>
              {isDraft && <TableHead className="w-[70px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDraft ? 8 : 7} className="py-8 text-center text-sm text-muted-foreground">
                  No ingredients yet
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ing, i) => (
                <TableRow key={ing.id}>
                  <TableCell className="text-xs text-muted-foreground">{ing.sortOrder ?? i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{ing.ingredientName}</span>
                      {ing.isRestricted && (
                        <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[9px] border-amber-300 text-amber-600">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Restricted
                        </Badge>
                      )}
                    </div>
                    {ing.thaiName && <p className="text-[10px] text-muted-foreground">{ing.thaiName}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ing.inciName ?? "--"}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{ing.casNumber ?? "--"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-foreground">{formatPct(ing)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ing.function ?? "--"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[80px]">{ing.supplier ?? "--"}</TableCell>
                  {isDraft && (
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Edit ingredient">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" aria-label="Delete ingredient">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
