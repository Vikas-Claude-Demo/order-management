"use client"

import { useState } from "react"
import { changeOrderStatus, assignOrder } from "@/actions/orders"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface StatusDef {
  key: string
  label: string
}

export function OrderDetailActions({
  orderId,
  currentStatus,
  currentAssigneeId,
  users,
  showStatusChange,
  showAssign,
  statuses,
}: {
  orderId: string
  currentStatus: string
  currentAssigneeId: string | null
  users: { id: string; name: string }[]
  showStatusChange: boolean
  showAssign: boolean
  statuses: StatusDef[]
}) {
  const { toast } = useToast()
  const [statusLoading, setStatusLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)

  async function handleStatusChange(status: string) {
    setStatusLoading(true)
    try {
      await changeOrderStatus(orderId, status)
      const statusDef = statuses.find((s) => s.key === status)
      toast({ title: `Status changed to ${statusDef?.label ?? status}` })
    } catch {
      toast({ title: "Error changing status", variant: "destructive" })
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleAssign(userId: string) {
    setAssignLoading(true)
    try {
      await assignOrder(orderId, userId === "UNASSIGNED" ? null : userId)
      toast({ title: "Assignment updated" })
    } catch {
      toast({ title: "Error assigning order", variant: "destructive" })
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {showStatusChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Change Status</label>
          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={statusLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showAssign && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign To</label>
          <Select
            value={currentAssigneeId ?? "UNASSIGNED"}
            onValueChange={handleAssign}
            disabled={assignLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
