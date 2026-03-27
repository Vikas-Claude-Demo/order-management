"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, canCreateOrders } from "@/lib/auth-utils"

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().or(z.literal("")),
  phone: z.string(),
  company: z.string(),
  address: z.string(),
  notes: z.string(),
})

export async function getCustomers() {
  return prisma.customer.findMany({
    where: { active: true },
    include: { _count: { select: { orders: true } } },
    orderBy: { name: "asc" },
  })
}

export async function getAllCustomers() {
  return prisma.customer.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, phone: true, company: true },
    orderBy: { name: "asc" },
  })
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          lineItems: true,
          assignee: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function createCustomer(formData: {
  name: string
  email: string
  phone: string
  company: string
  address: string
  notes: string
}) {
  await requireAuth()

  const parsed = customerSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const customer = await prisma.customer.create({ data: parsed.data })

  revalidatePath("/customers")
  return { success: true, customerId: customer.id }
}

export async function updateCustomer(
  id: string,
  formData: {
    name: string
    email: string
    phone: string
    company: string
    address: string
    notes: string
  }
) {
  await requireAuth()

  const parsed = customerSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  await prisma.customer.update({ where: { id }, data: parsed.data })

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function toggleCustomerActive(id: string) {
  await requireAuth()
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id } })
  await prisma.customer.update({
    where: { id },
    data: { active: !customer.active },
  })
  revalidatePath("/customers")
  return { success: true }
}
