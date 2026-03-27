import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getOrder } from "@/actions/orders"
import { getAllCustomers } from "@/actions/customers"
import { getAllProductsForPicker } from "@/actions/products"
import { canCreateOrders } from "@/lib/auth-utils"
import { OrderForm } from "@/components/order-form"
import { Pencil } from "lucide-react"

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!canCreateOrders(session.user.role)) redirect("/orders")

  const { id } = await params
  const [order, customers, products] = await Promise.all([getOrder(id), getAllCustomers(), getAllProductsForPicker()])
  if (!order) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Pencil className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Edit Order #{order.orderNumber}
          </h2>
          <p className="text-muted-foreground text-sm">Modify order details and line items</p>
        </div>
      </div>
      <OrderForm
        orderId={order.id}
        customers={customers}
        products={products}
        initialData={{
          customerId: order.customerId ?? undefined,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          notes: order.notes,
          lineItems: order.lineItems.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            sortOrder: item.sortOrder,
          })),
        }}
      />
    </div>
  )
}
