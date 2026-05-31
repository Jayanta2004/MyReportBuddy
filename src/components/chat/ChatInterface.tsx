'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Send,
  Paperclip,
  Trash2,
  X,
  FileText,
  Loader2,
  Square,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { ChatMessage as ChatMessageType, ReportContext } from '@/types/chat';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';

/* ── Helpers ──────────────────────────────────────────────────── */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MAX_INPUT_CHARS = 2000;

/* ════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ChatInterface() {
  const [messages, setMessages]     = useState<ChatMessageType[]>([]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  // Report context
  const [context, setContext]               = useState<ReportContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);

  // Scroll helpers
  const messagesEndRef      = useRef<HTMLDivElement>(null);
  const scrollContainerRef  = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // File input ref for context upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Abort controller for the current stream
  const abortRef = useRef<AbortController | null>(null);

  /* ── Scroll ─────────────────────────────────────────────────── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  /* ── Send message ───────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput('');

      const userMsg: ChatMessageType = {
        id:        genId(),
        role:      'user',
        content:   trimmed,
        createdAt: Date.now(),
      };

      const aiMsgId = genId();
      const aiPlaceholder: ChatMessageType = {
        id:          aiMsgId,
        role:        'assistant',
        content:     '',
        createdAt:   Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
      setIsLoading(true);
      setTimeout(() => scrollToBottom(true), 50);

      const history = [...messages, userMsg].map((m) => ({
        role:    m.role,
        content: m.content,
      }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          signal:  abortRef.current.signal,
          body: JSON.stringify({
            messages:      history,
            reportContext: context?.content ?? undefined,
          }),
        });

        if (!res.ok || !res.body) throw new Error(`Server error ${res.status}`);

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const parts = buf.split('\n\n');
          buf = parts.pop() ?? '';

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;
            const payload = part.slice(6);
            if (payload === '[DONE]') break;

            try {
              const parsed = JSON.parse(payload) as { content?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, content: m.content + parsed.content }
                      : m,
                  ),
                );
              }
            } catch (parseErr) {
              if ((parseErr as Error).message !== 'JSON parse') throw parseErr;
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m)),
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, isStreaming: false, content: m.content || '_(response stopped)_' }
                : m,
            ),
          );
          return;
        }
        const errorMsg = err instanceof Error ? err.message : 'Something went wrong.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, isStreaming: false, content: errorMsg, error: true }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, context, scrollToBottom],
  );

  /* ── Stop streaming ─────────────────────────────────────────── */
  const stopStreaming = () => abortRef.current?.abort();

  /* ── Context file upload ────────────────────────────────────── */
  const handleContextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setContextLoading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res  = await fetch('/api/chat/context', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load context');

      setContext({ fileName: data.fileName, fileType: data.fileType, content: data.content });
      toast({
        title:       'Report context loaded',
        description: `"${data.fileName}" is now attached to this conversation.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load context file.';
      toast({ title: 'Context upload failed', description: msg, variant: 'destructive' });
    } finally {
      setContextLoading(false);
    }
  };

  /* ── Keyboard ───────────────────────────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /* ── Clear ──────────────────────────────────────────────────── */
  const clearChat = () => {
    stopStreaming();
    setMessages([]);
    setInput('');
  };

  const isEmpty     = messages.length === 0;
  const msgCount    = messages.filter((m) => m.role === 'user').length;
  const charPct     = input.length / MAX_INPUT_CHARS;
  const charWarning = charPct > 0.9;
  const charCaution = charPct > 0.75;

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 gap-3">

        {/* Context badge / empty prompt */}
        <div className="flex items-center gap-2 min-w-0">
          {context ? (
            /* Attached report badge */
            <span className="flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full pl-2.5 pr-1.5 py-1 font-medium max-w-xs">
              <FileText className="h-3.5 w-3.5 shrink-0 text-indigo-500" aria-hidden="true" />
              <span className="truncate">{context.fileName}</span>
              <button
                onClick={() => setContext(null)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                aria-label="Remove report context"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ) : (
            /* No context hint */
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              No report attached
            </span>
          )}
        </div>

        {/* Right: message count + clear */}
        <div className="flex items-center gap-3 shrink-0">
          {!isEmpty && (
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums hidden sm:block">
              {msgCount} {msgCount === 1 ? 'message' : 'messages'}
            </span>
          )}
          {!isEmpty && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
              aria-label="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {isEmpty ? (
          <SuggestedPrompts onSelect={(p) => { setInput(p); sendMessage(p); }} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Scroll-to-bottom button ──────────────────────────────── */}
      {showScrollBtn && !isEmpty && (
        <div className="absolute bottom-[96px] left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom(true)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
              'shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 rounded-full px-3.5 py-1.5',
              'hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700',
              'hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200',
            )}
            aria-label="Scroll to latest message"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            Latest message
          </button>
        </div>
      )}

      {/* ── Input area ──────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-2">

          {/* Input box */}
          <div
            className={cn(
              'flex items-end gap-2 border rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 py-2',
              'transition-all duration-150',
              'focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 focus-within:bg-white dark:focus-within:bg-slate-800',
              'border-slate-200 dark:border-slate-700',
            )}
          >
            {/* Attach report */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleContextFileChange}
              className="hidden"
              aria-label="Upload report for context"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || contextLoading}
              className={cn(
                'p-1.5 rounded-xl shrink-0 mb-0.5 transition-colors',
                context
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
                (isLoading || contextLoading) && 'opacity-40 cursor-not-allowed',
              )}
              aria-label="Attach a report file as context"
              title="Attach report for context"
            >
              {contextLoading
                ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                : <Paperclip className="h-5 w-5" aria-hidden="true" />
              }
            </button>

            {/* Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="Ask about your report or any health question…"
              className={cn(
                'flex-1 resize-none bg-transparent text-sm leading-relaxed py-1',
                'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                'focus:outline-none max-h-36 overflow-y-auto',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              aria-label="Chat message input"
              aria-multiline="true"
            />

            {/* Send / Stop */}
            {isLoading ? (
              <button
                onClick={stopStreaming}
                className="shrink-0 mb-0.5 p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square className="h-5 w-5 fill-current" aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={cn(
                  'shrink-0 mb-0.5 p-1.5 rounded-xl transition-all duration-150',
                  input.trim()
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/60'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed',
                )}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Hint / character counter bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-0.5 select-none">
            <span>
              <kbd className="font-mono bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                Enter
              </kbd>{' '}
              send &bull;{' '}
              <kbd className="font-mono bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                Shift+Enter
              </kbd>{' '}
              new line
            </span>

            {/* Character counter — only visible when typing */}
            {input.length > 0 && (
              <span
                className={cn(
                  'tabular-nums transition-colors',
                  charWarning ? 'text-red-500 font-semibold'
                  : charCaution ? 'text-amber-500 font-medium'
                  : 'text-slate-300 dark:text-slate-600',
                )}
              >
                {input.length} / {MAX_INPUT_CHARS}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
