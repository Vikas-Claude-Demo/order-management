"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, Package, Users, Users2, Boxes, LogOut, Menu, Sparkles, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "STAFF"] },
  { href: "/orders", label: "Orders", icon: Package, roles: ["ADMIN", "MANAGER", "STAFF"] },
  { href: "/customers", label: "Customers", icon: Users2, roles: ["ADMIN", "MANAGER", "STAFF"] },
  { href: "/products", label: "Products", icon: Boxes, roles: ["ADMIN", "MANAGER", "STAFF"] },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
]

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  MANAGER: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  STAFF: "bg-sky-500/20 text-sky-300 border-sky-500/30",
}

function NavLinks({ role, onClick }: { role: string; onClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1.5">
      {navItems
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
    </nav>
  )
}

export function Sidebar() {
  const { data: session } = useSession()
  if (!session?.user) return null

  const roleColor = roleBadgeColors[session.user.role] ?? roleBadgeColors.STAFF

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-r border-white/10">
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">OrderFlow</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold", roleColor)}>
                {session.user.role}
              </span>
            </div>
          </div>
        </div>
        <NavLinks role={session.user.role} />
        <div className="mt-auto pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MobileNav() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  if (!session?.user) return null

  const roleColor = roleBadgeColors[session.user.role] ?? roleBadgeColors.STAFF

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-slate-900 to-indigo-950">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white">OrderFlow</h1>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-slate-900 border-white/10 text-white">
          <SheetTitle className="text-white">Navigation</SheetTitle>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{session.user.name}</p>
                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-semibold", roleColor)}>
                  {session.user.role}
                </span>
              </div>
            </div>
            <NavLinks role={session.user.role} onClick={() => setOpen(false)} />
            <Button
              variant="ghost"
              className="justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
