type MessageBubbleProps = {
  role: "user" | "student";
  content: string;
  name?: string;
};

export function MessageBubble({ role, content, name }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-900 border border-slate-200"
        }`}
      >
        {!isUser && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {name ?? "Student"}
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
