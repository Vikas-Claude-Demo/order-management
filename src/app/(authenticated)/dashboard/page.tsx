import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Clock, CheckCircle2, UserCheck, TrendingUp, ArrowRight, Activity, Plus, RefreshCw, ArrowRightLeft, UserPlus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { DateRangeFilter } from "@/components/date-range-filter"

const actionConfig: Record<string, { label: string; icon: typeof Activity; color: string; bg: string }> = {
  ORDER_CREATED: { label: "Created order", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-100" },
  ORDER_UPDATED: { label: "Updated order", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100" },
  STATUS_CHANGED: { label: "Changed status", icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-100" },
  ORDER_ASSIGNED: { label: "Assigned order", icon: UserPlus, color: "text-violet-600", bg: "bg-violet-100" },
  COMMENT_ADDED: { label: "Added comment", icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-100" },
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams

  const isStaff = session.user.role === "STAFF"
  const baseWhere = isStaff ? { assigneeId: session.user.id } : {}

  // Build date filter
  const dateFilter: Record<string, Date> = {}
  if (params.from) dateFilter.gte = new Date(params.from)
  if (params.to) {
    const toDate = new Date(params.to)
    toDate.setHours(23, 59, 59, 999)
    dateFilter.lte = toDate
  }
  const whereClause = Object.keys(dateFilter).length > 0
    ? { ...baseWhere, createdAt: dateFilter }
    : baseWhere

  const [total, draft, inProgress, completed, cancelled, assignedToMe] =
    await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.count({ where: { ...whereClause, status: "DRAFT" } }),
      prisma.order.count({ where: { ...whereClause, status: "IN_PROGRESS" } }),
      prisma.order.count({ where: { ...whereClause, status: "COMPLETED" } }),
      prisma.order.count({ where: { ...whereClause, status: "CANCELLED" } }),
      prisma.order.count({ where: { ...baseWhere, assigneeId: session.user.id, ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}) } }),
    ])

  const [recentOrders, recentActivity] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      include: {
        assignee: { select: { name: true } },
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      where: {
        ...(isStaff ? { order: { assigneeId: session.user.id } } : {}),
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        order: { select: { id: true, orderNumber: true, customerName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ])

  const stats = [
    {
      label: "Total Orders",
      value: total,
      icon: Package,
      gradient: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/20",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Assigned to Me",
      value: assignedToMe,
      icon: UserCheck,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ]

  const statusBreakdown = [
    { label: "Draft", count: draft, color: "bg-slate-400", bar: "bg-slate-200" },
    { label: "In Progress", count: inProgress, color: "bg-amber-500", bar: "bg-amber-100" },
    { label: "Completed", count: completed, color: "bg-emerald-500", bar: "bg-emerald-100" },
    { label: "Cancelled", count: cancelled, color: "bg-rose-500", bar: "bg-rose-100" },
  ]

  const maxCount = Math.max(...statusBreakdown.map((s) => s.count), 1)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03]`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md ${stat.shadow}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold tabular-nums">{item.count}</span>
                  </div>
                  <div className={`h-2 rounded-full ${item.bar} overflow-hidden`}>
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              <CardTitle>Recent Orders</CardTitle>
            </div>
            <Link href="/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const orderTotal = order.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPrice,
                    0
                  )
                  return (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between rounded-xl border border-transparent bg-gradient-to-r from-slate-50 to-transparent p-3 hover:from-indigo-50 hover:to-purple-50/30 hover:border-indigo-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600">#{order.orderNumber}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.assignee?.name ?? "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="text-sm font-bold text-emerald-600">₹{orderTotal.toFixed(2)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-transparent" />
              <div className="space-y-4">
                {recentActivity.map((log) => {
                  const config = actionConfig[log.action] ?? {
                    label: log.action,
                    icon: Activity,
                    color: "text-slate-600",
                    bg: "bg-slate-100",
                  }
                  const Icon = config.icon
                  return (
                    <div key={log.id} className="flex gap-3 text-sm relative">
                      <div className={`h-[30px] w-[30px] rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-4 ring-white`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="pt-0.5 flex-1 min-w-0">
                        <p>
                          <span className="font-semibold">{log.user.name}</span>{" "}
                          <span className="text-muted-foreground">{config.label}</span>
                        </p>
                        <Link
                          href={`/orders/${log.order.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Order #{log.order.orderNumber} &middot; {log.order.customerName}
                        </Link>
                        {log.details && (
                          <div className="text-muted-foreground text-xs mt-0.5 space-y-0.5">
                            {log.details.split("\n").map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
