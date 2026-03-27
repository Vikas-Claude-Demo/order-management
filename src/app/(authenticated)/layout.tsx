import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AuthLayoutClient } from "./layout-client"

import { AuthError } from "@/components/auth-error"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await auth()
    if (!session?.user) redirect("/login")
    return <AuthLayoutClient>{children}</AuthLayoutClient>
  } catch (error: any) {
    console.error("Layout Session Error:", error);
    return <AuthError message={error?.message || "Internal Server Error"} />
  }
}
