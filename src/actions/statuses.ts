"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"

const statusSchema = z.object({
  key: z.string().min(1, "Key is required").regex(/^[A-Z][A-Z0-9_]*$/, "Key must be uppercase with underscores (e.g. IN_REVIEW)"),
  label: z.string().min(1, "Label is required"),
  color: z.string().min(1, "Color is required"),
  sortOrder: z.coerce.number().int().default(0),
  isDefault: z.boolean().default(false),
})

export async function getOrderStatuses() {
  return prisma.orderStatus.findMany({
    orderBy: { sortOrder: "asc" },
  })
}

export async function createStatus(formData: {
  key: string
  label: string
  color: string
  sortOrder: number
  isDefault: boolean
}) {
  await requireRole("ADMIN")

  const parsed = statusSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const existing = await prisma.orderStatus.findUnique({ where: { key: parsed.data.key } })
  if (existing) return { error: { key: ["Status key already exists"] } }

  // If setting as default, unset other defaults
  if (parsed.data.isDefault) {
    await prisma.orderStatus.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }

  await prisma.orderStatus.create({ data: parsed.data })

  revalidatePath("/settings")
  revalidatePath("/orders")
  revalidatePath("/orders/kanban")
  return { success: true }
}

export async function updateStatus(
  id: string,
  formData: { label: string; color: string; sortOrder: number; isDefault: boolean }
) {
  await requireRole("ADMIN")

  const parsed = z.object({
    label: z.string().min(1, "Label is required"),
    color: z.string().min(1, "Color is required"),
    sortOrder: z.coerce.number().int(),
    isDefault: z.boolean(),
  }).safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  if (parsed.data.isDefault) {
    await prisma.orderStatus.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }

  await prisma.orderStatus.update({ where: { id }, data: parsed.data })

  revalidatePath("/settings")
  revalidatePath("/orders")
  revalidatePath("/orders/kanban")
  return { success: true }
}

export async function deleteStatus(id: string) {
  await requireRole("ADMIN")

  const status = await prisma.orderStatus.findUniqueOrThrow({ where: { id } })

  // Check if any orders are using this status
  const ordersCount = await prisma.order.count({ where: { status: status.key } })
  if (ordersCount > 0) {
    return { error: `Cannot delete: ${ordersCount} order(s) are using this status.` }
  }

  await prisma.orderStatus.delete({ where: { id } })

  revalidatePath("/settings")
  revalidatePath("/orders")
  revalidatePath("/orders/kanban")
  return { success: true }
}
