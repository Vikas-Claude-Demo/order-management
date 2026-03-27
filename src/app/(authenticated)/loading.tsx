export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="h-3 w-3 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="h-3 w-3 rounded-full bg-fuchsia-500 animate-bounce" />
      </div>
    </div>
  )
}
