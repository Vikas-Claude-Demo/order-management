"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment } from "@/actions/comments"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string }
}

const avatarColors = [
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function CommentSection({
  orderId,
  comments,
  canComment,
}: {
  orderId: string
  comments: Comment[]
  canComment: boolean
}) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    try {
      const result = await addComment(orderId, content.trim())
      if (result.success) {
        setContent("")
        toast({ title: "Comment added" })
      }
    } catch {
      toast({ title: "Error adding comment", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
        </div>
        Comments
        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </h3>

      {canComment && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="flex-1 border-slate-200 focus-visible:ring-blue-500/50"
          />
          <Button
            type="submit"
            disabled={loading || !content.trim()}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-6 rounded-lg border-2 border-dashed border-muted">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const color = getAvatarColor(comment.user.name)
            return (
              <div key={comment.id} className="rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50/80 to-transparent p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm pl-8">{comment.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
