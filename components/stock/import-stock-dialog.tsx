"use client"

import { useRef, useState } from "react"
import { FileSpreadsheet, Upload, Loader2, Download, CheckCircle2, AlertTriangle, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { parseStockWorkbook, downloadImportTemplate, type ParseResult } from "@/lib/stock-export"
import type { ImportResult } from "@/lib/db/stock-mutations"
import { itemTypeLabels } from "@/lib/stock-types"
import type { ItemType } from "@/lib/stock-types"
import { toast } from "sonner"

interface ImportStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}

export function ImportStockDialog({ open, onOpenChange, onImported }: ImportStockDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragging, setDragging] = useState(false)

  function resetAll() {
    setFileName("")
    setParsed(null)
    setResult(null)
    setParsing(false)
    setImporting(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleFile(file: File) {
    setResult(null)
    setParsed(null)
    setFileName(file.name)
    setParsing(true)
    try {
      const res = await parseStockWorkbook(file)
      if (res.rows.length === 0) {
        toast.error("No valid rows found", { description: "Check that the sheet has item_code and item_name columns." })
      }
      setParsed(res)
    } catch (err) {
      toast.error("Could not read file", { description: err instanceof Error ? err.message : "Invalid spreadsheet" })
      setFileName("")
    } finally {
      setParsing(false)
    }
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return
    setImporting(true)
    try {
      const res = await fetch("/api/stock/cards/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Import failed")
      const r: ImportResult = { created: data.created, updated: data.updated, skipped: data.skipped, errors: data.errors ?? [] }
      setResult(r)
      toast.success("Import complete", {
        description: `${r.created} created · ${r.updated} updated · ${r.skipped} skipped`,
      })
      onImported?.()
    } catch (err) {
      toast.error("Import failed", { description: err instanceof Error ? err.message : "Unknown error" })
    } finally {
      setImporting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetAll()
    onOpenChange(next)
  }

  const preview = parsed?.rows.slice(0, 8) ?? []

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden rounded-2xl p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            Import Stock from Excel
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an .xlsx / .csv file. Existing items (matched by item code) are updated;
            new codes are created. Column headers are matched automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Result state */}
          {result ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div>
                  <div className="text-sm font-bold text-emerald-800">Import finished</div>
                  <div className="text-xs text-emerald-700">
                    {result.created} created · {result.updated} updated · {result.skipped} skipped
                  </div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5" /> {result.errors.length} row issue(s)
                  </div>
                  <ul className="max-h-40 overflow-y-auto text-[11px] text-amber-700 flex flex-col gap-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="font-mono">{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) handleFile(f)
                }}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                  {parsing ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {fileName || "Drop your spreadsheet here or click to browse"}
                </div>
                <div className="text-[11px] text-muted-foreground">.xlsx, .xls or .csv — up to 5000 rows</div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </div>

              <button
                onClick={downloadImportTemplate}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
              >
                <Download className="h-3 w-3" /> Download import template
              </button>

              {/* Unmapped header warning */}
              {parsed && parsed.unmappedHeaders.length > 0 && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Ignored unrecognized column(s): <strong>{parsed.unmappedHeaders.join(", ")}</strong>
                  </span>
                </div>
              )}

              {/* Preview */}
              {parsed && parsed.rows.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Preview — {parsed.totalRows} row(s) ready
                    </span>
                    <button onClick={resetAll} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" /> Clear
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-[11px]">
                      <thead className="bg-secondary text-muted-foreground">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-semibold">Code</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Name</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Type</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Category</th>
                          <th className="px-2 py-1.5 text-right font-semibold">Balance</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-2 py-1.5 font-mono">{r.itemCode || "—"}</td>
                            <td className="px-2 py-1.5 max-w-[180px] truncate">{r.itemName || "—"}</td>
                            <td className="px-2 py-1.5">{r.itemType ? (itemTypeLabels[r.itemType as ItemType] ?? r.itemType) : "—"}</td>
                            <td className="px-2 py-1.5">{r.category || "—"}</td>
                            <td className="px-2 py-1.5 text-right font-mono">{r.balance ?? 0}</td>
                            <td className="px-2 py-1.5">{r.unit || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsed.totalRows > preview.length && (
                    <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                      + {parsed.totalRows - preview.length} more row(s)
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-2">
          <div className="flex-1" />
          {result ? (
            <Button size="sm" className="rounded-xl" onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleOpenChange(false)} disabled={importing}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                disabled={!parsed || parsed.rows.length === 0 || importing}
                onClick={handleImport}
              >
                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {importing ? "Importing..." : `Import ${parsed?.rows.length ?? 0} item(s)`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
