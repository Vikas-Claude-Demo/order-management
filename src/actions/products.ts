"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

const variantSchema = z.object({
  name: z.string().min(1, "Variant name required"),
  sku: z.string().min(1, "Variant SKU required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  sortOrder: z.coerce.number().default(0),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string(),
  sku: z.string().min(1, "SKU is required"),
  category: z.string(),
  basePrice: z.coerce.number().min(0, "Price must be non-negative"),
  hasVariants: z.boolean(),
  variants: z.array(variantSchema),
})

export async function getProducts() {
  await requireAuth()
  return prisma.product.findMany({
    where: { active: true },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { lineItems: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllProductsForPicker() {
  await requireAuth()
  return prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      basePrice: true,
      hasVariants: true,
      variants: {
        where: { active: true },
        select: { id: true, name: true, sku: true, price: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function createProduct(formData: {
  name: string
  description: string
  sku: string
  category: string
  basePrice: number
  hasVariants: boolean
  variants: { name: string; sku: string; price: number; sortOrder: number }[]
}) {
  await requireAuth()

  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = parsed.data

  await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      sku: data.sku,
      category: data.category,
      basePrice: data.basePrice,
      hasVariants: data.hasVariants,
      variants: data.hasVariants
        ? {
            create: data.variants.map((v, i) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              sortOrder: i,
            })),
          }
        : undefined,
    },
  })

  revalidatePath("/products")
  return { success: true }
}

export async function updateProduct(
  id: string,
  formData: {
    name: string
    description: string
    sku: string
    category: string
    basePrice: number
    hasVariants: boolean
    variants: { name: string; sku: string; price: number; sortOrder: number }[]
  }
) {
  await requireAuth()

  const parsed = productSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = parsed.data

  // Delete existing variants and recreate
  await prisma.productVariant.deleteMany({ where: { productId: id } })

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      sku: data.sku,
      category: data.category,
      basePrice: data.basePrice,
      hasVariants: data.hasVariants,
      variants: data.hasVariants
        ? {
            create: data.variants.map((v, i) => ({
              name: v.name,
              sku: v.sku,
              price: v.price,
              sortOrder: i,
            })),
          }
        : undefined,
    },
  })

  revalidatePath("/products")
  return { success: true }
}

export async function toggleProductActive(id: string) {
  await requireAuth()

  const product = await prisma.product.findUniqueOrThrow({ where: { id } })
  await prisma.product.update({
    where: { id },
    data: { active: !product.active },
  })

  revalidatePath("/products")
  return { success: true }
}
