"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  FlaskConical, Beaker, Settings2, FileText, DollarSign, ClipboardCheck, 
  Layers, TestTube, Package, Shield, ChevronRight, ChevronLeft, Check,
  Plus, Trash2, GripVertical
} from "lucide-react"
import { toast } from "sonner"

interface CreateFormulaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Tabs matching FormulaFormPage structure
const TABS = [
  { id: "info", label: "Basic Info", icon: FlaskConical },
  { id: "batch", label: "Batch & QC", icon: Beaker },
  { id: "ingredients", label: "Ingredients", icon: TestTube },
  { id: "phases", label: "Phases", icon: Layers },
  { id: "cost", label: "Cost", icon: DollarSign },
  { id: "stability", label: "Stability", icon: Shield },
  { id: "packaging", label: "Packaging", icon: Package },
  { id: "notes", label: "Notes", icon: FileText },
] as const

type TabId = typeof TABS[number]["id"]

// Simple ingredient row for the form
interface IngredientRow {
  id: string
  name: string
  inci: string
  percentage: string
  phase: string
  function: string
}

// Simple phase row
interface PhaseRow {
  id: string
  name: string
  description: string
  temperature: string
}

export function CreateFormulaDialog({ open, onOpenChange }: CreateFormulaDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info")
  
  // Form state - Basic Info
  const [formulaNameTh, setFormulaNameTh] = useState("")
  const [formulaNameEn, setFormulaNameEn] = useState("")
  const [formulaType, setFormulaType] = useState("master")
  const [productType, setProductType] = useState("")
  const [cosmeticForm, setCosmeticForm] = useState("")
  const [category, setCategory] = useState("")
  const [customer, setCustomer] = useState("")
  const [parentFormula, setParentFormula] = useState("")
  const [description, setDescription] = useState("")

  // Batch & QC
  const [batchSize, setBatchSize] = useState("100")
  const [batchUnit, setBatchUnit] = useState("kg")
  const [density, setDensity] = useState("1.00")
  const [phMin, setPhMin] = useState("5.0")
  const [phMax, setPhMax] = useState("7.0")
  const [viscosityMin, setViscosityMin] = useState("")
  const [viscosityMax, setViscosityMax] = useState("")
  const [viscosityUnit, setViscosityUnit] = useState("cP")
  const [unitWeight, setUnitWeight] = useState("")

  // Ingredients
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { id: "1", name: "", inci: "", percentage: "", phase: "A", function: "" }
  ])

  // Phases
  const [phases, setPhases] = useState<PhaseRow[]>([
    { id: "1", name: "Phase A", description: "Water phase", temperature: "70-75" },
    { id: "2", name: "Phase B", description: "Oil phase", temperature: "70-75" },
    { id: "3", name: "Phase C", description: "Cool down", temperature: "40-45" },
  ])

  // Cost
  const [costBottle, setCostBottle] = useState("")
  const [costCap, setCostCap] = useState("")
  const [costBox, setCostBox] = useState("")
  const [costLabel, setCostLabel] = useState("")
  const [costLabor, setCostLabor] = useState("")
  const [costQc, setCostQc] = useState("")
  const [costOverhead, setCostOverhead] = useState("")
  const [costOther, setCostOther] = useState("")
  const [targetMargin, setTargetMargin] = useState("30")

  // Stability
  const [shelfLife, setShelfLife] = useState("24")
  const [storageConditions, setStorageConditions] = useState("")
  const [stabilityTests, setStabilityTests] = useState({
    rtStability: true,
    accelerated: true,
    freezeThaw: false,
    photostability: false,
    microbial: true,
  })

  // Packaging
  const [packagingNotes, setPackagingNotes] = useState("")
  const [compatibleMaterials, setCompatibleMaterials] = useState<string[]>(["HDPE", "PET"])

  // Notes
  const [internalNotes, setInternalNotes] = useState("")
  const [tags, setTags] = useState("")

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab)
  const canGoNext = currentTabIndex < TABS.length - 1
  const canGoPrev = currentTabIndex > 0

  const handleNext = () => {
    if (canGoNext) setActiveTab(TABS[currentTabIndex + 1].id)
  }

  const handlePrev = () => {
    if (canGoPrev) setActiveTab(TABS[currentTabIndex - 1].id)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset after animation
    setTimeout(() => {
      setActiveTab("info")
      setFormulaNameTh("")
      setFormulaNameEn("")
      setIngredients([{ id: "1", name: "", inci: "", percentage: "", phase: "A", function: "" }])
    }, 200)
  }

  const handleCreate = () => {
    toast.success("Formula created successfully!", {
      description: `${formulaNameTh || formulaNameEn || "New Formula"} has been created as a draft.`
    })
    handleClose()
  }

  const addIngredient = () => {
    setIngredients([...ingredients, {
      id: String(Date.now()),
      name: "",
      inci: "",
      percentage: "",
      phase: "A",
      function: ""
    }])
  }

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id))
    }
  }

  const updateIngredient = (id: string, field: keyof IngredientRow, value: string) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const addPhase = () => {
    setPhases([...phases, {
      id: String(Date.now()),
      name: `Phase ${String.fromCharCode(65 + phases.length)}`,
      description: "",
      temperature: ""
    }])
  }

  const removePhase = (id: string) => {
    if (phases.length > 1) {
      setPhases(phases.filter(p => p.id !== id))
    }
  }

  const totalPercentage = ingredients.reduce((sum, i) => sum + (parseFloat(i.percentage) || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border bg-card">
          <DialogTitle className="text-lg font-extrabold">New Formula</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Create a new formula record. Fill in each section and navigate using the tabs below.
          </DialogDescription>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
            {TABS.map((tab, i) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              const isPast = i < currentTabIndex
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : isPast
                        ? "bg-violet-50 text-violet-700"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {isPast ? <Check className="h-3 w-3" /> : <TabIcon className="h-3.5 w-3.5" />}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 min-h-[420px] max-h-[calc(90vh-220px)] overflow-y-auto">
          {/* === INFO TAB === */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-violet-500" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Name (TH) *</Label>
                  <Input 
                    value={formulaNameTh}
                    onChange={(e) => setFormulaNameTh(e.target.value)}
                    placeholder="e.g. เซรั่มวิตามินซี 15%" 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Name (EN)</Label>
                  <Input 
                    value={formulaNameEn}
                    onChange={(e) => setFormulaNameEn(e.target.value)}
                    placeholder="e.g. Vitamin C 15% Serum" 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Type *</Label>
                  <select 
                    value={formulaType}
                    onChange={(e) => setFormulaType(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]"
                  >
                    <option value="master">Master Formula</option>
                    <option value="variation">Variation</option>
                    <option value="trial">Trial Batch</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Product Type *</Label>
                  <select 
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]"
                  >
                    <option value="">Select type...</option>
                    <option value="serum">Serum</option>
                    <option value="cream">Cream</option>
                    <option value="lotion">Lotion</option>
                    <option value="cleanser">Cleanser</option>
                    <option value="sunscreen">Sunscreen</option>
                    <option value="toner">Toner</option>
                    <option value="essence">Essence</option>
                    <option value="mask">Mask</option>
                    <option value="shampoo">Shampoo</option>
                    <option value="conditioner">Conditioner</option>
                    <option value="lip">Lip Product</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Cosmetic Form</Label>
                  <select 
                    value={cosmeticForm}
                    onChange={(e) => setCosmeticForm(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]"
                  >
                    <option value="">Select form...</option>
                    <option value="Emulsion (O/W)">Emulsion (O/W)</option>
                    <option value="Emulsion (W/O)">Emulsion (W/O)</option>
                    <option value="Gel">Gel</option>
                    <option value="Solution">Solution</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Powder">Powder</option>
                    <option value="Solid">Solid</option>
                    <option value="Aerosol">Aerosol</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]"
                  >
                    <option value="">Select category...</option>
                    <option value="skincare">Skincare</option>
                    <option value="haircare">Haircare</option>
                    <option value="bodycare">Bodycare</option>
                    <option value="makeup">Makeup</option>
                    <option value="fragrance">Fragrance</option>
                    <option value="suncare">Suncare</option>
                    <option value="babycare">Baby Care</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Customer / Brand Owner</Label>
                  <Input 
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Search customer..." 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
              </div>
              {formulaType === "variation" && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Parent Formula</Label>
                  <Input 
                    value={parentFormula}
                    onChange={(e) => setParentFormula(e.target.value)}
                    placeholder="Search parent formula..." 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the formula..."
                  className="text-[12px] rounded-lg min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* === BATCH & QC TAB === */}
          {activeTab === "batch" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <Beaker className="h-4 w-4 text-violet-500" /> Batch & QC Parameters
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Batch Size *</Label>
                  <Input 
                    type="number" 
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    placeholder="100" 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Unit *</Label>
                  <select 
                    value={batchUnit}
                    onChange={(e) => setBatchUnit(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="mL">mL</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Density (g/mL)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="1.00" 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Unit Weight (g)</Label>
                  <Input 
                    type="number" 
                    value={unitWeight}
                    onChange={(e) => setUnitWeight(e.target.value)}
                    placeholder="50" 
                    className="text-[12px] rounded-lg" 
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="text-[12px] font-semibold text-foreground mb-3">QC Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold">Target pH Range</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={phMin}
                        onChange={(e) => setPhMin(e.target.value)}
                        placeholder="5.0" 
                        className="text-[12px] rounded-lg" 
                      />
                      <span className="text-[11px] text-muted-foreground">to</span>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={phMax}
                        onChange={(e) => setPhMax(e.target.value)}
                        placeholder="7.0" 
                        className="text-[12px] rounded-lg" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold">Viscosity Range</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={viscosityMin}
                        onChange={(e) => setViscosityMin(e.target.value)}
                        placeholder="5000" 
                        className="text-[12px] rounded-lg" 
                      />
                      <span className="text-[11px] text-muted-foreground">to</span>
                      <Input 
                        type="number" 
                        value={viscosityMax}
                        onChange={(e) => setViscosityMax(e.target.value)}
                        placeholder="15000" 
                        className="text-[12px] rounded-lg" 
                      />
                      <select 
                        value={viscosityUnit}
                        onChange={(e) => setViscosityUnit(e.target.value)}
                        className="flex h-9 w-20 rounded-lg border border-input bg-background px-2 text-[11px]"
                      >
                        <option value="cP">cP</option>
                        <option value="mPa.s">mPa.s</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === INGREDIENTS TAB === */}
          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-violet-500" /> Ingredients
                </h3>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    Math.abs(totalPercentage - 100) < 0.01 
                      ? "bg-emerald-100 text-emerald-700" 
                      : totalPercentage > 100 
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  )}>
                    Total: {totalPercentage.toFixed(2)}%
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={addIngredient}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="w-8 px-2 py-2"></th>
                      <th className="text-left px-3 py-2 font-semibold">Ingredient Name</th>
                      <th className="text-left px-3 py-2 font-semibold">INCI Name</th>
                      <th className="text-center px-2 py-2 font-semibold w-20">%</th>
                      <th className="text-center px-2 py-2 font-semibold w-16">Phase</th>
                      <th className="text-left px-3 py-2 font-semibold">Function</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ing, idx) => (
                      <tr key={ing.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-2 py-1.5 text-center text-muted-foreground">
                          <GripVertical className="h-3 w-3 mx-auto cursor-move" />
                        </td>
                        <td className="px-1 py-1.5">
                          <Input 
                            value={ing.name}
                            onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                            placeholder="e.g. Niacinamide"
                            className="h-7 text-[11px] rounded border-transparent hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <Input 
                            value={ing.inci}
                            onChange={(e) => updateIngredient(ing.id, "inci", e.target.value)}
                            placeholder="INCI"
                            className="h-7 text-[11px] rounded border-transparent hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <Input 
                            type="number"
                            step="0.01"
                            value={ing.percentage}
                            onChange={(e) => updateIngredient(ing.id, "percentage", e.target.value)}
                            placeholder="0.00"
                            className="h-7 text-[11px] rounded text-center border-transparent hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <select
                            value={ing.phase}
                            onChange={(e) => updateIngredient(ing.id, "phase", e.target.value)}
                            className="h-7 w-full rounded border border-transparent hover:border-border text-[11px] text-center bg-transparent"
                          >
                            {phases.map(p => (
                              <option key={p.id} value={p.name.replace("Phase ", "")}>{p.name.replace("Phase ", "")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <Input 
                            value={ing.function}
                            onChange={(e) => updateIngredient(ing.id, "function", e.target.value)}
                            placeholder="e.g. Active"
                            className="h-7 text-[11px] rounded border-transparent hover:border-border focus:border-primary"
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <button 
                            onClick={() => removeIngredient(ing.id)}
                            className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                            disabled={ingredients.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Tip: After creating the formula, you can add ingredients from Stock or manually with full details.
              </p>
            </div>
          )}

          {/* === PHASES TAB === */}
          {activeTab === "phases" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-500" /> Manufacturing Phases
                </h3>
                <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={addPhase}>
                  <Plus className="h-3 w-3" /> Add Phase
                </Button>
              </div>

              <div className="space-y-3">
                {phases.map((phase, idx) => (
                  <div key={phase.id} className="flex items-start gap-3 p-3 border rounded-xl bg-secondary/30">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-100 text-violet-700 font-bold text-[12px] shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Phase Name</Label>
                        <Input 
                          value={phase.name}
                          onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, name: e.target.value } : p))}
                          className="h-8 text-[11px] rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Description</Label>
                        <Input 
                          value={phase.description}
                          onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, description: e.target.value } : p))}
                          placeholder="e.g. Water phase"
                          className="h-8 text-[11px] rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Temperature (C)</Label>
                        <Input 
                          value={phase.temperature}
                          onChange={(e) => setPhases(phases.map(p => p.id === phase.id ? { ...p, temperature: e.target.value } : p))}
                          placeholder="e.g. 70-75"
                          className="h-8 text-[11px] rounded-lg"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removePhase(phase.id)}
                      className="p-1.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors mt-5"
                      disabled={phases.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === COST TAB === */}
          {activeTab === "cost" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-violet-500" /> Cost Breakdown
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Bottle (THB)</Label>
                  <Input type="number" step="0.01" value={costBottle} onChange={(e) => setCostBottle(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Cap (THB)</Label>
                  <Input type="number" step="0.01" value={costCap} onChange={(e) => setCostCap(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Box (THB)</Label>
                  <Input type="number" step="0.01" value={costBox} onChange={(e) => setCostBox(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Label (THB)</Label>
                  <Input type="number" step="0.01" value={costLabel} onChange={(e) => setCostLabel(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Labor (THB)</Label>
                  <Input type="number" step="0.01" value={costLabor} onChange={(e) => setCostLabor(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">QC (THB)</Label>
                  <Input type="number" step="0.01" value={costQc} onChange={(e) => setCostQc(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Overhead (THB)</Label>
                  <Input type="number" step="0.01" value={costOverhead} onChange={(e) => setCostOverhead(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Other (THB)</Label>
                  <Input type="number" step="0.01" value={costOther} onChange={(e) => setCostOther(e.target.value)} placeholder="0.00" className="text-[12px] rounded-lg" />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-1.5 w-32">
                    <Label className="text-[11px] font-semibold">Target Margin %</Label>
                    <Input type="number" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} placeholder="30" className="text-[12px] rounded-lg" />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex-1">
                    Ingredient costs will be calculated automatically based on the percentage and unit cost from Stock.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* === STABILITY TAB === */}
          {activeTab === "stability" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-500" /> Stability & Shelf Life
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Shelf Life (Months)</Label>
                  <Input type="number" value={shelfLife} onChange={(e) => setShelfLife(e.target.value)} placeholder="24" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Storage Conditions</Label>
                  <Input value={storageConditions} onChange={(e) => setStorageConditions(e.target.value)} placeholder="e.g. Store below 30C, away from sunlight" className="text-[12px] rounded-lg" />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Label className="text-[11px] font-semibold mb-3 block">Required Stability Tests</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "rtStability", label: "Room Temperature Stability (RT)" },
                    { key: "accelerated", label: "Accelerated Stability (40C/75%RH)" },
                    { key: "freezeThaw", label: "Freeze-Thaw Cycling" },
                    { key: "photostability", label: "Photostability" },
                    { key: "microbial", label: "Microbial Challenge (PET)" },
                  ].map((test) => (
                    <div key={test.key} className="flex items-center gap-2">
                      <Checkbox 
                        id={test.key}
                        checked={stabilityTests[test.key as keyof typeof stabilityTests]}
                        onCheckedChange={(checked) => setStabilityTests({ ...stabilityTests, [test.key]: checked })}
                      />
                      <label htmlFor={test.key} className="text-[11px] text-foreground cursor-pointer">{test.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === PACKAGING TAB === */}
          {activeTab === "packaging" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-violet-500" /> Packaging Compatibility
              </h3>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Compatible Materials</Label>
                <div className="flex flex-wrap gap-2">
                  {["HDPE", "PET", "PP", "Glass", "Aluminum", "Airless Pump", "Tube"].map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => {
                        if (compatibleMaterials.includes(mat)) {
                          setCompatibleMaterials(compatibleMaterials.filter(m => m !== mat))
                        } else {
                          setCompatibleMaterials([...compatibleMaterials, mat])
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
                        compatibleMaterials.includes(mat)
                          ? "bg-violet-100 border-violet-300 text-violet-700"
                          : "bg-secondary border-border text-muted-foreground hover:border-violet-200"
                      )}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Packaging Notes</Label>
                <Textarea 
                  value={packagingNotes}
                  onChange={(e) => setPackagingNotes(e.target.value)}
                  placeholder="e.g. Avoid metallic containers. Use UV-protective packaging for photosensitive actives."
                  className="text-[12px] rounded-lg min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* === NOTES TAB === */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-500" /> Additional Notes
              </h3>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Internal Notes</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Any internal notes about this formula..."
                  className="text-[12px] rounded-lg min-h-[100px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Tags / Keywords</Label>
                <Input 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. brightening, anti-aging, sensitive (comma-separated)" 
                  className="text-[12px] rounded-lg" 
                />
              </div>

              {/* Summary preview */}
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2 mt-4">
                <h4 className="text-[12px] font-bold text-violet-900">Summary</h4>
                <div className="text-[11px] text-violet-700 leading-relaxed space-y-1">
                  <p><strong>Name:</strong> {formulaNameTh || formulaNameEn || "(not set)"}</p>
                  <p><strong>Type:</strong> {formulaType === "master" ? "Master Formula" : formulaType === "variation" ? "Variation" : "Trial Batch"}</p>
                  <p><strong>Batch:</strong> {batchSize} {batchUnit}</p>
                  <p><strong>Ingredients:</strong> {ingredients.filter(i => i.name).length} items ({totalPercentage.toFixed(2)}%)</p>
                  <p><strong>Phases:</strong> {phases.length}</p>
                </div>
                <p className="text-[10px] text-violet-600 mt-2">
                  This formula will be created in <strong>Draft</strong> status. You can add more details from the detail page.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-card gap-2">
          {canGoPrev && (
            <Button variant="outline" size="sm" className="rounded-lg text-[12px] gap-1" onClick={handlePrev}>
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="rounded-lg text-[12px]" onClick={handleClose}>
            Cancel
          </Button>
          {canGoNext ? (
            <Button size="sm" className="rounded-lg text-[12px] bg-violet-600 hover:bg-violet-700 text-white gap-1" onClick={handleNext}>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="rounded-lg text-[12px] bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCreate}>
              Create Formula
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
