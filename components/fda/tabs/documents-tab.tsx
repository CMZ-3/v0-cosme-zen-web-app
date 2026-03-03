"use client"

import { Upload, Download, Trash2, FileText, File, Image, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { FdaDocument, FdaDocumentType } from "@/lib/fda-types"

interface DocumentsTabProps {
  documents: FdaDocument[]
}

const DOC_TYPE_LABELS: Record<FdaDocumentType, { label: string; color: string }> = {
  msds: { label: "MSDS", color: "bg-red-100 text-red-700" },
  coa: { label: "COA", color: "bg-emerald-100 text-emerald-700" },
  specification: { label: "Spec", color: "bg-blue-100 text-blue-700" },
  test_report: { label: "Test Report", color: "bg-purple-100 text-purple-700" },
  label_artwork: { label: "Label", color: "bg-pink-100 text-pink-700" },
  formula_sheet: { label: "Formula", color: "bg-amber-100 text-amber-700" },
  factory_license: { label: "License", color: "bg-teal-100 text-teal-700" },
  certificate: { label: "Certificate", color: "bg-indigo-100 text-indigo-700" },
  other: { label: "Other", color: "bg-slate-100 text-slate-600" },
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return FileText
  if (["png", "jpg", "jpeg", "svg", "ai"].includes(ext ?? "")) return Image
  if (["xlsx", "xls", "csv"].includes(ext ?? "")) return FileSpreadsheet
  return File
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "--"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function FdaDocumentsTab({ documents }: DocumentsTabProps) {
  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{documents.length} Documents</p>
        <Button size="sm" className="h-7 text-xs gap-1">
          <Upload className="h-3 w-3" /> Upload
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-[10px] font-bold uppercase w-[100px]">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">File</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Title</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[80px]">Size</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[90px]">Date</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No documents uploaded
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const typeCfg = DOC_TYPE_LABELS[doc.documentType]
                const FileIcon = getFileIcon(doc.fileName)
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] font-semibold ${typeCfg.color}`}>
                        {typeCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{doc.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.title ?? "--"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Download">
                          <Download className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" aria-label="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
