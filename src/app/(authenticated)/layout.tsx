import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AuthLayoutClient } from "./layout-client"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await auth()
    if (!session?.user) redirect("/login")
    return <AuthLayoutClient>{children}</AuthLayoutClient>
  } catch (error: any) {
    console.error("Layout Session Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-rose-500">Authentication Error</h1>
          <p className="text-slate-400">
            There was a problem loading your session. This is usually caused by a missing <strong>AUTH_SECRET</strong> or <strong>DATABASE_URL</strong> in Vercel.
          </p>
          <p className="text-xs text-slate-500 font-mono bg-white/5 p-3 rounded">
            Error: {error?.message || "Internal Server Error"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
