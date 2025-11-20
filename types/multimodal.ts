// Tipos para processamento multimodal

// Transcrição de Áudio
export interface AudioTranscriptionOptions {
  language?: string; // ISO 639-1 code (pt, en, es, etc)
  prompt?: string; // Contexto para melhorar transcrição
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number; // 0-1
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

// Síntese de Voz
export interface VoiceSynthesisOptions {
  voice: string; // ID da voz
  modelId?: string;
  stability?: number; // 0-1
  similarityBoost?: number; // 0-1
  style?: number; // 0-1
  useSpeakerBoost?: boolean;
}

export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface Voice {
  voiceId: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  description?: string;
  previewUrl?: string;
  settings?: VoiceSettings;
}

// Análise de Imagem
export interface ImageAnalysisOptions {
  features?: Array<'description' | 'objects' | 'tags' | 'faces' | 'text' | 'quality'>;
  language?: string;
  maxCandidates?: number;
  modelVersion?: string;
}

export interface ImageObject {
  rectangle: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  object: string;
  confidence: number;
  parent?: {
    object: string;
    confidence: number;
  };
}

export interface ImageText {
  angle: number;
  boundingBox: number[];
  text: string;
  words: Array<{
    boundingBox: number[];
    text: string;
    confidence?: number;
  }>;
}

export interface ImageAnalysisResult {
  description?: {
    tags: string[];
    captions: Array<{
      text: string;
      confidence: number;
    }>;
  };
  objects?: ImageObject[];
  tags?: Array<{
    name: string;
    confidence: number;
  }>;
  text?: {
    language: string;
    orientation: string;
    regions: ImageText[];
  };
  metadata?: {
    width: number;
    height: number;
    format: string;
  };
  quality?: {
    score: number;
    issues?: string[];
  };
}

// OCR de Documentos
export interface DocumentOCROptions {
  language?: string[];
  pageNumbers?: number[];
  outputFormat?: 'text' | 'json' | 'pdf';
  detectOrientation?: boolean;
  detectTables?: boolean;
}

export interface DocumentPage {
  pageNumber: number;
  angle: number;
  width: number;
  height: number;
  unit: string;
  lines: DocumentLine[];
  tables?: DocumentTable[];
}

export interface DocumentLine {
  boundingBox: number[];
  text: string;
  words: DocumentWord[];
}

export interface DocumentWord {
  boundingBox: number[];
  text: string;
  confidence: number;
}

export interface DocumentTable {
  rows: number;
  columns: number;
  cells: DocumentTableCell[];
}

export interface DocumentTableCell {
  rowIndex: number;
  columnIndex: number;
  rowSpan: number;
  columnSpan: number;
  text: string;
  boundingBox: number[];
}

export interface DocumentOCRResult {
  pages: DocumentPage[];
  text: string;
  tables?: DocumentTable[];
  metadata?: {
    pageCount: number;
    language: string;
    orientation: string;
  };
}

// Tipos de Mídia
export type MediaType = 'audio' | 'image' | 'document' | 'video';

export interface MediaFile {
  id: string;
  type: MediaType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

// Configurações de API
export interface MultimodalConfig {
  openai: {
    apiKey: string;
    whisperModel?: string;
  };
  elevenLabs?: {
    apiKey: string;
    defaultVoice?: string;
  };
  azure?: {
    vision: {
      endpoint: string;
      apiKey: string;
    };
    speech?: {
      endpoint: string;
      apiKey: string;
      region: string;
    };
  };
}

// Erros
export class MultimodalError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MultimodalError';
  }
}

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const SUPPORTED_DOCUMENT_FORMATS = ['pdf', 'doc', 'docx', 'txt'];

export const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB