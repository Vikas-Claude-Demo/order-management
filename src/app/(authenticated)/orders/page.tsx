import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOrders } from "@/actions/orders"
import { getOrderStatuses } from "@/actions/statuses"
import { getAllUsers } from "@/actions/users"
import { canCreateOrders } from "@/lib/auth-utils"
import { OrderListClient } from "@/components/order-list-client"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; assignee?: string; from?: string; to?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const [orders, users, statuses] = await Promise.all([
    getOrders({
      status: params.status,
      assigneeId: params.assignee,
      userId: session.user.id,
      role: session.user.role,
      from: params.from,
      to: params.to,
    }),
    getAllUsers(),
    getOrderStatuses(),
  ])

  const showCreate = canCreateOrders(session.user.role)

  return (
    <OrderListClient
      orders={orders}
      users={users}
      showAssigneeFilter={session.user.role !== "STAFF"}
      showCreate={showCreate}
      currentStatus={params.status}
      currentAssignee={params.assignee}
      statuses={statuses}
    />
  )
}
