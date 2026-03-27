"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { changeOrderStatus } from "@/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { GripVertical, User, Calendar, IndianRupee, Search, X, Boxes } from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorConfig } from "@/lib/status-colors"

interface Order {
  id: string
  orderNumber: number
  status: string
  customerName: string
  createdAt: Date
  assignee: { id: string; name: string } | null
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

export function KanbanBoard({ orders, canChangeStatuses, statuses }: { orders: Order[]; canChangeStatuses: boolean; statuses: StatusDef[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(new Set(statuses.map((s) => s.key)))
  const dragCounterRef = useRef<Record<string, number>>({})
  const didDragRef = useRef(false)

  const statusKeys = statuses.map((s) => s.key)

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders

    const q = searchQuery.toLowerCase()
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
  }, [orders, searchQuery])

  const grouped = useMemo(() => {
    return statusKeys.reduce((acc, key) => {
      acc[key] = filteredOrders.filter((o) => o.status === key)
      return acc
    }, {} as Record<string, Order[]>)
  }, [filteredOrders, statusKeys])

  function toggleStatus(status: string) {
    setVisibleStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        if (next.size > 1) next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  async function handleDrop(newStatus: string) {
    setDragOverColumn(null)
    dragCounterRef.current = {}

    if (!draggedOrderId || !canChangeStatuses) return

    const order = orders.find((o) => o.id === draggedOrderId)
    if (!order || order.status === newStatus) {
      setDraggedOrderId(null)
      return
    }

    setUpdatingOrderId(draggedOrderId)
    setDraggedOrderId(null)

    const statusDef = statuses.find((s) => s.key === newStatus)

    try {
      const result = await changeOrderStatus(draggedOrderId, newStatus)
      if (result.success) {
        toast({
          title: "Status updated",
          description: `Order #${order.orderNumber} moved to ${statusDef?.label ?? newStatus}`,
        })
        router.refresh()
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  function handleCardClick(orderId: string) {
    if (!didDragRef.current) {
      router.push(`/orders/${orderId}`)
    }
    didDragRef.current = false
  }

  const activeStatuses = statuses.filter((s) => visibleStatuses.has(s.key))

  return (
    <div className="space-y-4">
      {/* Search and Status Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, order #, product, variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground mr-1">Show:</span>
          {statuses.map((statusDef) => {
            const config = getColorConfig(statusDef.color)
            const isActive = visibleStatuses.has(statusDef.key)
            const count = (grouped[statusDef.key] ?? []).length
            return (
              <button
                key={statusDef.key}
                type="button"
                onClick={() => toggleStatus(statusDef.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                  isActive ? config.toggleActive : config.toggleBg,
                  !isActive && "opacity-60",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : config.dot)} />
                {statusDef.label}
                <span className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  isActive ? "bg-white/20" : "bg-black/5",
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-300px)]">
        {activeStatuses.map((statusDef) => {
          const config = getColorConfig(statusDef.color)
          const columnOrders = grouped[statusDef.key] ?? []
          const isOver = dragOverColumn === statusDef.key

          return (
            <div
              key={statusDef.key}
              className={cn(
                "flex-shrink-0 w-72 flex flex-col rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200",
                isOver && canChangeStatuses && "ring-2 ring-indigo-400 shadow-lg scale-[1.01]",
                isOver && canChangeStatuses && config.dropBg,
              )}
              onDragOver={(e) => {
                if (!canChangeStatuses) return
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                dragCounterRef.current[statusDef.key] = (dragCounterRef.current[statusDef.key] || 0) + 1
                setDragOverColumn(statusDef.key)
              }}
              onDragLeave={() => {
                dragCounterRef.current[statusDef.key] = (dragCounterRef.current[statusDef.key] || 0) - 1
                if (dragCounterRef.current[statusDef.key] <= 0) {
                  dragCounterRef.current[statusDef.key] = 0
                  setDragOverColumn(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(statusDef.key)
              }}
            >
              {/* Column Header */}
              <div className={cn("flex items-center justify-between px-4 py-3 rounded-t-xl", config.headerBg)}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full shadow-sm", config.dot)} />
                  <h3 className={cn("font-semibold text-sm", config.headerText)}>{statusDef.label}</h3>
                </div>
                <span className={cn("text-xs font-bold rounded-full px-2 py-0.5", config.countBg)}>
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                {columnOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground/50 text-sm">
                    {searchQuery ? "No matching orders" : "No orders"}
                  </div>
                )}
                {columnOrders.map((order) => {
                  const total = order.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPrice,
                    0
                  )
                  const isUpdating = updatingOrderId === order.id
                  const isDragging = draggedOrderId === order.id
                  const productNames = order.lineItems
                    .map((item) => item.product?.name)
                    .filter(Boolean)
                  const uniqueProducts = [...new Set(productNames)]

                  return (
                    <div
                      key={order.id}
                      draggable={canChangeStatuses && !isUpdating}
                      onClick={() => handleCardClick(order.id)}
                      onDragStart={(e) => {
                        didDragRef.current = false
                        setDraggedOrderId(order.id)
                        e.dataTransfer.effectAllowed = "move"
                        e.dataTransfer.setData("text/plain", order.id)
                      }}
                      onDrag={() => {
                        didDragRef.current = true
                      }}
                      onDragEnd={() => {
                        setDraggedOrderId(null)
                        setDragOverColumn(null)
                        dragCounterRef.current = {}
                      }}
                      className={cn(
                        "group rounded-lg border-l-4 border border-slate-200 p-2 bg-white transition-all duration-200 cursor-pointer",
                        config.accentBorder,
                        canChangeStatuses && !isUpdating && "active:cursor-grabbing",
                        "hover:shadow-md hover:-translate-y-0.5",
                        config.cardHoverBg,
                        isDragging && "opacity-40 scale-95",
                        isUpdating && "opacity-60 animate-pulse",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold shadow-sm flex-shrink-0">
                            #{order.orderNumber}
                          </span>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {order.customerName}
                          </p>
                        </div>
                        {canChangeStatuses && !isUpdating && (
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors flex-shrink-0" />
                        )}
                      </div>

                      {uniqueProducts.length > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <Boxes className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                          <p className="text-[11px] text-indigo-600/70 truncate font-medium">
                            {uniqueProducts.slice(0, 2).join(", ")}
                            {uniqueProducts.length > 2 && ` +${uniqueProducts.length - 2}`}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {order.assignee ? (
                            <>
                              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[7px] font-bold">
                                {order.assignee.name.charAt(0)}
                              </div>
                              <span className="truncate max-w-[70px] text-[11px] font-medium">{order.assignee.name}</span>
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 text-slate-300" />
                              <span className="italic text-slate-400 text-[11px]">Unassigned</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 rounded-md px-1.5 py-0.5 text-[11px]">
                          <IndianRupee className="h-2.5 w-2.5" />
                          {total.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/50">
                        <Calendar className="h-2.5 w-2.5" />
                        {(() => {
                          const diff = Date.now() - new Date(order.createdAt).getTime()
                          const days = Math.floor(diff / 86400000)
                          if (days === 0) return "Today"
                          if (days === 1) return "Yesterday"
                          if (days < 30) return `${days}d ago`
                          return new Date(order.createdAt).toLocaleDateString()
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
