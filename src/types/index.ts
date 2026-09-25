export const SUPPORTED_LANGUAGES = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Malayalam',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface UserSession {
  userId: string;
  email: string;
  name?: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: SupportedLanguage;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage: string;
  success: boolean;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
