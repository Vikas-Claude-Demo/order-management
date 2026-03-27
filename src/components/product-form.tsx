"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { createProduct, updateProduct } from "@/actions/products"
import { useToast } from "@/components/ui/use-toast"

interface VariantInput {
  name: string
  sku: string
  price: number
  sortOrder: number
}

interface ProductFormProps {
  defaults?: {
    id: string
    name: string
    description: string
    sku: string
    category: string
    basePrice: number
    hasVariants: boolean
    variants: { name: string; sku: string; price: number; sortOrder: number }[]
  }
  onSuccess: () => void
}

export function ProductForm({ defaults, onSuccess }: ProductFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(defaults?.name ?? "")
  const [description, setDescription] = useState(defaults?.description ?? "")
  const [sku, setSku] = useState(defaults?.sku ?? "")
  const [category, setCategory] = useState(defaults?.category ?? "")
  const [basePrice, setBasePrice] = useState(defaults?.basePrice ?? 0)
  const [hasVariants, setHasVariants] = useState(defaults?.hasVariants ?? false)
  const [variants, setVariants] = useState<VariantInput[]>(
    defaults?.variants?.length ? defaults.variants : [{ name: "", sku: "", price: 0, sortOrder: 0 }]
  )

  function addVariant() {
    setVariants([...variants, { name: "", sku: "", price: 0, sortOrder: variants.length }])
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)))
  }

  function handleModeToggle(wantVariants: boolean) {
    if (!wantVariants && hasVariants && variants.some((v) => v.name || v.sku)) {
      if (!confirm("Switching to Simple Product will discard your variants. Continue?")) return
    }
    setHasVariants(wantVariants)
    if (wantVariants && variants.length === 0) {
      setVariants([{ name: "", sku: "", price: 0, sortOrder: 0 }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = {
        name,
        description,
        sku,
        category,
        basePrice: Number(basePrice),
        hasVariants,
        variants: hasVariants ? variants.map((v, i) => ({ ...v, price: Number(v.price), sortOrder: i })) : [],
      }

      const result = defaults?.id
        ? await updateProduct(defaults.id, formData)
        : await createProduct(formData)

      if ("error" in result && result.error) {
        const errors = result.error as Record<string, string[]>
        const msg = Object.values(errors).flat().join(", ")
        toast({ title: "Validation Error", description: msg, variant: "destructive" })
      } else {
        toast({ title: defaults ? "Product Updated" : "Product Created" })
        onSuccess()
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pf-name">Product Name *</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} required className="border-slate-200 focus-visible:ring-orange-500/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-desc">Description</Label>
          <Textarea id="pf-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="border-slate-200 focus-visible:ring-orange-500/50" />
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-sku">SKU *</Label>
            <Input id="pf-sku" value={sku} onChange={(e) => setSku(e.target.value)} required className="border-slate-200 focus-visible:ring-orange-500/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-cat">Category</Label>
            <Input id="pf-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="border-slate-200 focus-visible:ring-orange-500/50" />
          </div>
        </div>
        <div className="w-1/2 space-y-2">
          <Label htmlFor="pf-price">Base Price</Label>
          <Input id="pf-price" type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} className="border-slate-200 focus-visible:ring-orange-500/50" />
        </div>
      </div>

      {/* Pricing Mode Toggle */}
      <div className="space-y-3">
        <Label>Pricing Mode</Label>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => handleModeToggle(false)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              !hasVariants
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-inner"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Simple Product
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle(true)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              hasVariants
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-inner"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            With Variations
          </button>
        </div>
      </div>

      {/* Variants */}
      {hasVariants && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Variations</Label>
            <Button type="button" variant="outline" size="sm" onClick={addVariant} className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <Plus className="h-4 w-4 mr-1" /> Add Variation
            </Button>
          </div>
          <div className="space-y-2">
            <div className="hidden md:grid md:grid-cols-10 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">SKU</div>
              <div className="col-span-3">Price</div>
              <div className="col-span-1"></div>
            </div>
            {variants.map((v, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-start">
                <div className="md:col-span-3">
                  <Input
                    placeholder="e.g. Small, Red, 500g"
                    value={v.name}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                    required
                    className="border-slate-200 focus-visible:ring-orange-500/50"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    placeholder="Variant SKU"
                    value={v.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    required
                    className="border-slate-200 focus-visible:ring-orange-500/50"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
                    required
                    className="border-slate-200 focus-visible:ring-orange-500/50"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    disabled={variants.length <= 1}
                    className="hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border-0"
      >
        {loading ? "Saving..." : defaults ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  )
}
