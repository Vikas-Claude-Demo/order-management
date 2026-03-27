"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, User, Mail, Phone, FileText, ShoppingCart, Users2, X } from "lucide-react"
import { createOrder, updateOrder } from "@/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { ProductPicker } from "@/components/product-picker"

interface LineItemInput {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  sortOrder: number
  productId?: string
  productVariantId?: string
}

interface CustomerOption {
  id: string
  name: string
  email: string
  phone: string
  company: string
}

interface PickerProduct {
  id: string
  name: string
  sku: string
  category: string
  basePrice: number
  hasVariants: boolean
  variants: { id: string; name: string; sku: string; price: number }[]
}

interface OrderFormProps {
  orderId?: string
  customers?: CustomerOption[]
  products?: PickerProduct[]
  initialData?: {
    customerId?: string
    customerName: string
    customerEmail: string
    customerPhone: string
    notes: string
    lineItems: LineItemInput[]
  }
}

export function OrderForm({ orderId, customers = [], products = [], initialData }: OrderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "")
  const [customerName, setCustomerName] = useState(initialData?.customerName ?? "")
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail ?? "")
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone ?? "")
  const [notes, setNotes] = useState(initialData?.notes ?? "")
  const [lineItems, setLineItems] = useState<LineItemInput[]>(
    initialData?.lineItems?.length
      ? initialData.lineItems
      : [{ description: "", quantity: 1, unitPrice: 0, sortOrder: 0 }]
  )

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(customerSearch.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function selectCustomer(c: CustomerOption) {
    setCustomerId(c.id)
    setCustomerName(c.name)
    setCustomerEmail(c.email)
    setCustomerPhone(c.phone)
    setCustomerSearch("")
    setShowCustomerDropdown(false)
  }

  function clearCustomer() {
    setCustomerId("")
    setCustomerName("")
    setCustomerEmail("")
    setCustomerPhone("")
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, sortOrder: lineItems.length }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  function updateLineItem(index: number, field: keyof LineItemInput, value: string | number) {
    setLineItems(lineItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function handlePickProduct(item: { description: string; unitPrice: number; productId: string; productVariantId?: string }) {
    setLineItems([
      ...lineItems,
      {
        description: item.description,
        quantity: 1,
        unitPrice: item.unitPrice,
        sortOrder: lineItems.length,
        productId: item.productId,
        productVariantId: item.productVariantId,
      },
    ])
  }

  const orderTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = {
        customerId: customerId || undefined,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        lineItems: lineItems.map((item, i) => ({
          ...item,
          sortOrder: i,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          productId: item.productId,
          productVariantId: item.productVariantId,
        })),
      }

      const result = orderId
        ? await updateOrder(orderId, formData)
        : await createOrder(formData)

      if ("error" in result && result.error) {
        toast({ title: "Validation Error", description: "Please check your inputs", variant: "destructive" })
      } else if ("orderId" in result) {
        toast({ title: orderId ? "Order Updated" : "Order Created", variant: "default" })
        router.push(`/orders/${result.orderId}`)
      } else {
        toast({ title: "Order Updated", variant: "default" })
        router.push(`/orders/${orderId}`)
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5 text-blue-500" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Customer picker */}
          {customers.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <Label className="flex items-center gap-1.5 mb-2">
                <Users2 className="h-3.5 w-3.5 text-muted-foreground" /> Select Existing Customer
              </Label>
              {customerId ? (
                <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-teal-900">{customerName}</p>
                    <p className="text-xs text-teal-600">
                      {[customerEmail, customerPhone].filter(Boolean).join(" / ") || "No contact info"}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={clearCustomer} className="h-7 w-7 hover:bg-teal-100">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search customers by name, email, or company..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setShowCustomerDropdown(true)
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="border-slate-200 focus-visible:ring-teal-500/50"
                  />
                  {showCustomerDropdown && customerSearch && (
                    <div className="absolute z-50 top-full mt-1 w-full rounded-xl border bg-white shadow-xl max-h-60 overflow-auto">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCustomer(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors flex items-center gap-3 border-b last:border-0"
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{c.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {[c.company, c.email, c.phone].filter(Boolean).join(" / ")}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-muted-foreground">or enter manually</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Customer Name *
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="border-slate-200 focus-visible:ring-indigo-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
              </Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="border-slate-200 focus-visible:ring-indigo-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="border-slate-200 focus-visible:ring-indigo-500/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <ShoppingCart className="h-5 w-5 text-purple-500" />
            Line Items
          </CardTitle>
          <div className="flex gap-2">
            {products.length > 0 && (
              <ProductPicker products={products} onSelect={handlePickProduct} />
            )}
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1"></div>
            </div>
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
                <div className="md:col-span-5">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    required
                    className="border-slate-200 focus-visible:ring-purple-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
                    required
                    className="border-slate-200 focus-visible:ring-purple-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, "unitPrice", Number(e.target.value))}
                    required
                    className="border-slate-200 focus-visible:ring-purple-500/50"
                  />
                </div>
                <div className="md:col-span-2 flex items-center h-9 px-3 text-sm font-bold text-emerald-600">
                  ₹{(item.quantity * item.unitPrice).toFixed(2)}
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length <= 1}
                    className="hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t border-dashed">
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-5 py-3">
                <span className="text-sm text-emerald-600 font-medium">Order Total</span>
                <p className="text-2xl font-bold text-emerald-700">₹{orderTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <FileText className="h-5 w-5 text-amber-500" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this order..."
            rows={3}
            className="border-slate-200 focus-visible:ring-amber-500/50"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 border-0"
        >
          {loading ? "Saving..." : orderId ? "Update Order" : "Create Order"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-slate-300">
          Cancel
        </Button>
      </div>
    </form>
  )
}
