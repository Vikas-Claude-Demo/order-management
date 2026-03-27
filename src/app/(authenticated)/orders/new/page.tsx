import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { canCreateOrders } from "@/lib/auth-utils"
import { getAllCustomers } from "@/actions/customers"
import { getAllProductsForPicker } from "@/actions/products"
import { OrderForm } from "@/components/order-form"
import { ShoppingCart } from "lucide-react"

export default async function NewOrderPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!canCreateOrders(session.user.role)) redirect("/orders")

  const [customers, products] = await Promise.all([getAllCustomers(), getAllProductsForPicker()])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">New Order</h2>
          <p className="text-muted-foreground text-sm">Create a new order with line items</p>
        </div>
      </div>
      <OrderForm customers={customers} products={products} />
    </div>
  )
}
