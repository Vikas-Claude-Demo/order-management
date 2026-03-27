import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getCustomers } from "@/actions/customers"
import { CustomersClient } from "./customers-client"

export default async function CustomersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const customers = await getCustomers()

  return <CustomersClient customers={customers} />
}
