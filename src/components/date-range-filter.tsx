"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { CalendarDays, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DateRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("from")
    params.delete("to")
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilter = from || to

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Input
        type="date"
        value={from}
        onChange={(e) => update("from", e.target.value)}
        className="w-[150px] h-9 bg-white text-sm"
        aria-label="From date"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => update("to", e.target.value)}
        className="w-[150px] h-9 bg-white text-sm"
        aria-label="To date"
      />
      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clear}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
