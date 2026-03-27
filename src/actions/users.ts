"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hashSync } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"

const createUserSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
})

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]),
  password: z.string().min(6).optional().or(z.literal("")),
})

export async function getUsers() {
  await requireRole("ADMIN")
  return prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })
}

export async function createUser(formData: {
  username: string
  name: string
  password: string
  role: string
}) {
  await requireRole("ADMIN")

  const parsed = createUserSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } })
  if (existing) return { error: { username: ["Username already exists"] } }

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      name: parsed.data.name,
      hashedPassword: hashSync(parsed.data.password, 10),
      role: parsed.data.role,
    },
  })

  revalidatePath("/users")
  return { success: true }
}

export async function updateUser(
  userId: string,
  formData: { name: string; role: string; password?: string }
) {
  await requireRole("ADMIN")

  const parsed = updateUserSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    role: parsed.data.role,
  }

  if (parsed.data.password && parsed.data.password.length >= 6) {
    data.hashedPassword = hashSync(parsed.data.password, 10)
  }

  await prisma.user.update({ where: { id: userId }, data })

  revalidatePath("/users")
  return { success: true }
}

export async function toggleUserActive(userId: string) {
  await requireRole("ADMIN")

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  await prisma.user.update({
    where: { id: userId },
    data: { active: !user.active },
  })

  revalidatePath("/users")
  return { success: true }
}
