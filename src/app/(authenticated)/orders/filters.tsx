"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusDef {
  key: string
  label: string
}

export function OrderFilters({
  currentStatus,
  currentAssignee,
  users,
  showAssigneeFilter,
  statuses,
}: {
  currentStatus?: string
  currentAssignee?: string
  users: { id: string; name: string }[]
  showAssigneeFilter: boolean
  statuses: StatusDef[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/orders?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={currentStatus ?? "ALL"} onValueChange={(v) => updateFilter("status", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s.key} value={s.key}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAssigneeFilter && (
        <Select value={currentAssignee ?? "ALL"} onValueChange={(v) => updateFilter("assignee", v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
