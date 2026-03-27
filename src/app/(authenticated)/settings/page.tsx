import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOrderStatuses } from "@/actions/statuses"
import { StatusesClient } from "./statuses-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const statuses = await getOrderStatuses()

  return <StatusesClient statuses={statuses} />
}
