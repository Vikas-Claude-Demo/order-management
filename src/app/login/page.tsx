"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Lock } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid username or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-3xl" />

      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-xl shadow-indigo-500/20 overflow-hidden border border-white/10">
            <Image 
              src="/logo.png" 
              alt="OrderFlow Logo" 
              width={64} 
              height={64} 
              priority
              className="object-cover"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            OrderFlow
          </CardTitle>
          <CardDescription className="text-slate-400">Sign in to manage your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="username"
                  name="username"
                  required
                  autoFocus
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
                  placeholder="Enter password"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 rounded-lg bg-white/5 border border-white/10 p-3">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { user: "admin", pass: "admin123", color: "from-rose-500 to-orange-500", role: "Admin" },
                { user: "manager", pass: "manager123", color: "from-amber-500 to-yellow-500", role: "Manager" },
                { user: "staff", pass: "staff123", color: "from-sky-500 to-cyan-500", role: "Staff" },
              ].map((demo) => (
                <button
                  key={demo.user}
                  type="button"
                  onClick={() => {
                    const form = document.querySelector("form") as HTMLFormElement
                    const usernameInput = form.querySelector("#username") as HTMLInputElement
                    const passwordInput = form.querySelector("#password") as HTMLInputElement
                    usernameInput.value = demo.user
                    passwordInput.value = demo.pass
                    // trigger React state
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
                    nativeInputValueSetter.call(usernameInput, demo.user)
                    usernameInput.dispatchEvent(new Event('input', { bubbles: true }))
                    nativeInputValueSetter.call(passwordInput, demo.pass)
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
                  }}
                  className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 hover:bg-white/10 transition-colors"
                >
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${demo.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {demo.role.charAt(0)}
                  </div>
                  <span className="text-[10px] text-slate-400">{demo.role}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
