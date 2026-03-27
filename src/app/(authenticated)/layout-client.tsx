"use client"

import { Sidebar, MobileNav } from "@/components/nav"

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Sidebar />
      <MobileNav />
      <main className="md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  )
}
