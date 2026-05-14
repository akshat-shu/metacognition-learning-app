'use client';

type Props = {
  role: 'user' | 'student';
  content: string;
  tag?: string;
};

export default function MessageBubble({ role, content, tag }: Props) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-gray-200 text-gray-900 rounded-bl-md'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {tag && !isUser && (
          <p className="text-xs mt-1 opacity-60 italic">{tag}</p>
        )}
      </div>
    </div>
  );
}
