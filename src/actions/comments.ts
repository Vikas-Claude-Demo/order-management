"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, canAddComment } from "@/lib/auth-utils"

const commentSchema = z.object({
  orderId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty"),
})

export async function addComment(orderId: string, content: string) {
  const session = await requireAuth()

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } })
  if (!canAddComment(session.user.role, session.user.id, order.assigneeId)) {
    throw new Error("Forbidden")
  }

  const parsed = commentSchema.safeParse({ orderId, content })
  if (!parsed.success) return { error: "Invalid comment" }

  await prisma.comment.create({
    data: {
      orderId,
      userId: session.user.id,
      content: parsed.data.content,
    },
  })

  await prisma.activityLog.create({
    data: {
      orderId,
      userId: session.user.id,
      action: "COMMENT_ADDED",
      details: `Added a comment`,
    },
  })

  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}
