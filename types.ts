export enum ArtStyle {
  PHOTOREALISTIC = 'Photorealistic',
  MINIMALIST = 'Minimalist',
  ILLUSTRATION = 'Flat Illustration',
  ABSTRACT = 'Abstract Art',
  CYBERPUNK = 'Cyberpunk/Tech',
  TRADITIONAL_CHINESE = 'Traditional Chinese Ink',
  BUSINESS = 'Corporate Business'
}

export interface GeneratedData {
  imageUrl: string;
  imagePrompt: string;
  suggestedTitle: string;
  summary: string;
}

export interface GenerationState {
  isLoading: boolean;
  step: 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';
  error: string | null;
}
