import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getCustomer } from "@/actions/customers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Mail, Phone, Building2, MapPin, FileText, Package } from "lucide-react"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const customer = await getCustomer(id)
  if (!customer) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-teal-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {customer.name}
          </h2>
          {customer.company && <p className="text-muted-foreground text-sm">{customer.company}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <User className="h-5 w-5 text-teal-500" />
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {customer.email && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.company && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company</p>
                  <p className="text-sm font-semibold">{customer.company}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Address</p>
                  <p className="text-sm font-semibold">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</p>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Package className="h-5 w-5 text-indigo-500" />
                Orders ({customer.orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {customer.orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No orders from this customer yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customer.orders.map((order) => {
                    const total = order.lineItems.reduce(
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
                              {order.assignee?.name ?? "Unassigned"} &middot; {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={order.status} />
                          <span className="text-sm font-bold text-emerald-600">₹{total.toFixed(2)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
