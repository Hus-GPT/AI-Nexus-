/**
 * AI Nexus - Core Domain Type System
 * Strict provider-agnostic domain contracts.
 */

export type SupportedLocale = 'en' | 'ar';
export type AppTheme = 'dark' | 'light';
export type UIMode = 'simple' | 'advanced';

export type NavigationSection =
  | 'overview'
  | 'conversations'
  | 'projects'
  | 'assistants'
  | 'files'
  | 'tasks'
  | 'tools'
  | 'memory'
  | 'search'
  | 'accounts'
  | 'audit'
  | 'settings';

// -----------------------------------------------------------------------------
// AI Provider & Model Abstraction
// -----------------------------------------------------------------------------

export type ProviderId =
  | 'google_gemini'
  | 'openai'
  | 'anthropic'
  | 'xai'
  | 'deepseek'
  | 'ollama'
  | 'openrouter'
  | 'custom_openai_compatible';

export type ModelCapability =
  | 'text'
  | 'chat'
  | 'vision'
  | 'audio_input'
  | 'audio_output'
  | 'tool_calling'
  | 'streaming'
  | 'reasoning'
  | 'document_analysis';

export interface AIModel {
  id: string;
  providerId: ProviderId;
  name: string;
  description: string;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: ModelCapability[];
  pricing?: {
    inputPer1k: number;
    outputPer1k: number;
    currency: string;
  };
  isDefault?: boolean;
}

export interface ProviderAccount {
  id: string;
  providerId: ProviderId;
  accountLabel: string;
  apiKeyMasked: string; // e.g. "sk-...ab42"
  customBaseUrl?: string;
  organizationId?: string;
  isValidated: boolean;
  isActive: boolean;
  createdAt: string;
  lastValidatedAt?: string;
}

// -----------------------------------------------------------------------------
// Conversations & Multi-Model Execution
// -----------------------------------------------------------------------------

export type ResponseStatus = 'idle' | 'queued' | 'streaming' | 'completed' | 'error' | 'stopped';

export interface ModelResponseItem {
  id: string;
  providerId: ProviderId;
  modelId: string;
  modelName: string;
  status: ResponseStatus;
  content: string;
  reasoningContent?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
  error?: string;
  citations?: Array<{ title: string; url: string; snippet?: string }>;
  createdAt: string;
  completedAt?: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'system';
  content: string;
  attachedFileIds?: string[];
  targetedModelIds: string[]; // manual multi-model targeting
  responses: ModelResponseItem[]; // vertical stack of model responses
  contextForwardingConfig?: {
    includePriorTurns: boolean;
    includeCrossModelResponses: boolean;
    maxHistoryTurns?: number;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId?: string;
  assistantId?: string;
  title: string;
  activeModelIds: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseSynthesisRequest {
  targetModelId: string;
  sourceResponseIds: string[];
  instruction: string; // e.g., "Synthesize the strengths of each model into one unified actionable answer."
}

// -----------------------------------------------------------------------------
// Projects, Assistants & Files
// -----------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  customInstructions?: string;
  conversationCount: number;
  fileCount: number;
  assistantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  projectId?: string;
  name: string;
  avatarIcon: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  preferredModelId: string;
  fallbackModelId?: string;
  enabledToolIds: string[];
  knowledgeFileIds: string[];
  memoryEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  projectId?: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  storageUri: string;
  isAnalyzed: boolean;
  summary?: string;
  createdAt: string;
}

export interface GeneratedArtifact {
  id: string;
  conversationId?: string;
  taskId?: string;
  title: string;
  type: 'code' | 'markdown' | 'document' | 'svg' | 'json';
  language?: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Memory System
// -----------------------------------------------------------------------------

export type MemoryScope = 'user' | 'project' | 'assistant' | 'conversation';

export interface MemoryItem {
  id: string;
  scope: MemoryScope;
  scopeId?: string;
  key: string;
  content: string;
  importance: 'low' | 'medium' | 'high';
  isUserVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Tasks & Multi-Step Orchestration
// -----------------------------------------------------------------------------

export type TaskStatus = 'queued' | 'running' | 'paused' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';
export type StepStatus = 'pending' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'skipped';

export interface TaskStep {
  id: string;
  stepNumber: number;
  title: string;
  actionType: 'reason' | 'tool_call' | 'web_search' | 'generate_artifact' | 'model_synthesis';
  status: StepStatus;
  assignedModelId?: string;
  requiresApproval: boolean;
  approvalGranted?: boolean;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  errorMessage?: string;
  executedAt?: string;
}

export interface LongRunningTask {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  currentStepIndex: number;
  steps: TaskStep[];
  artifactsProducedIds: string[];
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Tools, Integrations & Security Permissions
// -----------------------------------------------------------------------------

export type ToolAuthType = 'none' | 'api_key' | 'oauth' | 'mcp' | 'webhook' | 'custom_adapter';

export type ToolPermissionPolicy =
  | 'always_ask'                // User must approve each execution
  | 'session_approved'          // Approved for the current browser session only
  | 'scoped_permanent_grant'    // Persistent permission strictly limited to a defined scope (e.g. read-only folder)
  | 'blocked';                  // Forbidden by policy (no unrestricted execution mode exists)

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'web' | 'developer' | 'productivity' | 'custom_mcp';
  authType: ToolAuthType;
  permissionPolicy: ToolPermissionPolicy;
  isConfigured: boolean;
  parametersSchema: Record<string, unknown>;
}

export interface ToolExecutionApprovalRequest {
  id: string;
  toolId: string;
  toolName: string;
  actionDescription: string;
  parameters: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedAt: string;
}

// -----------------------------------------------------------------------------
// Independent Web Search
// -----------------------------------------------------------------------------

export interface WebSearchQuery {
  id: string;
  query: string;
  userApproved: boolean;
  provider: 'brave' | 'google_custom' | 'tavily' | 'serpapi';
  status: 'pending_approval' | 'searching' | 'completed' | 'rejected';
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
    publishedDate?: string;
  }>;
  summaryBrief?: string;
}

// -----------------------------------------------------------------------------
// Audit Logging & Security
// -----------------------------------------------------------------------------

export type AuditSeverity = 'info' | 'warning' | 'security_event' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'user' | 'system' | 'orchestrator';
  action:
    | 'api_key_added'
    | 'api_key_removed'
    | 'tool_approval_granted'
    | 'tool_approval_denied'
    | 'search_approved'
    | 'search_denied'
    | 'data_exported'
    | 'data_imported'
    | 'task_resumed'
    | 'memory_updated'
    | 'context_forwarded';
  severity: AuditSeverity;
  targetEntity: string;
  details: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Notification System
// -----------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval_required';
  read: boolean;
  createdAt: string;
  actionLink?: {
    section: NavigationSection;
    entityId?: string;
  };
}
