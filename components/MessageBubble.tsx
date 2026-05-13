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
        className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm ${isUser
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          : "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-900 border border-slate-200"
          }`}
      >
        {!isUser && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {name ?? "Student"}
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
