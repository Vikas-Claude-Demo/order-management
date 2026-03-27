"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { createCustomer, updateCustomer, toggleCustomerActive } from "@/actions/customers"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, UserX, UserCheck, Users2, Mail, Phone, Building2, Search } from "lucide-react"

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  notes: string
  active: boolean
  createdAt: Date
  _count: { orders: number }
}

const avatarColors = [
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-fuchsia-400 to-pink-500",
  "from-lime-400 to-green-500",
]

function getColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<CustomerRow | null>(null)
  const [search, setSearch] = useState("")

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await createCustomer({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
      address: fd.get("address") as string,
      notes: fd.get("notes") as string,
    })
    if (result.success) {
      setCreateOpen(false)
      toast({ title: "Customer created" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editCustomer) return
    const fd = new FormData(e.currentTarget)
    const result = await updateCustomer(editCustomer.id, {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      company: fd.get("company") as string,
      address: fd.get("address") as string,
      notes: fd.get("notes") as string,
    })
    if (result.success) {
      setEditCustomer(null)
      toast({ title: "Customer updated" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleToggleActive(id: string) {
    await toggleCustomerActive(id)
    toast({ title: "Customer status updated" })
  }

  function CustomerForm({ defaults, onSubmit, submitLabel }: {
    defaults?: CustomerRow
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    submitLabel: string
  }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cf-name">Name *</Label>
            <Input id="cf-name" name="name" defaultValue={defaults?.name} required className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cf-email">Email</Label>
            <Input id="cf-email" name="email" type="email" defaultValue={defaults?.email} className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cf-phone">Phone</Label>
            <Input id="cf-phone" name="phone" defaultValue={defaults?.phone} className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cf-company">Company</Label>
            <Input id="cf-company" name="company" defaultValue={defaults?.company} className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cf-address">Address</Label>
            <Input id="cf-address" name="address" defaultValue={defaults?.address} className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="cf-notes">Notes</Label>
            <Textarea id="cf-notes" name="notes" defaultValue={defaults?.notes} rows={2} className="border-slate-200 focus-visible:ring-indigo-500/50" />
          </div>
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
          {submitLabel}
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Users2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Customers
            </h2>
            <p className="text-muted-foreground text-sm">{customers.length} customers</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/20 border-0">
              <Plus className="h-4 w-4 mr-1" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Customer</DialogTitle>
              <DialogDescription>Add a new customer to the system.</DialogDescription>
            </DialogHeader>
            <CustomerForm onSubmit={handleCreate} submitLabel="Create Customer" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-slate-200"
        />
      </div>

      <Dialog open={!!editCustomer} onOpenChange={(open) => { if (!open) setEditCustomer(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details.</DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <CustomerForm defaults={editCustomer} onSubmit={handleEdit} submitLabel="Save Changes" />
          )}
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-muted">
          <Users2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search ? "No customers match your search" : "No customers yet"}
          </p>
          {!search && (
            <p className="text-sm text-muted-foreground/70 mt-1">Click &quot;Add Customer&quot; to get started.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-teal-50/30 hover:from-slate-50 hover:to-teal-50/30">
                <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                <TableHead className="font-semibold text-slate-600">Contact</TableHead>
                <TableHead className="font-semibold text-slate-600">Company</TableHead>
                <TableHead className="font-semibold text-slate-600 text-center">Orders</TableHead>
                <TableHead className="font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => {
                const color = getColor(customer.name)
                return (
                  <TableRow key={customer.id} className="hover:bg-teal-50/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/customers/${customer.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                            {customer.name}
                          </Link>
                          {customer.address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{customer.address}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {!customer.email && !customer.phone && (
                          <span className="text-sm text-muted-foreground italic">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.company ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.company}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {customer._count.orders}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditCustomer(customer)} className="hover:bg-teal-50 hover:text-teal-600 rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(customer.id)} className="hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                          {customer.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
