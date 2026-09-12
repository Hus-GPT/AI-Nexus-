import { AIModel, ProviderId } from '../../types';

export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  badgeColor: string;
  website: string;
  docsUrl: string;
  requiresApiKey: boolean;
  supportsCustomEndpoint: boolean;
  defaultBaseUrl?: string;
  authHeaderFormat: string; // e.g., 'Bearer {KEY}' or 'x-api-key: {KEY}'
  iconSvgName: string;
  description: string;
}

export const PROVIDER_CATALOG: Record<ProviderId, ProviderMetadata> = {
  google_gemini: {
    id: 'google_gemini',
    name: 'Google Gemini',
    badgeColor: 'blue',
    website: 'https://ai.google.dev',
    docsUrl: 'https://ai.google.dev/docs',
    requiresApiKey: true,
    supportsCustomEndpoint: false,
    authHeaderFormat: 'x-goog-api-key: {KEY}',
    iconSvgName: 'gemini',
    description: 'Multimodal foundation models with broad context windows, reasoning, and real-time capabilities.',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    badgeColor: 'emerald',
    website: 'https://openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    requiresApiKey: true,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'https://api.openai.com/v1',
    authHeaderFormat: 'Bearer {KEY}',
    iconSvgName: 'openai',
    description: 'GPT-4o, o1, and o3 reasoning series with wide ecosystem tool support.',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    badgeColor: 'amber',
    website: 'https://anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    requiresApiKey: true,
    supportsCustomEndpoint: false,
    authHeaderFormat: 'x-api-key: {KEY}',
    iconSvgName: 'anthropic',
    description: 'Claude 3.5 Sonnet, Haiku, and Opus known for nuanced writing and code craftsmanship.',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    badgeColor: 'cyan',
    website: 'https://deepseek.com',
    docsUrl: 'https://platform.deepseek.com',
    requiresApiKey: true,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    authHeaderFormat: 'Bearer {KEY}',
    iconSvgName: 'deepseek',
    description: 'DeepSeek-V3 and DeepSeek-R1 reasoning models with transparent chain-of-thought.',
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    badgeColor: 'violet',
    website: 'https://x.ai',
    docsUrl: 'https://docs.x.ai',
    requiresApiKey: true,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'https://api.x.ai/v1',
    authHeaderFormat: 'Bearer {KEY}',
    iconSvgName: 'xai',
    description: 'Grok 2 and Grok 3 models with real-time knowledge synthesis capabilities.',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    badgeColor: 'stone',
    website: 'https://ollama.com',
    docsUrl: 'https://github.com/ollama/ollama',
    requiresApiKey: false,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'http://localhost:11434',
    authHeaderFormat: 'None',
    iconSvgName: 'ollama',
    description: 'Local on-device models (Llama 3, Mistral, Qwen) for 100% private offline computation.',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    badgeColor: 'purple',
    website: 'https://openrouter.ai',
    docsUrl: 'https://openrouter.ai/docs',
    requiresApiKey: true,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    authHeaderFormat: 'Bearer {KEY}',
    iconSvgName: 'openrouter',
    description: 'Unified gateway routing to hundreds of open-source and proprietary models.',
  },
  custom_openai_compatible: {
    id: 'custom_openai_compatible',
    name: 'Custom OpenAI-Compatible',
    badgeColor: 'slate',
    website: '',
    docsUrl: '',
    requiresApiKey: false,
    supportsCustomEndpoint: true,
    defaultBaseUrl: 'https://api.example.com/v1',
    authHeaderFormat: 'Bearer {KEY}',
    iconSvgName: 'custom',
    description: 'Self-hosted vLLM, LM Studio, or custom inference proxy adhering to the OpenAI specification.',
  },
};

export const INITIAL_MODEL_REGISTRY: AIModel[] = [
  // Google Gemini (Default provider as specified in requirements)
  {
    id: 'gemini-2.5-flash',
    providerId: 'google_gemini',
    name: 'Gemini 2.5 Flash',
    description: 'Default high-efficiency multimodal model with 1M token context window.',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    capabilities: ['text', 'chat', 'vision', 'tool_calling', 'streaming'],
    isDefault: true,
  },
  {
    id: 'gemini-2.5-pro',
    providerId: 'google_gemini',
    name: 'Gemini 2.5 Pro',
    description: 'Advanced reasoning and cross-modal synthesis for high-complexity workflows.',
    contextWindow: 2097152,
    maxOutputTokens: 8192,
    capabilities: ['text', 'chat', 'vision', 'tool_calling', 'streaming', 'reasoning', 'document_analysis'],
  },
  // OpenAI
  {
    id: 'gpt-4o',
    providerId: 'openai',
    name: 'GPT-4o',
    description: 'Versatile omni model for general multi-turn reasoning and tool orchestration.',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    capabilities: ['text', 'chat', 'vision', 'tool_calling', 'streaming'],
  },
  {
    id: 'o3-mini',
    providerId: 'openai',
    name: 'o3-mini',
    description: 'High-speed reasoning model tailored for math, coding, and STEM.',
    contextWindow: 200000,
    maxOutputTokens: 100000,
    capabilities: ['text', 'chat', 'streaming', 'reasoning'],
  },
  // Anthropic
  {
    id: 'claude-3-7-sonnet',
    providerId: 'anthropic',
    name: 'Claude 3.7 Sonnet',
    description: 'Hybrid reasoning model with adjustable thinking time and top-tier code quality.',
    contextWindow: 200000,
    maxOutputTokens: 64000,
    capabilities: ['text', 'chat', 'vision', 'tool_calling', 'streaming', 'reasoning', 'document_analysis'],
  },
  // DeepSeek
  {
    id: 'deepseek-r1',
    providerId: 'deepseek',
    name: 'DeepSeek R1',
    description: 'Open-weights reasoning model with fully exposed chain-of-thought verification.',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'chat', 'streaming', 'reasoning'],
  },
  // xAI
  {
    id: 'grok-2',
    providerId: 'xai',
    name: 'Grok 2',
    description: 'Real-time knowledge and unfiltered reasoning model.',
    contextWindow: 131072,
    maxOutputTokens: 8192,
    capabilities: ['text', 'chat', 'vision', 'streaming'],
  },
  // Ollama (Local)
  {
    id: 'llama-3.3-70b-instruct',
    providerId: 'ollama',
    name: 'Llama 3.3 70B (Local)',
    description: 'Local on-premise execution with zero data egress and complete user sovereignty.',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    capabilities: ['text', 'chat', 'tool_calling', 'streaming'],
  },
];
