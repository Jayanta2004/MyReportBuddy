import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/lib/rate-limiter';
import { ChatRequest } from '@/types/chat';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BASE_SYSTEM_PROMPT = `You are MyReportBuddy Chat — a friendly, knowledgeable medical assistant specialising in helping people understand their lab reports and health data.

Your personality:
- Warm, clear, never condescending
- Use plain English; explain medical terms when you use them
- Organised: use bullet points or numbered steps when listing things
- Brief when a short answer suffices, detailed when depth is needed

Hard rules:
- NEVER provide a diagnosis or prescribe treatment
- ALWAYS recommend consulting a qualified doctor for medical decisions
- If the user seems to be in an emergency, immediately tell them to call emergency services
- Only discuss health, medical reports, wellness, and directly related topics; politely redirect anything else
- Do not fabricate normal ranges — use widely accepted reference ranges and note they can vary by lab and age/sex`;

const MAX_CONTEXT_CHARS = 8000; // hard cap on injected report text
const MAX_HISTORY = 20;          // keep last N messages to stay within token budget

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateCheck = await checkRateLimit(request);
  if (!rateCheck.allowed) {
    return new Response(
      `data: ${JSON.stringify({ error: `Rate limit exceeded. Wait ${Math.ceil((rateCheck.msBeforeNext ?? 60000) / 1000)}s.` })}\n\ndata: [DONE]\n\n`,
      { status: 429, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response('data: {"error":"Invalid JSON body"}\n\ndata: [DONE]\n\n', {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  const { messages = [], reportContext } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('data: {"error":"No messages provided"}\n\ndata: [DONE]\n\n', {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  // Build system prompt — inject report context if present
  let systemContent = BASE_SYSTEM_PROMPT;
  if (reportContext && reportContext.trim().length > 0) {
    const trimmed = reportContext.trim().slice(0, MAX_CONTEXT_CHARS);
    systemContent +=
      `\n\n---\nThe user has shared the following medical report as context for this conversation. Reference it when answering their questions.\n\nREPORT CONTEXT:\n${trimmed}\n---`;
  }

  // Sanitise and trim history
  const history = messages
    .slice(-MAX_HISTORY)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content).slice(0, 4000), // per-message cap
    }));

  // Stream the response
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o',
          stream: true,
          max_tokens: 1500,
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemContent },
            ...history,
          ],
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
            );
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  });
}
