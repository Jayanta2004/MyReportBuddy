export type FindingStatus = 'normal' | 'high' | 'low' | 'critical';

export interface KeyFinding {
  parameter: string;
  value: string;
  normal_range: string;
  status: FindingStatus;
  explanation: string;
}

export interface AnalysisResult {
  report_type: string;
  patient_name?: string | null;
  summary: string;
  key_findings: KeyFinding[];
  insights: string[];
  recommended_actions: string[];
  red_flags: string[];
  disclaimer: string;
}

export interface ReportRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processedAt?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analysisResult?: AnalysisResult;
  reportType?: string;
  errorMessage?: string;
}

export interface UploadResponse {
  success: boolean;
  reportId?: string;
  analysisResult?: AnalysisResult;
  error?: string;
}

export type FileType = 'pdf' | 'image';

export interface ProcessedFile {
  type: FileType;
  content: string; // base64 for images, extracted text for PDFs
  mimeType: string;
  fileName: string; // original file name, used to label content for the AI
}
