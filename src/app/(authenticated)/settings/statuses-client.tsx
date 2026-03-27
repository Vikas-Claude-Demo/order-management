"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createStatus, updateStatus, deleteStatus } from "@/actions/statuses"
import { COLOR_OPTIONS, getColorConfig } from "@/lib/status-colors"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2, Settings, Star, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusRow {
  id: string
  key: string
  label: string
  color: string
  sortOrder: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export function StatusesClient({ statuses }: { statuses: StatusRow[] }) {
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<StatusRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<StatusRow | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await createStatus({
      key: (fd.get("key") as string).toUpperCase().replace(/\s+/g, "_"),
      label: fd.get("label") as string,
      color: fd.get("color") as string,
      sortOrder: Number(fd.get("sortOrder") || statuses.length),
      isDefault: fd.get("isDefault") === "on",
    })
    if (result.success) {
      setCreateOpen(false)
      toast({ title: "Status created" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editStatus) return
    const fd = new FormData(e.currentTarget)
    const result = await updateStatus(editStatus.id, {
      label: fd.get("label") as string,
      color: fd.get("color") as string,
      sortOrder: Number(fd.get("sortOrder") || 0),
      isDefault: fd.get("isDefault") === "on",
    })
    if (result.success) {
      setEditStatus(null)
      toast({ title: "Status updated" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    const result = await deleteStatus(deleteConfirm.id)
    if (result.success) {
      setDeleteConfirm(null)
      toast({ title: "Status deleted" })
    } else {
      toast({ title: "Error", description: result.error as string, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Order Statuses
            </h2>
            <p className="text-muted-foreground text-sm">{statuses.length} statuses configured</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 border-0">
              <Plus className="h-4 w-4 mr-1" /> Add Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Status</DialogTitle>
              <DialogDescription>Add a new order status to the workflow.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-key">Key</Label>
                <Input id="create-key" name="key" placeholder="e.g. IN_REVIEW" required className="border-slate-200 focus-visible:ring-indigo-500/50 uppercase" />
                <p className="text-xs text-muted-foreground">Uppercase with underscores. Cannot be changed later.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-label">Display Label</Label>
                <Input id="create-label" name="label" placeholder="e.g. In Review" required className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-color">Color</Label>
                <Select name="color" defaultValue="slate">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => {
                      const config = getColorConfig(color)
                      return (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-3 w-3 rounded-full", config.swatch)} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-sortOrder">Sort Order</Label>
                <Input id="create-sortOrder" name="sortOrder" type="number" defaultValue={statuses.length} className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="create-isDefault" name="isDefault" className="rounded" />
                <Label htmlFor="create-isDefault">Default status for new orders</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                Create Status
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editStatus} onOpenChange={(open) => { if (!open) setEditStatus(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status: {editStatus?.key}</DialogTitle>
            <DialogDescription>Update the display label, color, and order.</DialogDescription>
          </DialogHeader>
          {editStatus && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input value={editStatus.key} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-label">Display Label</Label>
                <Input id="edit-label" name="label" defaultValue={editStatus.label} required className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select name="color" defaultValue={editStatus.color}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => {
                      const config = getColorConfig(color)
                      return (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <span className={cn("h-3 w-3 rounded-full", config.swatch)} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input id="edit-sortOrder" name="sortOrder" type="number" defaultValue={editStatus.sortOrder} className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-isDefault" name="isDefault" defaultChecked={editStatus.isDefault} className="rounded" />
                <Label htmlFor="edit-isDefault">Default status for new orders</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Status: {deleteConfirm?.label}?</DialogTitle>
            <DialogDescription>
              This will permanently remove the &quot;{deleteConfirm?.label}&quot; status. This cannot be undone.
              Statuses in use by orders cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Table */}
      <div className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:from-slate-50 hover:to-indigo-50/30">
              <TableHead className="font-semibold text-slate-600 w-12">Order</TableHead>
              <TableHead className="font-semibold text-slate-600">Key</TableHead>
              <TableHead className="font-semibold text-slate-600">Label</TableHead>
              <TableHead className="font-semibold text-slate-600">Color</TableHead>
              <TableHead className="font-semibold text-slate-600">Default</TableHead>
              <TableHead className="font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No statuses configured. Add your first status to get started.
                </TableCell>
              </TableRow>
            ) : (
              statuses.map((status) => {
                const colorConfig = getColorConfig(status.color)
                return (
                  <TableRow key={status.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-mono">{status.sortOrder}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{status.key}</code>
                    </TableCell>
                    <TableCell className="font-medium">{status.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1.5", colorConfig.badge)}>
                        <span className={cn("h-2 w-2 rounded-full", colorConfig.dot)} />
                        <span className="capitalize">{status.color}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {status.isDefault && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditStatus(status)} className="hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(status)} className="hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
