export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 py-0.5" aria-label="AI is thinking">
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Thinking…</span>
    </div>
  );
}
