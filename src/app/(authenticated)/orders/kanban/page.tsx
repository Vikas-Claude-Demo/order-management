import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOrders } from "@/actions/orders"
import { getOrderStatuses } from "@/actions/statuses"
import { canCreateOrders } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Kanban, List } from "lucide-react"
import { KanbanBoard } from "./kanban-board"

export default async function KanbanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [orders, statuses] = await Promise.all([
    getOrders({
      userId: session.user.id,
      role: session.user.role,
    }),
    getOrderStatuses(),
  ])

  const showCreate = canCreateOrders(session.user.role)
  const canDrag = session.user.role === "ADMIN" || session.user.role === "MANAGER" || session.user.role === "STAFF"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Kanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Order Board
            </h2>
            <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">
              <List className="h-4 w-4 mr-1" /> List View
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

      <KanbanBoard orders={orders} canChangeStatuses={canDrag} statuses={statuses} />
    </div>
  )
}
