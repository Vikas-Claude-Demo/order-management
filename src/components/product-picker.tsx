"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Boxes, Search, ChevronRight, ChevronDown } from "lucide-react"

interface PickerVariant {
  id: string
  name: string
  sku: string
  price: number
}

interface PickerProduct {
  id: string
  name: string
  sku: string
  category: string
  basePrice: number
  hasVariants: boolean
  variants: PickerVariant[]
}

interface ProductPickerProps {
  products: PickerProduct[]
  onSelect: (item: {
    description: string
    unitPrice: number
    productId: string
    productVariantId?: string
  }) => void
}

export function ProductPicker({ products, onSelect }: ProductPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelectSimple(product: PickerProduct) {
    onSelect({
      description: product.name,
      unitPrice: product.basePrice,
      productId: product.id,
    })
    setOpen(false)
    setSearch("")
    setExpandedId(null)
  }

  function handleSelectVariant(product: PickerProduct, variant: PickerVariant) {
    onSelect({
      description: `${product.name} — ${variant.name}`,
      unitPrice: variant.price,
      productId: product.id,
      productVariantId: variant.id,
    })
    setOpen(false)
    setSearch("")
    setExpandedId(null)
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="border-orange-200 text-orange-700 hover:bg-orange-50"
      >
        <Boxes className="h-4 w-4 mr-1" /> Pick Product
      </Button>

      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 w-80 rounded-xl border bg-white shadow-xl max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm border-slate-200"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No products found</div>
            ) : (
              filtered.map((product) => {
                const isExpanded = expandedId === product.id

                if (!product.hasVariants || product.variants.length === 0) {
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectSimple(product)}
                      className="w-full text-left px-3 py-2.5 hover:bg-orange-50 transition-colors border-b last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.sku}
                            {product.category && ` · ${product.category}`}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-emerald-600 ml-2 shrink-0">
                          ₹{product.basePrice.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  )
                }

                return (
                  <div key={product.id} className="border-b last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-orange-50 transition-colors flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.sku}
                          {product.category && ` · ${product.category}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                        {product.variants.length} var.
                      </Badge>
                    </button>
                    {isExpanded && (
                      <div className="bg-amber-50/40">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => handleSelectVariant(product, variant)}
                            className="w-full text-left pl-9 pr-3 py-2 hover:bg-amber-100/60 transition-colors flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-slate-700">{variant.name}</p>
                              <p className="text-xs text-muted-foreground">{variant.sku}</p>
                            </div>
                            <span className="text-sm font-medium text-emerald-600 ml-2 shrink-0">
                              ₹{variant.price.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
