import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUsers } from "@/actions/users"
import { UsersClient } from "./users-client"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await getUsers()

  return <UsersClient users={users} />
}
