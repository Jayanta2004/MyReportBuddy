import OpenAI, { toFile } from 'openai';
import { AnalysisResult, ProcessedFile } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a medical report analysis assistant. Analyze the provided medical report(s) and return a structured JSON response. Use plain, friendly language a non-medical person can understand. Be accurate, never diagnose, and always recommend consulting a doctor for medical decisions. Flag any values outside normal ranges and explain their potential implications.

If multiple reports are provided, analyze them together as a cohesive medical picture. Note connections and patterns across different reports where relevant, and reflect that in the report_type field (e.g. "Multiple Reports: CBC + Lipid Panel").

If the user has described symptoms, a medical concern, or specific questions, prioritize those in your insights and recommended_actions — tailor the analysis to their context.

IMPORTANT: Return ONLY valid JSON with no markdown code blocks or extra text. The JSON must match this exact structure:
{
  "report_type": "string (e.g., Blood Test, Lipid Profile, CBC, or 'Multiple Reports: X + Y')",
  "patient_name": "string | null (full name of the patient exactly as printed on the report — typically found in the header, e.g. 'Patient Name: John Doe'. Return null if not present.)",
  "summary": "string (2-3 sentence overview in plain language; mention if multiple reports were analyzed)",
  "key_findings": [
    {
      "parameter": "string (test name)",
      "value": "string (result with unit)",
      "normal_range": "string (reference range)",
      "status": "normal|high|low|critical",
      "explanation": "string (what this means in plain language)"
    }
  ],
  "insights": ["string array of bullet-point insights, personalized to user context if provided"],
  "recommended_actions": ["string array of lifestyle/dietary/follow-up suggestions"],
  "red_flags": ["string array of values needing urgent attention, or empty array if none"],
  "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice. Please consult a qualified healthcare professional for medical decisions."
}`;

export async function analyzeReport(
  files: ProcessedFile[],
  userContext?: string
): Promise<AnalysisResult> {
  // Build the content array for the user message
  const contentParts: OpenAI.Chat.ChatCompletionContentPart[] = [];

  // Track any files uploaded to OpenAI's Files API so we can delete them afterwards
  const uploadedFileIds: string[] = [];

  // Add user context / symptoms at the top if provided
  if (userContext && userContext.trim().length > 0) {
    contentParts.push({
      type: 'text',
      text: `USER'S MEDICAL CONCERN / SYMPTOMS:\n${userContext.trim()}\n\n---\n`,
    });
  }

  // Add intro for multiple files
  const fileLabel = files.length > 1
    ? `The user has uploaded ${files.length} medical reports. Analyze all of them together.\n\n`
    : '';

  if (fileLabel) {
    contentParts.push({ type: 'text', text: fileLabel });
  }

  // Add each file's content
  for (const file of files) {
    if (file.type === 'image') {
      // Label the file
      contentParts.push({
        type: 'text',
        text: files.length > 1 ? `--- Report: ${file.fileName} ---` : 'Medical Report:',
      });

      if (file.mimeType === 'application/pdf') {
        // PDF vision fallback — OpenAI's image_url does NOT accept application/pdf.
        // Instead, upload the PDF to the Files API and reference it by file_id.
        const pdfBuffer = Buffer.from(file.content, 'base64');
        const fileObj   = await toFile(pdfBuffer, file.fileName, { type: 'application/pdf' });
        const uploaded  = await openai.files.create({ file: fileObj, purpose: 'vision' });
        uploadedFileIds.push(uploaded.id);

        // Reference the uploaded file in the message content
        contentParts.push({
          type: 'file',
          file: { file_id: uploaded.id },
        } as unknown as OpenAI.Chat.ChatCompletionContentPart);
      } else {
        // Standard image (jpeg / png / webp) — use inline base64 data URL
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: `data:${file.mimeType};base64,${file.content}`,
            detail: 'high',
          },
        });
      }
    } else {
      // Text-extracted PDF
      const label = files.length > 1
        ? `--- Report: ${file.fileName} ---\n${file.content}`
        : `Medical Report Text:\n${file.content}`;
      contentParts.push({ type: 'text', text: label });
    }
  }

  contentParts.push({
    type: 'text',
    text: '\nPlease analyze the above and return the structured JSON analysis.',
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contentParts },
      ],
      max_tokens: 4096,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(content) as AnalysisResult;
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }
  } finally {
    // Always clean up any files we uploaded — fire-and-forget, never block the response
    for (const fileId of uploadedFileIds) {
      openai.files.del(fileId).catch(() => {});
    }
  }
}
