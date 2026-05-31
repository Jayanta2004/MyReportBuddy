export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number; // Unix ms
  isStreaming?: boolean; // true while the AI is mid-response
  error?: boolean;       // true if this message represents a failed stream
}

/** Extracted content from an uploaded file used as chat context */
export interface ReportContext {
  fileName: string;
  fileType: string;
  /** Extracted text (PDF) or a label like "[Image report attached]" */
  content: string;
}

/** Wire format sent to /api/chat */
export interface ChatRequest {
  messages: { role: MessageRole; content: string }[];
  reportContext?: string; // plain text block injected into the system prompt
}

/** Wire format sent to /api/chat/context */
// (multipart/form-data — no TS interface needed)

/** Response from /api/chat/context */
export interface ChatContextResponse {
  success: boolean;
  fileName: string;
  fileType: string;
  content: string;
  error?: string;
}
