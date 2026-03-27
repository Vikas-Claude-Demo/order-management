"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, canCreateOrders, canChangeStatus, canAssignOrders } from "@/lib/auth-utils"

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be non-negative"),
  sortOrder: z.coerce.number().default(0),
  productId: z.string().optional(),
  productVariantId: z.string().optional(),
})

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().or(z.literal("")),
  customerPhone: z.string(),
  notes: z.string(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
})

export async function createOrder(formData: {
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes: string
  lineItems: { description: string; quantity: number; unitPrice: number; sortOrder: number; productId?: string; productVariantId?: string }[]
}) {
  const session = await requireAuth()
  if (!canCreateOrders(session.user.role)) throw new Error("Forbidden")

  const parsed = orderSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = parsed.data

  // Auto-link or create customer if no customerId provided
  let resolvedCustomerId = formData.customerId || null
  if (!resolvedCustomerId && data.customerName) {
    // Try to find existing customer by phone or email
    let existingCustomer = null
    if (data.customerPhone) {
      existingCustomer = await prisma.customer.findFirst({
        where: { phone: data.customerPhone, active: true },
      })
    }
    if (!existingCustomer && data.customerEmail) {
      existingCustomer = await prisma.customer.findFirst({
        where: { email: data.customerEmail, active: true },
      })
    }

    if (existingCustomer) {
      resolvedCustomerId = existingCustomer.id
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail || "",
          phone: data.customerPhone || "",
        },
      })
      resolvedCustomerId = newCustomer.id
    }
  }

  // Generate next order number
  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const nextNumber = (lastOrder?.orderNumber ?? 0) + 1

  const order = await prisma.order.create({
    data: {
      orderNumber: nextNumber,
      customerId: resolvedCustomerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      notes: data.notes,
      createdById: session.user.id,
      lineItems: {
        create: data.lineItems.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: i,
          productId: item.productId || null,
          productVariantId: item.productVariantId || null,
        })),
      },
    },
  })

  await prisma.activityLog.create({
    data: {
      orderId: order.id,
      userId: session.user.id,
      action: "ORDER_CREATED",
      details: `Order created for ${data.customerName}`,
    },
  })

  revalidatePath("/orders")
  revalidatePath("/dashboard")
  return { success: true, orderId: order.id }
}

export async function updateOrder(
  orderId: string,
  formData: {
    customerId?: string
    customerName: string
    customerEmail: string
    customerPhone: string
    notes: string
    lineItems: { id?: string; description: string; quantity: number; unitPrice: number; sortOrder: number; productId?: string; productVariantId?: string }[]
  }
) {
  const session = await requireAuth()
  if (!canCreateOrders(session.user.role)) throw new Error("Forbidden")

  const parsed = orderSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = parsed.data

  // Auto-link or create customer if no customerId provided
  let resolvedCustomerId = formData.customerId || null
  if (!resolvedCustomerId && data.customerName) {
    let existingCustomer = null
    if (data.customerPhone) {
      existingCustomer = await prisma.customer.findFirst({
        where: { phone: data.customerPhone, active: true },
      })
    }
    if (!existingCustomer && data.customerEmail) {
      existingCustomer = await prisma.customer.findFirst({
        where: { email: data.customerEmail, active: true },
      })
    }

    if (existingCustomer) {
      resolvedCustomerId = existingCustomer.id
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail || "",
          phone: data.customerPhone || "",
        },
      })
      resolvedCustomerId = newCustomer.id
    }
  }

  // Fetch old order + items for diff
  const oldOrder = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  })

  // Build change details
  const changes: string[] = []

  // Check order field changes
  if (oldOrder.customerName !== data.customerName) changes.push(`Customer name: "${oldOrder.customerName}" → "${data.customerName}"`)
  if ((oldOrder.customerEmail ?? "") !== data.customerEmail) changes.push(`Email: "${oldOrder.customerEmail ?? ""}" → "${data.customerEmail}"`)
  if ((oldOrder.customerPhone ?? "") !== data.customerPhone) changes.push(`Phone: "${oldOrder.customerPhone ?? ""}" → "${data.customerPhone}"`)
  if ((oldOrder.notes ?? "") !== data.notes) changes.push(`Notes updated`)

  // Diff line items
  const oldItems = oldOrder.lineItems
  const newItems = data.lineItems
  const oldById = new Map(oldItems.filter((i) => i.id).map((i) => [i.id, i]))

  const matchedOldIds = new Set<string>()
  for (const newItem of newItems) {
    if (newItem.id && oldById.has(newItem.id)) {
      const old = oldById.get(newItem.id)!
      matchedOldIds.add(newItem.id)
      const itemChanges: string[] = []
      if (old.description !== newItem.description) itemChanges.push(`description "${old.description}" → "${newItem.description}"`)
      if (old.quantity !== newItem.quantity) itemChanges.push(`qty ${old.quantity} → ${newItem.quantity}`)
      if (old.unitPrice !== newItem.unitPrice) itemChanges.push(`price ₹${old.unitPrice} → ₹${newItem.unitPrice}`)
      if (itemChanges.length > 0) changes.push(`Updated "${newItem.description}": ${itemChanges.join(", ")}`)
    } else {
      changes.push(`Added item "${newItem.description}" (qty: ${newItem.quantity}, ₹${newItem.unitPrice})`)
    }
  }
  for (const old of oldItems) {
    if (!matchedOldIds.has(old.id)) {
      changes.push(`Removed item "${old.description}"`)
    }
  }

  // Delete existing line items and recreate
  await prisma.lineItem.deleteMany({ where: { orderId } })

  await prisma.order.update({
    where: { id: orderId },
    data: {
      customerId: resolvedCustomerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      notes: data.notes,
      lineItems: {
        create: data.lineItems.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sortOrder: i,
          productId: item.productId || null,
          productVariantId: item.productVariantId || null,
        })),
      },
    },
  })

  const details = changes.length > 0 ? changes.join("\n") : "No changes detected"

  await prisma.activityLog.create({
    data: {
      orderId,
      userId: session.user.id,
      action: "ORDER_UPDATED",
      details,
    },
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changeOrderStatus(orderId: string, newStatus: string) {
  const session = await requireAuth()

  // Resolve the actual database user (session.user.id may differ from DB id in some auth configurations)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { username: session.user.email ?? "" },
      ],
    },
  })
  if (!user) throw new Error("User not found")

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } })
  if (!canChangeStatus(session.user.role, user.id, order.assigneeId)) {
    throw new Error("Forbidden")
  }

  const oldStatus = order.status

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    }),
    prisma.activityLog.create({
      data: {
        orderId,
        userId: user.id,
        action: "STATUS_CHANGED",
        details: `Status changed from ${oldStatus} to ${newStatus}`,
      },
    }),
  ])

  revalidatePath("/orders")
  revalidatePath("/orders/kanban")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function assignOrder(orderId: string, assigneeId: string | null) {
  const session = await requireAuth()
  if (!canAssignOrders(session.user.role)) throw new Error("Forbidden")

  const assignee = assigneeId
    ? await prisma.user.findUnique({ where: { id: assigneeId } })
    : null

  await prisma.order.update({
    where: { id: orderId },
    data: { assigneeId },
  })

  await prisma.activityLog.create({
    data: {
      orderId,
      userId: session.user.id,
      action: "ORDER_ASSIGNED",
      details: assignee ? `Assigned to ${assignee.name}` : "Unassigned",
    },
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function getOrders(filters?: { status?: string; assigneeId?: string; userId?: string; role?: string; from?: string; to?: string }) {
  const where: Record<string, unknown> = {}

  // Staff can only see assigned orders
  if (filters?.role === "STAFF" && filters.userId) {
    where.assigneeId = filters.userId
  }

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status
  }

  if (filters?.assigneeId && filters.assigneeId !== "ALL") {
    where.assigneeId = filters.assigneeId
  }

  // Date range filter
  if (filters?.from || filters?.to) {
    const createdAt: Record<string, Date> = {}
    if (filters.from) createdAt.gte = new Date(filters.from)
    if (filters.to) {
      const toDate = new Date(filters.to)
      toDate.setHours(23, 59, 59, 999)
      createdAt.lte = toDate
    }
    where.createdAt = createdAt
  }

  return prisma.order.findMany({
    where,
    include: {
      lineItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { select: { id: true, name: true } },
          productVariant: { select: { id: true, name: true } },
        },
      },
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
