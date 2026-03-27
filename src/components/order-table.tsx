"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { Package } from "lucide-react"

interface OrderRow {
  id: string
  orderNumber: number
  status: string
  customerName: string
  createdAt: Date
  assignee: { id: string; name: string } | null
  createdBy: { id: string; name: string }
  lineItems: { quantity: number; unitPrice: number }[]
}

export function OrderTable({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border-2 border-dashed border-muted">
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No orders found</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
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
          {orders.map((order) => {
            const total = order.lineItems.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0
            )
            return (
              <TableRow key={order.id} className="hover:bg-indigo-50/30 transition-colors">
                <TableCell>
                  <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800">
                    <span className="h-6 w-6 rounded-md bg-indigo-100 flex items-center justify-center text-[10px]">
                      #
                    </span>
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{order.customerName}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
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
                <TableCell className="text-right font-bold text-emerald-600">₹{total.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
