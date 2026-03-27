import { Activity, Plus, RefreshCw, ArrowRightLeft, UserPlus, MessageSquare } from "lucide-react"

interface LogEntry {
  id: string
  action: string
  details: string
  createdAt: Date
  user: { id: string; name: string }
}

const actionConfig: Record<string, { label: string; icon: typeof Activity; color: string; bg: string }> = {
  ORDER_CREATED: { label: "Created order", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-100" },
  ORDER_UPDATED: { label: "Updated order", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100" },
  STATUS_CHANGED: { label: "Changed status", icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-100" },
  ORDER_ASSIGNED: { label: "Assigned order", icon: UserPlus, color: "text-violet-600", bg: "bg-violet-100" },
  COMMENT_ADDED: { label: "Added comment", icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-100" },
}

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <Activity className="h-3.5 w-3.5 text-orange-600" />
        </div>
        Activity
        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {logs.length}
        </span>
      </h3>

      {logs.length === 0 ? (
        <div className="text-center py-6 rounded-lg border-2 border-dashed border-muted">
          <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No activity recorded.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-transparent" />
          <div className="space-y-4">
            {logs.map((log) => {
              const config = actionConfig[log.action] ?? {
                label: log.action,
                icon: Activity,
                color: "text-slate-600",
                bg: "bg-slate-100",
              }
              const Icon = config.icon
              return (
                <div key={log.id} className="flex gap-3 text-sm relative">
                  <div className={`h-[30px] w-[30px] rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-4 ring-white`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="pt-0.5">
                    <p>
                      <span className="font-semibold">{log.user.name}</span>{" "}
                      <span className="text-muted-foreground">{config.label}</span>
                    </p>
                    {log.details && (
                      <div className="text-muted-foreground text-xs mt-0.5 space-y-0.5">
                        {log.details.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
