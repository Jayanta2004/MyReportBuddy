'use client';

import { useState } from 'react';
import { Bot, User, Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import MessageRenderer from './MessageRenderer';
import TypingIndicator from './TypingIndicator';

interface Props {
  message: ChatMessageType;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div
      className={cn('group flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
      aria-label={`${isUser ? 'You' : 'AI Health Assistant'}: ${message.content.slice(0, 80)}`}
    >
      {/* ── Sender meta row ─────────────────────────────────────── */}
      <div className={cn('flex items-center gap-1.5 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {isUser ? 'You' : 'AI Health Assistant'}
        </span>
        {message.createdAt && (
          <span className="text-[10px] text-slate-300 dark:text-slate-600 tabular-nums">
            · {formatTime(message.createdAt)}
          </span>
        )}
      </div>

      {/* ── Avatar + bubble ─────────────────────────────────────── */}
      <div
        className={cn(
          'flex gap-2.5',
          isUser ? 'flex-row-reverse items-end' : 'flex-row items-end',
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white shadow-sm',
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
              : 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-800',
          )}
          aria-hidden="true"
        >
          {isUser
            ? <User className="h-3.5 w-3.5" />
            : <Bot  className="h-3.5 w-3.5" />
          }
        </div>

        {/* Bubble */}
        <div
          className={cn(
            'relative max-w-[78%] sm:max-w-[72%] rounded-2xl px-4 py-3',
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-md shadow-indigo-200/50 dark:shadow-indigo-950/50'
              : message.error
              ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-bl-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm',
          )}
        >
          {/* Error */}
          {message.error && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
              <span>{message.content || 'Something went wrong. Please try again.'}</span>
            </div>
          )}

          {/* Typing dots */}
          {!message.error && message.isStreaming && !message.content && (
            <TypingIndicator />
          )}

          {/* Content */}
          {!message.error && message.content && (
            <>
              <MessageRenderer content={message.content} isUser={isUser} />
              {message.isStreaming && (
                <span
                  className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle opacity-70"
                  aria-hidden="true"
                />
              )}
            </>
          )}

          {/* Copy — appears on hover for completed AI messages */}
          {!isUser && !message.isStreaming && !message.error && message.content && (
            <button
              onClick={handleCopy}
              className={cn(
                'absolute -top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-150',
                'h-6 px-2 rounded-md flex items-center gap-1',
                'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm',
                'hover:bg-slate-50 dark:hover:bg-slate-600',
                'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
                'text-[10px] font-medium',
              )}
              aria-label="Copy response"
            >
              {copied
                ? <><Check className="h-3 w-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></>
                : <><Copy className="h-3 w-3" /><span>Copy</span></>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
