"use client"

import { Fragment, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Package, Search, X, Kanban, Plus, ChevronDown, ChevronRight, Boxes } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRangeFilter } from "@/components/date-range-filter"

interface OrderRow {
  id: string
  orderNumber: number
  status: string
  customerName: string
  createdAt: Date
  assignee: { id: string; name: string } | null
  createdBy: { id: string; name: string }
  lineItems: {
    quantity: number
    unitPrice: number
    description: string
    product: { id: string; name: string } | null
    productVariant: { id: string; name: string } | null
  }[]
}

interface StatusDef {
  key: string
  label: string
  color: string
  sortOrder: number
}

type GroupBy = "none" | "status" | "assignee"

function searchOrders(orders: OrderRow[], query: string): OrderRow[] {
  if (!query.trim()) return orders
  const q = query.toLowerCase()
  return orders.filter((order) => {
    if (String(order.orderNumber).includes(q)) return true
    if (order.customerName.toLowerCase().includes(q)) return true
    for (const item of order.lineItems) {
      if (item.product?.name.toLowerCase().includes(q)) return true
      if (item.productVariant?.name.toLowerCase().includes(q)) return true
      if (item.description.toLowerCase().includes(q)) return true
    }
    return false
  })
}

function ExpandableOrderRows({
  orders,
  expandedOrders,
  toggleExpand,
  hideStatus,
  hideAssignee,
  statuses,
}: {
  orders: OrderRow[]
  expandedOrders: Set<string>
  toggleExpand: (id: string) => void
  hideStatus?: boolean
  hideAssignee?: boolean
  statuses?: StatusDef[]
}) {
  return (
    <>
      {orders.map((order) => {
        const total = order.lineItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        )
        const isExpanded = expandedOrders.has(order.id)
        const hasItems = order.lineItems.length > 0

        return (
          <Fragment key={order.id}>
            <TableRow
              className={cn(
                "hover:bg-indigo-50/30 transition-colors",
                hasItems && "cursor-pointer",
                isExpanded && "bg-indigo-50/20",
              )}
              onClick={() => hasItems && toggleExpand(order.id)}
            >
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {hasItems ? (
                    <button type="button" className="p-0.5 -ml-1 rounded hover:bg-indigo-100 transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5" />
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="h-6 w-6 rounded-md bg-indigo-100 flex items-center justify-center text-[10px]">
                      #
                    </span>
                    {order.orderNumber}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="font-medium">{order.customerName}</TableCell>
              {!hideStatus && (
                <TableCell><StatusBadge status={order.status} statuses={statuses} /></TableCell>
              )}
              {!hideAssignee && (
                <TableCell>
                  {order.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {order.assignee.name.charAt(0)}
                      </div>
                      <span className="text-sm">{order.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Unassigned</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right font-bold text-emerald-600">₹{total.toFixed(2)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>

            {isExpanded && order.lineItems.map((item, idx) => (
              <TableRow key={`${order.id}-item-${idx}`} className="bg-slate-50/60 hover:bg-slate-100/60">
                <TableCell className="pl-12 py-2">
                  <span className="text-xs text-muted-foreground font-mono">{idx + 1}.</span>
                </TableCell>
                <TableCell colSpan={hideStatus && hideAssignee ? 1 : hideStatus || hideAssignee ? 2 : 3} className="py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-700">{item.description}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.product && (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5 font-medium">
                          <Boxes className="h-3 w-3" />
                          {item.product.name}
                        </span>
                      )}
                      {item.productVariant && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 rounded px-1.5 py-0.5 font-medium">
                          {item.productVariant.name}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} &times; ₹{item.unitPrice.toFixed(2)}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="py-2" />
              </TableRow>
            ))}
          </Fragment>
        )
      })}
    </>
  )
}

export function OrderListClient({
  orders,
  users,
  showAssigneeFilter,
  showCreate,
  currentStatus,
  currentAssignee,
  statuses,
}: {
  orders: OrderRow[]
  users: { id: string; name: string }[]
  showAssigneeFilter: boolean
  showCreate: boolean
  currentStatus?: string
  currentAssignee?: string
  statuses: StatusDef[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [groupBy, setGroupBy] = useState<GroupBy>("none")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/orders?${params.toString()}`)
  }

  function toggleGroup(group: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }

  function toggleExpand(orderId: string) {
    setExpandedOrders((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const filtered = useMemo(() => searchOrders(orders, search), [orders, search])

  const groups = useMemo(() => {
    if (groupBy === "none") return null

    const map = new Map<string, { label: string; orders: OrderRow[]; sortKey: number | string }>()

    for (const order of filtered) {
      let key: string
      let label: string
      let sortKey: number | string

      if (groupBy === "status") {
        key = order.status
        label = statuses.find((s) => s.key === order.status)?.label ?? order.status.replace("_", " ")
        sortKey = statuses.find((s) => s.key === order.status)?.sortOrder ?? 99
      } else {
        key = order.assignee?.id ?? "UNASSIGNED"
        label = order.assignee?.name ?? "Unassigned"
        sortKey = order.assignee?.name ?? "zzz"
      }

      if (!map.has(key)) {
        map.set(key, { label, orders: [], sortKey })
      }
      map.get(key)!.orders.push(order)
    }

    return [...map.entries()]
      .sort(([, a], [, b]) => {
        if (typeof a.sortKey === "number" && typeof b.sortKey === "number") return a.sortKey - b.sortKey
        return String(a.sortKey).localeCompare(String(b.sortKey))
      })
      .map(([key, value]) => ({ key, ...value }))
  }, [filtered, groupBy, statuses])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Orders
            </h2>
            <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/orders/kanban">
              <Kanban className="h-4 w-4 mr-1" /> Board View
            </Link>
          </Button>
          {showCreate && (
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 border-0">
              <Link href="/orders/new">
                <Plus className="h-4 w-4 mr-1" /> New Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search + Filters + Group By */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, order #, product, variant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={currentStatus ?? "ALL"} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
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

        <Select value={groupBy} onValueChange={(v) => { setGroupBy(v as GroupBy); setCollapsedGroups(new Set()) }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Grouping</SelectItem>
            <SelectItem value="status">Group by Status</SelectItem>
            <SelectItem value="assignee">Group by Assignee</SelectItem>
          </SelectContent>
        </Select>

        <DateRangeFilter />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-muted">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No orders found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search ? "Try adjusting your search." : "Try adjusting your filters."}
          </p>
        </div>
      ) : groupBy === "none" || !groups ? (
        <div className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:from-slate-50 hover:to-indigo-50/30">
                <TableHead className="font-semibold text-slate-600">Order #</TableHead>
                <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Assignee</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Total</TableHead>
                <TableHead className="font-semibold text-slate-600">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ExpandableOrderRows
                orders={filtered}
                expandedOrders={expandedOrders}
                toggleExpand={toggleExpand}
                statuses={statuses}
              />
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.key)
            const groupTotal = group.orders.reduce(
              (sum, order) => sum + order.lineItems.reduce((s, item) => s + item.quantity * item.unitPrice, 0),
              0
            )
            const hideStatus = groupBy === "status"
            const hideAssignee = groupBy === "assignee"

            return (
              <div key={group.key} className="rounded-xl border-0 shadow-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:from-slate-100 hover:to-indigo-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                    {groupBy === "status" ? (
                      <StatusBadge status={group.key} statuses={statuses} />
                    ) : (
                      <span className="font-semibold text-slate-700">{group.label}</span>
                    )}
                    <span className="text-xs font-medium text-muted-foreground bg-slate-100 rounded-full px-2 py-0.5">
                      {group.orders.length} {group.orders.length === 1 ? "order" : "orders"}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">₹{groupTotal.toFixed(2)}</span>
                </button>

                {!isCollapsed && (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-600">Order #</TableHead>
                        <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                        {!hideStatus && (
                          <TableHead className="font-semibold text-slate-600">Status</TableHead>
                        )}
                        {!hideAssignee && (
                          <TableHead className="font-semibold text-slate-600">Assignee</TableHead>
                        )}
                        <TableHead className="text-right font-semibold text-slate-600">Total</TableHead>
                        <TableHead className="font-semibold text-slate-600">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <ExpandableOrderRows
                        orders={group.orders}
                        expandedOrders={expandedOrders}
                        toggleExpand={toggleExpand}
                        hideStatus={hideStatus}
                        statuses={statuses}
                        hideAssignee={hideAssignee}
                      />
                    </TableBody>
                  </Table>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
