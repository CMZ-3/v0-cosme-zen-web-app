"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import {
  ArrowLeft,
  PackageCheck,
  Pencil,
  Printer,
  Truck,
  Ban,
  CheckCircle,
  ClipboardList,
  Package,
  Undo2,
  Image,
  Clock,
  MapPin,
  Phone,
  User,
  FileText,
  Camera,
  Pen,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeliveryWorkflowStepper } from "@/components/delivery/delivery-workflow-stepper"
import { PickVerifyDialog } from "@/components/delivery/pick-verify-dialog"
import { deliveryStatusMap } from "@/lib/delivery-types"
import type { DeliveryStatus } from "@/lib/delivery-types"
import {
  mockDeliveryLines,
  mockDeliveryAuditLogs,
  mockDeliveryPod,
} from "@/lib/delivery-mock-data"
import type { DeliveryOrder } from "@/lib/delivery-types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Derive a deterministic gradient from a customer name for the avatar
function getAvatarColor(name: string): string {
  const palettes = [
    "from-blue-400 to-blue-600",
    "from-teal-400 to-teal-600",
    "from-violet-400 to-violet-600",
    "from-rose-400 to-rose-600",
    "from-amber-400 to-amber-600",
    "from-emerald-400 to-emerald-600",
    "from-indigo-400 to-indigo-600",
    "from-pink-400 to-pink-600",
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palettes[h % palettes.length]
}

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [verifyMode, setVerifyMode] = useState<"picking" | "shipping" | null>(null)

  const { data, isLoading, mutate } = useSWR<{ order: DeliveryOrder }>(
    `/api/delivery-orders/${id}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const order = data?.order ?? null

  const orderLines = useMemo(() => {
    const matched = mockDeliveryLines.filter((l) => l.deliveryOrderId === id)
    return matched.length > 0 ? matched : mockDeliveryLines
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading delivery order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">Delivery order not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/delivery")}>
            Back to list
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = deliveryStatusMap[order.status]
  const avatarColor = getAvatarColor(order.customerName)
  const initials = order.customerName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--"
    return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
  }

  // Status action buttons based on current status
  const renderStatusActions = () => {
    const s = order.status
    const actions: { label: string; icon: typeof Package; variant: "default" | "outline" | "destructive"; color?: string }[] = []

    if (s === "draft") {
      actions.push({ label: "Reserve", icon: Package, variant: "default", color: "bg-primary" })
      actions.push({ label: "Cancel", icon: Ban, variant: "destructive" })
    } else if (s === "reserved") {
      actions.push({ label: "Start Picking", icon: ClipboardList, variant: "default", color: "bg-primary" })
      actions.push({ label: "Release", icon: Undo2, variant: "outline" })
      actions.push({ label: "Cancel", icon: Ban, variant: "destructive" })
    } else if (s === "picking") {
      actions.push({ label: "Ship", icon: Truck, variant: "default", color: "bg-teal-500 hover:bg-teal-600" })
      actions.push({ label: "Cancel", icon: Ban, variant: "destructive" })
    } else if (s === "shipped") {
      actions.push({ label: "Confirm Delivered", icon: PackageCheck, variant: "default", color: "bg-emerald-500 hover:bg-emerald-600" })
    } else if (s === "delivered") {
      actions.push({ label: "Complete", icon: CheckCircle, variant: "default", color: "bg-emerald-500 hover:bg-emerald-600" })
    }

    if (actions.length === 0) return null

    return (
      <div className="flex items-center gap-2">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.variant}
            size="sm"
            className={cn("gap-1.5 rounded-[10px] text-[12px] font-semibold", a.variant === "default" && a.color && `${a.color} text-white`)}
            onClick={async () => {
              if (a.label === "Start Picking" && orderLines.length > 0) {
                setVerifyMode("picking")
              } else if (a.label === "Ship" && orderLines.length > 0) {
                setVerifyMode("shipping")
              } else {
                toast.success(`${a.label}: ${order.deliveryNumber}`)
                await mutate()
              }
            }}
          >
            <a.icon className="h-3.5 w-3.5" />
            {a.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto pb-12">
      {/* Header */}
      <div className="px-8 pt-5 pb-4 flex-shrink-0 border-b border-border bg-card">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
          <Link href="/delivery" className="hover:text-primary transition-colors font-medium">Delivery Orders</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">{order.deliveryNumber}</span>
        </nav>

        {/* Hero Section */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-4 mb-4">
          <div className={cn("flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br text-[18px] font-bold text-white", avatarColor)}>
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-extrabold text-foreground">{order.deliveryNumber}</h2>
              <span className={cn("inline-flex items-center gap-1.5 rounded-2xl px-3 py-1 text-[11px] font-semibold", statusInfo.bgColor, statusInfo.color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.dotColor)} />
                {statusInfo.labelTh}
              </span>
              {order.salesOrderRef && (
                <span className="text-[11px] font-semibold text-primary">{order.salesOrderRef}</span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {order.customerName} {order.customerBrand ? `(${order.customerBrand})` : ""} &middot; {order.productSummary}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-semibold gap-1">
                <Package className="h-3 w-3" />
                {order.totalQuantity?.toLocaleString()} pcs
              </Badge>
              <Badge variant="outline" className="text-[10px] font-semibold gap-1">
                <Truck className="h-3 w-3" />
                {order.shippingMethod || "N/A"}
              </Badge>
              {order.totalAmount && (
                <Badge variant="outline" className="text-[10px] font-semibold gap-1">
                  {"\u0e3f"}{order.totalAmount.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {renderStatusActions()}
            <div className="flex gap-2">
              {(order.status === "draft" || order.status === "reserved") && (
                <Button variant="outline" size="sm" className="gap-1 rounded-[10px] text-[11px]" onClick={() => toast.info(`Editing ${order.deliveryNumber}`)}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1 rounded-[10px] text-[11px]" onClick={() => window.open(`/delivery/${id}/print`, "_blank")}>
                <Printer className="h-3 w-3" /> Print DO
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Stepper */}
        <DeliveryWorkflowStepper
          currentStatus={order.status}
          timestamps={{
            draft: order.createdAt,
            reserved: order.reservedAt,
            picking: order.pickedAt,
            shipped: order.shippedAt,
            delivered: order.actualDeliveryDate,
            completed: order.completedAt,
          }}
        />
      </div>

      {/* Tabs */}
      <div className="flex-1 px-8 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="gap-1 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg text-[12px] font-semibold">Overview</TabsTrigger>
            <TabsTrigger value="lines" className="rounded-lg text-[12px] font-semibold">Lines ({mockDeliveryLines.length})</TabsTrigger>
            <TabsTrigger value="pod" className="rounded-lg text-[12px] font-semibold">POD ({mockDeliveryPod.length})</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg text-[12px] font-semibold">Audit ({mockDeliveryAuditLogs.length})</TabsTrigger>
            <TabsTrigger value="trace" className="rounded-lg text-[12px] font-semibold">Traceability</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Order Info */}
              <Card className="border-border rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <InfoField label="DO Number" value={order.deliveryNumber} />
                  <InfoField label="SO Reference" value={order.salesOrderRef} />
                  <InfoField label="Order Date" value={formatDate(order.orderDate)} />
                  <InfoField label="Delivery Date" value={formatDate(order.deliveryDate)} />
                  <InfoField label="Actual Delivery" value={formatDate(order.actualDeliveryDate)} />
                  <InfoField label="Status" value={statusInfo.label} />
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="border-border rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer & Delivery</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <InfoField label="Customer" value={order.customerName} icon={<User className="h-3 w-3" />} />
                  <InfoField label="Brand" value={order.customerBrand} />
                  <InfoField label="Contact" value={order.contactName} icon={<Phone className="h-3 w-3" />} />
                  <InfoField label="Phone" value={order.contactPhone} />
                  <div className="col-span-2">
                    <InfoField
                      label="Address"
                      value={[order.deliveryAddress, order.deliveryCity, order.deliveryProvince, order.deliveryPostalCode].filter(Boolean).join(", ") || "--"}
                      icon={<MapPin className="h-3 w-3" />}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping */}
              <Card className="border-border rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shipping & Logistics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <InfoField label="Method" value={order.shippingMethod} icon={<Truck className="h-3 w-3" />} />
                  <InfoField label="Tracking" value={order.trackingNumber} />
                  <InfoField label="Shipping Cost" value={order.shippingCost ? `\u0e3f${order.shippingCost.toLocaleString()}` : "--"} />
                  <InfoField label="Weight" value={order.weightKg ? `${order.weightKg} kg` : "--"} />
                  <InfoField label="Boxes" value={order.boxesCount?.toString()} />
                  <InfoField label="Receiver" value={order.receiverName} />
                </CardContent>
              </Card>

              {/* Finance */}
              <Card className="border-border rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] pb-2 border-b border-border">
                      <span className="text-muted-foreground">Total Quantity</span>
                      <span className="font-bold font-mono">{order.totalQuantity?.toLocaleString() || "--"} pcs</span>
                    </div>
                    <div className="flex justify-between text-[12px] pb-2 border-b border-border">
                      <span className="text-muted-foreground">Shipping Cost</span>
                      <span className="font-bold font-mono">{order.shippingCost ? `\u0e3f${order.shippingCost.toLocaleString()}` : "--"}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t-2 border-primary">
                      <span className="text-[13px] font-bold text-foreground">Total Amount</span>
                      <span className="text-[16px] font-extrabold font-mono text-primary">
                        {order.totalAmount ? `\u0e3f${order.totalAmount.toLocaleString()}` : "--"}
                      </span>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="mt-4 rounded-xl bg-secondary/50 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1">Notes</p>
                      <p className="text-[12px] text-foreground">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lines Tab */}
          <TabsContent value="lines" className="mt-4">
            <Card className="border-border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-[13px] font-bold">Delivery Lines</CardTitle>
                {(order.status === "draft") && (
                  <Button size="sm" variant="outline" className="gap-1 rounded-[10px] text-[11px]">
                    <Package className="h-3 w-3" /> Add Line
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="text-[9px] font-bold uppercase w-10">#</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase">Product Code</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase">Product Name</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase">Lot</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right">Qty</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right">Delivered</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase">Unit</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right">Unit Price</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right">Amount</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase text-right">Pack/CTN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDeliveryLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-[12px] font-mono font-bold text-muted-foreground">{line.lineNumber}</TableCell>
                        <TableCell className="text-[11px] font-mono font-semibold text-primary">{line.productCode}</TableCell>
                        <TableCell className="text-[12px] font-semibold">{line.productName}</TableCell>
                        <TableCell>
                          <span className="inline-block rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold">{line.lotNumber || "--"}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[12px] font-bold">{line.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-[12px] font-bold text-emerald-600">{line.deliveredQuantity?.toLocaleString() ?? "--"}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{line.unit || "pcs"}</TableCell>
                        <TableCell className="text-right font-mono text-[12px]">{line.unitPrice ? `\u0e3f${line.unitPrice}` : "--"}</TableCell>
                        <TableCell className="text-right font-mono text-[12px] font-bold">{line.amount ? `\u0e3f${line.amount.toLocaleString()}` : "--"}</TableCell>
                        <TableCell className="text-right text-[11px] text-muted-foreground">{line.packPerCarton ?? "--"}/{line.cartonCount ?? "--"}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-secondary/30 font-bold">
                      <TableCell colSpan={4} className="text-right text-[11px] font-bold uppercase">Total</TableCell>
                      <TableCell className="text-right font-mono text-[13px]">{mockDeliveryLines.reduce((s, l) => s + l.quantity, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-[13px] text-emerald-600">{mockDeliveryLines.reduce((s, l) => s + (l.deliveredQuantity || 0), 0).toLocaleString()}</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell className="text-right font-mono text-[13px] text-primary">{"\u0e3f"}{mockDeliveryLines.reduce((s, l) => s + (l.amount || 0), 0).toLocaleString()}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POD Tab */}
          <TabsContent value="pod" className="mt-4">
            <Card className="border-border rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-[13px] font-bold">Proof of Delivery</CardTitle>
                {order.status !== "completed" && order.status !== "cancelled" && (
                  <Button size="sm" variant="outline" className="gap-1 rounded-[10px] text-[11px]">
                    <Camera className="h-3 w-3" /> Upload POD
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {mockDeliveryPod.map((pod) => {
                    const typeIcon = pod.attachmentType === "photo" ? Image : pod.attachmentType === "signature" ? Pen : FileText
                    const TypeIcon = typeIcon
                    return (
                      <div key={pod.id} className="rounded-xl border border-border bg-secondary/30 p-4 text-center cursor-pointer transition-all hover:border-primary hover:-translate-y-0.5">
                        <TypeIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-[11px] font-semibold text-foreground truncate">{pod.fileName}</p>
                        <Badge variant="secondary" className="mt-1 text-[9px]">{pod.attachmentType}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {pod.fileSize ? `${(pod.fileSize / 1024).toFixed(0)} KB` : ""}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {new Date(pod.uploadedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {mockDeliveryPod.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm font-semibold text-muted-foreground">No proof of delivery attachments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="mt-4">
            <Card className="border-border rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-bold">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDeliveryAuditLogs.slice().reverse().map((log) => {
                    const actionColors: Record<string, string> = {
                      created: "bg-blue-500",
                      reserve: "bg-indigo-500",
                      start_picking: "bg-purple-500",
                      ship: "bg-teal-500",
                      deliver: "bg-emerald-500",
                      complete: "bg-emerald-600",
                      cancel: "bg-destructive",
                    }
                    return (
                      <div key={log.id} className="flex gap-3">
                        <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", actionColors[log.action] || "bg-muted-foreground")} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{log.action.replace("_", " ")}</span>
                            {log.oldStatus && log.newStatus && (
                              <span className="text-[11px] text-muted-foreground">
                                {log.oldStatus} &rarr; {log.newStatus}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{log.userName || "System"}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{new Date(log.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          {log.notes && <p className="mt-1 text-[11px] text-muted-foreground">{log.notes}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traceability Tab */}
          <TabsContent value="trace" className="mt-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20">
              <Package className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-bold text-foreground">Lot Traceability</p>
              <p className="text-[11px] text-muted-foreground">Full traceability chain from raw materials to delivery coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PickVerifyDialog
        open={verifyMode !== null}
        onOpenChange={(o) => !o && setVerifyMode(null)}
        lines={orderLines}
        mode={verifyMode ?? "picking"}
        onConfirm={() => {
          toast.success(
            verifyMode === "shipping"
              ? `Shipment verified & dispatched: ${order.deliveryNumber}`
              : `Picking verified: ${order.deliveryNumber}`,
          )
          setVerifyMode(null)
        }}
      />
    </div>
  )
}

// Helper component for info fields
function InfoField({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {value || "--"}
      </p>
    </div>
  )
}
