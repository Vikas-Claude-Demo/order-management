"use client"

import { Fragment, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { ProductForm } from "@/components/product-form"
import { toggleProductActive } from "@/actions/products"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Archive, ArchiveRestore, Boxes, Search, ChevronRight, ChevronDown } from "lucide-react"

interface VariantRow {
  id: string
  name: string
  sku: string
  price: number
  sortOrder: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductRow {
  id: string
  name: string
  description: string
  sku: string
  category: string
  basePrice: number
  hasVariants: boolean
  active: boolean
  variants: VariantRow[]
  _count: { lineItems: number }
  createdAt: Date
  updatedAt: Date
}

export function ProductsClient({ products }: { products: ProductRow[] }) {
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null)
  const [search, setSearch] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  function toggleExpand(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleToggleActive(id: string) {
    await toggleProductActive(id)
    toast({ title: "Product status updated" })
  }

  function getPriceDisplay(product: ProductRow) {
    if (!product.hasVariants || product.variants.length === 0) {
      return `₹${product.basePrice.toFixed(2)}`
    }
    const prices = product.variants.map((v) => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `₹${min.toFixed(2)}`
    return `₹${min.toFixed(2)} — ₹${max.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Products
            </h2>
            <p className="text-muted-foreground text-sm">{products.length} products</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 border-0">
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Product</DialogTitle>
              <DialogDescription>Add a new product to the catalog.</DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-slate-200"
        />
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) setEditProduct(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details.</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              defaults={{
                id: editProduct.id,
                name: editProduct.name,
                description: editProduct.description,
                sku: editProduct.sku,
                category: editProduct.category,
                basePrice: editProduct.basePrice,
                hasVariants: editProduct.hasVariants,
                variants: editProduct.variants.map((v) => ({
                  name: v.name,
                  sku: v.sku,
                  price: v.price,
                  sortOrder: v.sortOrder,
                })),
              }}
              onSuccess={() => setEditProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-muted">
          <Boxes className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search ? "No products match your search" : "No products yet"}
          </p>
          {!search && (
            <p className="text-sm text-muted-foreground/70 mt-1">Click &quot;Add Product&quot; to get started.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-orange-50/30 hover:from-slate-50 hover:to-orange-50/30">
                <TableHead className="w-8"></TableHead>
                <TableHead className="font-semibold text-slate-600">Product</TableHead>
                <TableHead className="font-semibold text-slate-600">SKU</TableHead>
                <TableHead className="font-semibold text-slate-600">Category</TableHead>
                <TableHead className="font-semibold text-slate-600">Price</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Variants</TableHead>
                <TableHead className="font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const isExpanded = expandedRows.has(product.id)
                return (
                  <Fragment key={product.id}>
                    <TableRow className="hover:bg-orange-50/30 transition-colors">
                      <TableCell className="w-8 pr-0">
                        {product.hasVariants && product.variants.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(product.id)}
                            className="p-1 rounded hover:bg-orange-100 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-orange-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4 h-4 block" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 rounded px-1.5 py-0.5">{product.sku}</code>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {product.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-900">{getPriceDisplay(product)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.hasVariants && product.variants.length > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditProduct(product)} className="hover:bg-orange-50 hover:text-orange-600 rounded-lg">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(product.id)} className="hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                            {product.active ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Variant sub-rows */}
                    {isExpanded &&
                      product.variants.map((variant) => (
                        <TableRow key={variant.id} className="bg-amber-50/40 hover:bg-amber-50/60">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            <p className="text-sm text-slate-700">↳ {variant.name}</p>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-slate-100 rounded px-1.5 py-0.5">{variant.sku}</code>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            <span className="text-sm font-medium text-slate-900">₹{variant.price.toFixed(2)}</span>
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
