import React from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Lightweight markdown-like renderer — no external dependency required.
// Handles: **bold**, `code`, bullet lists (- / •), numbered lists, paragraphs.
// ---------------------------------------------------------------------------

type Token =
  | { type: 'bold'; text: string }
  | { type: 'code'; text: string }
  | { type: 'text'; text: string };

/** Tokenise a single line of text for inline formatting */
function tokeniseInline(raw: string): Token[] {
  const tokens: Token[] = [];
  // Matches **bold** or `code` spans
  const re = /(\*\*(.+?)\*\*|`([^`]+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', text: raw.slice(last, m.index) });
    if (m[0].startsWith('**')) {
      tokens.push({ type: 'bold', text: m[2] });
    } else {
      tokens.push({ type: 'code', text: m[3] });
    }
    last = m.index + m[0].length;
  }
  if (last < raw.length) tokens.push({ type: 'text', text: raw.slice(last) });
  return tokens;
}

function InlineTokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === 'bold') return <strong key={i}>{t.text}</strong>;
        if (t.type === 'code')
          return (
            <code
              key={i}
              className="bg-black/10 dark:bg-white/10 text-inherit rounded px-1 py-0.5 font-mono text-[0.8em]"
            >
              {t.text}
            </code>
          );
        return <React.Fragment key={i}>{t.text}</React.Fragment>;
      })}
    </>
  );
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'bullet'; items: string[] }
  | { type: 'ordered'; items: string[] };

/** Group raw lines into semantic blocks */
function buildBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bullet list
    if (/^[-•*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'bullet', items });
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ordered', items });
      continue;
    }

    // Paragraph — collect consecutive non-list lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      !/^[-•*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.some((l) => l.trim())) {
      blocks.push({ type: 'paragraph', lines: paraLines });
    }
  }

  return blocks;
}

interface Props {
  content: string;
  /** role affects colour styles */
  isUser: boolean;
}

export default function MessageRenderer({ content, isUser }: Props) {
  // Split on double newlines first, then process each chunk
  const chunks = content.split(/\n{2,}/);
  const allLines = chunks.flatMap((c, idx) =>
    idx < chunks.length - 1 ? [...c.split('\n'), '__PARA_BREAK__'] : c.split('\n')
  );

  // Rebuild lines, inserting paragraph separators
  const finalLines: string[] = [];
  for (const line of allLines) {
    finalLines.push(line);
  }

  const blocks = buildBlocks(finalLines.filter((l) => l !== '__PARA_BREAK__'));

  // Actually let's respect paragraph breaks properly — re-process with chunks
  const blockGroups: Block[][] = chunks.map((c) => buildBlocks(c.split('\n')));

  return (
    <div className={cn('space-y-2 text-sm leading-relaxed', isUser ? 'text-white' : 'text-foreground')}>
      {blockGroups.map((group, gi) => (
        <React.Fragment key={gi}>
          {group.map((block, bi) => {
            if (block.type === 'bullet') {
              return (
                <ul key={bi} className="list-none space-y-1 pl-1">
                  {block.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-2">
                      <span
                        className={cn(
                          'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0',
                          isUser ? 'bg-white/70' : 'bg-primary/60'
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        <InlineTokens tokens={tokeniseInline(item)} />
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === 'ordered') {
              return (
                <ol key={bi} className="list-none space-y-1 pl-1">
                  {block.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-2">
                      <span
                        className={cn(
                          'shrink-0 font-semibold tabular-nums',
                          isUser ? 'text-white/80' : 'text-primary'
                        )}
                      >
                        {ii + 1}.
                      </span>
                      <span>
                        <InlineTokens tokens={tokeniseInline(item)} />
                      </span>
                    </li>
                  ))}
                </ol>
              );
            }

            // Paragraph
            return (
              <p key={bi}>
                {block.lines.map((line, li) => (
                  <React.Fragment key={li}>
                    {li > 0 && line.trim() && <br />}
                    <InlineTokens tokens={tokeniseInline(line)} />
                  </React.Fragment>
                ))}
              </p>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
