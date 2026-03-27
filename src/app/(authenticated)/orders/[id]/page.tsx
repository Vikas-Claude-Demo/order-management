import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getOrder } from "@/actions/orders"
import { getAllUsers } from "@/actions/users"
import { canCreateOrders, canChangeStatus, canAddComment, canAssignOrders } from "@/lib/auth-utils"
import { getOrderStatuses } from "@/actions/statuses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil, User, Mail, Phone, FileText, ShoppingCart, ArrowLeft } from "lucide-react"
import { CommentSection } from "@/components/comment-section"
import { ActivityLog } from "@/components/activity-log"
import { OrderDetailActions } from "./actions"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  if (session.user.role === "STAFF" && order.assigneeId !== session.user.id) {
    redirect("/orders")
  }

  const [users, statuses] = await Promise.all([getAllUsers(), getOrderStatuses()])
  const orderTotal = order.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const showEdit = canCreateOrders(session.user.role)
  const showStatusChange = canChangeStatus(session.user.role, session.user.id, order.assigneeId)
  const showAssign = canAssignOrders(session.user.role)
  const showComment = canAddComment(session.user.role, session.user.id, order.assigneeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Order #{order.orderNumber}
              </h2>
              <StatusBadge status={order.status} statuses={statuses} />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Created by {order.createdBy.name} on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {showEdit && (
            <Button variant="outline" asChild className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Link href={`/orders/${order.id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <User className="h-5 w-5 text-blue-500" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</p>
                    <p className="text-sm font-semibold">{order.customerName}</p>
                  </div>
                </div>
                {order.customerEmail && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold">{order.customerEmail}</p>
                    </div>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-semibold">{order.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{order.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 font-semibold text-slate-600">Description</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Qty</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Unit Price</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-slate-600">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lineItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-purple-50/30">
                      <TableCell className="pl-6 font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right pr-6 font-semibold">
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t">
                <div className="text-right">
                  <span className="text-sm text-emerald-600 font-medium">Order Total</span>
                  <p className="text-2xl font-bold text-emerald-700">₹{orderTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <CommentSection
                orderId={order.id}
                comments={order.comments}
                canComment={showComment}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b">
              <CardTitle className="text-indigo-900">Status & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</span>
                <div className="mt-2">
                  <StatusBadge status={order.status} statuses={statuses} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned to</span>
                <div className="mt-2">
                  {order.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {order.assignee.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold">{order.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              <Separator />
              <OrderDetailActions
                orderId={order.id}
                currentStatus={order.status}
                currentAssigneeId={order.assigneeId}
                users={users}
                showStatusChange={showStatusChange}
                showAssign={showAssign}
                statuses={statuses}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <ActivityLog logs={order.activityLogs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
