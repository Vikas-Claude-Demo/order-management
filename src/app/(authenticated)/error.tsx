"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm max-w-md text-center">{error.message}</p>
      <Button
        onClick={reset}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0"
      >
        Try Again
      </Button>
    </div>
  )
}
