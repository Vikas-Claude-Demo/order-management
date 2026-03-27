"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { createUser, updateUser, toggleUserActive } from "@/actions/users"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, UserX, UserCheck, Users, Shield, Crown, User } from "lucide-react"

interface UserRow {
  id: string
  username: string
  name: string
  role: string
  active: boolean
  createdAt: Date
}

const roleBadgeConfig: Record<string, { className: string; icon: typeof Shield }> = {
  ADMIN: { className: "bg-rose-50 text-rose-700 border-rose-200", icon: Crown },
  MANAGER: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: Shield },
  STAFF: { className: "bg-sky-50 text-sky-700 border-sky-200", icon: User },
}

const avatarGradients: Record<string, string> = {
  ADMIN: "from-rose-400 to-pink-500",
  MANAGER: "from-amber-400 to-orange-500",
  STAFF: "from-sky-400 to-blue-500",
}

export function UsersClient({ users }: { users: UserRow[] }) {
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRow | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await createUser({
      username: fd.get("username") as string,
      name: fd.get("name") as string,
      password: fd.get("password") as string,
      role: fd.get("role") as string,
    })
    if (result.success) {
      setCreateOpen(false)
      toast({ title: "User created" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editUser) return
    const fd = new FormData(e.currentTarget)
    const password = fd.get("password") as string
    const result = await updateUser(editUser.id, {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      password: password || undefined,
    })
    if (result.success) {
      setEditUser(null)
      toast({ title: "User updated" })
    } else {
      const errors = result.error as Record<string, string[]>
      const msg = Object.values(errors).flat().join(", ")
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  async function handleToggleActive(userId: string) {
    await toggleUserActive(userId)
    toast({ title: "User status updated" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Users
            </h2>
            <p className="text-muted-foreground text-sm">{users.length} team members</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 border-0">
              <Plus className="h-4 w-4 mr-1" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new team member to the system.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Username</Label>
                <Input id="create-username" name="username" required className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">Full Name</Label>
                <Input id="create-name" name="name" required className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input id="create-password" name="password" type="password" required minLength={6} className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Role</Label>
                <Select name="role" defaultValue="STAFF">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editUser?.username}</DialogTitle>
            <DialogDescription>Update user details and role.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" defaultValue={editUser.name} required className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep)</Label>
                <Input id="edit-password" name="password" type="password" className="border-slate-200 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editUser.role}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:from-slate-50 hover:to-indigo-50/30">
              <TableHead className="font-semibold text-slate-600">User</TableHead>
              <TableHead className="font-semibold text-slate-600">Role</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const roleConfig = roleBadgeConfig[user.role] ?? roleBadgeConfig.STAFF
              const gradient = avatarGradients[user.role] ?? avatarGradients.STAFF
              const RoleIcon = roleConfig.icon
              return (
                <TableRow key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${roleConfig.className}`}>
                      <RoleIcon className="h-3 w-3" />
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditUser(user)} className="hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(user.id)} className={user.active ? "hover:bg-rose-50 hover:text-rose-600 rounded-lg" : "hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"}>
                        {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
