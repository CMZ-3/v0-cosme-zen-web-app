"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PackageCheck, Truck, MapPin, User, FileText } from "lucide-react"

const mockCustomers = [
  { id: "cust-1", name: "Glow Lab Co., Ltd." },
  { id: "cust-2", name: "SkinSoft Co., Ltd." },
  { id: "cust-3", name: "NatuBeauty" },
  { id: "cust-4", name: "BeautyKing Trading" },
  { id: "cust-5", name: "PureMind Co., Ltd." },
  { id: "cust-6", name: "LuxeSkin Intl." },
]

const shippingMethods = ["Kerry Express", "Flash Express", "J&T Express", "Grab Express", "Lalamove"]

interface CreateDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDeliveryDialog({ open, onOpenChange }: CreateDeliveryDialogProps) {
  const [customerId, setCustomerId] = useState("")
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [deliveryDate, setDeliveryDate] = useState("")
  const [salesOrderRef, setSalesOrderRef] = useState("")
  const [shippingMethod, setShippingMethod] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [deliveryProvince, setDeliveryProvince] = useState("")
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [boxesCount, setBoxesCount] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    // In production: call deliveryApi.create(...)
    onOpenChange(false)
  }

  const resetForm = () => {
    setCustomerId("")
    setOrderDate(new Date().toISOString().split("T")[0])
    setDeliveryDate("")
    setSalesOrderRef("")
    setShippingMethod("")
    setTrackingNumber("")
    setContactName("")
    setContactPhone("")
    setDeliveryAddress("")
    setDeliveryCity("")
    setDeliveryProvince("")
    setDeliveryPostalCode("")
    setWeightKg("")
    setBoxesCount("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent className="max-w-[600px] rounded-[20px] p-0 gap-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-7 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600">
              <PackageCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[18px] font-extrabold">Create Delivery Order</DialogTitle>
              <DialogDescription className="text-[12px]">Fill in the details to create a new delivery order</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-7 py-5 max-h-[60vh] space-y-5">
          {/* Customer & Reference */}
          <section>
            <SectionTitle icon={User} label="Customer & Reference" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Customer <span className="text-destructive">*</span></Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="mt-1 rounded-[10px] text-[13px]">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">SO Reference</Label>
                <Input
                  value={salesOrderRef}
                  onChange={(e) => setSalesOrderRef(e.target.value)}
                  placeholder="#CZ-XXXX"
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Order Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Delivery Date</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <SectionTitle icon={Truck} label="Shipping" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Shipping Method</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger className="mt-1 rounded-[10px] text-[13px]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory">Factory Truck</SelectItem>
                    {shippingMethods.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="TH..."
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Weight (kg)</Label>
                <Input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="0"
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Boxes</Label>
                <Input
                  type="number"
                  value={boxesCount}
                  onChange={(e) => setBoxesCount(e.target.value)}
                  placeholder="0"
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
          </section>

          {/* Address & Contact */}
          <section>
            <SectionTitle icon={MapPin} label="Delivery Address & Contact" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Contact Name</Label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Contact Phone</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-[11px] font-semibold text-muted-foreground">Address</Label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-1 rounded-[10px] text-[13px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">City</Label>
                <Input
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Province</Label>
                <Input
                  value={deliveryProvince}
                  onChange={(e) => setDeliveryProvince(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold text-muted-foreground">Postal Code</Label>
                <Input
                  value={deliveryPostalCode}
                  onChange={(e) => setDeliveryPostalCode(e.target.value)}
                  className="mt-1 rounded-[10px] text-[13px]"
                />
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <SectionTitle icon={FileText} label="Notes" />
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="mt-3 rounded-[10px] text-[13px] min-h-[70px]"
            />
          </section>
        </div>

        <DialogFooter className="px-7 py-4 border-t border-border bg-secondary/30">
          <Button variant="outline" className="rounded-[10px] text-[12px] font-semibold" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-[10px] bg-teal-500 hover:bg-teal-600 text-white text-[12px] font-bold shadow-[0_2px_8px_rgba(20,184,166,0.25)]"
            onClick={handleSubmit}
            disabled={!customerId || !orderDate}
          >
            Create Delivery Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: typeof User; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
