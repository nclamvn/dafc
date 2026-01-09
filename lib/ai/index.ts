// AI Module Exports
export * from './openai';
export * from './prompts';
export * from './processors';
export * from './tools';
export * from './hooks';

// AI Configuration
export const AI_CONFIG = {
  model: 'gpt-4o',
  maxTokens: 4096,
  temperature: 0.7,
  maxSteps: 5,
  supportedLanguages: ['en', 'vi'] as const,
  defaultLanguage: 'en' as const,
};

// Type exports
export type SupportedLanguage = (typeof AI_CONFIG.supportedLanguages)[number];
