import { AIModel, ModelCapability, ProviderAccount, ProviderId } from '../../types';

export interface CompletionMessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  modelId: string;
  messages: CompletionMessagePayload[];
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  stopSequences?: string[];
}

export interface StreamChunk {
  textDelta: string;
  reasoningDelta?: string;
  isComplete: boolean;
  tokenCountDelta?: number;
  error?: string;
}

export interface CompletionResult {
  content: string;
  reasoningContent?: string;
  modelId: string;
  providerId: ProviderId;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

export interface IAIProviderAdapter {
  readonly providerId: ProviderId;
  readonly providerName: string;
  readonly supportedCapabilities: ModelCapability[];

  validateCredentials(account: ProviderAccount, secretKey: string): Promise<{ valid: boolean; message?: string }>;
  listAvailableModels(account: ProviderAccount, secretKey: string): Promise<AIModel[]>;
  generateCompletion(request: CompletionRequest, account: ProviderAccount, secretKey: string): Promise<CompletionResult>;
  streamCompletion(
    request: CompletionRequest,
    account: ProviderAccount,
    secretKey: string,
    onChunk: (chunk: StreamChunk) => void,
    abortSignal?: AbortSignal
  ): Promise<CompletionResult>;
  estimateTokens(text: string, modelId: string): number;
}
