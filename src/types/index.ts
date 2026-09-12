export type SupportedLocale = 'en' | 'ar';
export type AppTheme = 'dark' | 'light';
export type UIMode = 'simple' | 'advanced';
export type NavigationSection = 'overview' | 'conversations' | 'projects' | 'assistants' | 'files' | 'tasks' | 'tools' | 'memory' | 'search' | 'accounts' | 'audit' | 'settings';
export type ProviderId = 'google_gemini' | 'openai' | 'anthropic' | 'xai' | 'deepseek' | 'ollama' | 'openrouter' | 'custom_openai_compatible';
export type ModelCapability = 'text' | 'chat' | 'vision' | 'audio_input' | 'audio_output' | 'tool_calling' | 'streaming' | 'reasoning' | 'document_analysis';
export interface AIModel { id:string; providerId:ProviderId; name:string; description:string; contextWindow:number; maxOutputTokens:number; capabilities:ModelCapability[]; pricing?:{inputPer1k:number;outputPer1k:number;currency:string}; isDefault?:boolean; accountId?:string; }
export interface ProviderAccount { id:string; providerId:ProviderId; accountLabel:string; apiKeyMasked:string; baseUrl?:string|null; isValidated:boolean; isActive:boolean; createdAt:string; updatedAt?:string; lastValidatedAt?:string; }
export type ResponseStatus = 'idle'|'queued'|'streaming'|'completed'|'error'|'stopped';
export interface ModelResponseItem { id:string; providerId:ProviderId; modelId:string; modelName:string; status:ResponseStatus; content:string; reasoningContent?:string; tokenUsage?:{promptTokens:number;completionTokens:number;totalTokens:number}; latencyMs?:number; error?:string; citations?:Array<{title:string;url:string;snippet?:string}>; createdAt:string; completedAt?:string; }
export interface ConversationMessage { id:string; conversationId:string; sender:'user'|'system'; content:string; attachedFileIds?:string[]; targetedModelIds:string[]; responses:ModelResponseItem[]; contextForwardingConfig?:{includePriorTurns:boolean;includeCrossModelResponses:boolean;maxHistoryTurns?:number}; createdAt:string; }
export interface Conversation { id:string; projectId?:string; assistantId?:string; title:string; activeModelIds:string[]; isPinned:boolean; isArchived:boolean; createdAt:string; updatedAt:string; }
export interface ResponseSynthesisRequest { targetModelId:string; sourceResponseIds:string[]; instruction:string; }
export interface Project { id:string; name:string; description:string; color:string; icon:string; customInstructions?:string; conversationCount:number; fileCount:number; assistantCount:number; createdAt:string; updatedAt:string; }
export interface Assistant { id:string; projectId?:string; name:string; avatarIcon:string; description:string; systemPrompt:string; temperature:number; preferredModelId:string; fallbackModelId?:string; enabledToolIds:string[]; knowledgeFileIds:string[]; memoryEnabled:boolean; createdAt:string; updatedAt:string; }
export interface FileItem { id:string; projectId?:string; name:string; sizeBytes:number; mimeType:string; storageUri:string; isAnalyzed:boolean; summary?:string; createdAt:string; }
export interface GeneratedArtifact { id:string; conversationId?:string; taskId?:string; title:string; type:'code'|'markdown'|'document'|'svg'|'json'; language?:string; content:string; version:number; createdAt:string; updatedAt:string; }
export type MemoryScope='user'|'project'|'assistant'|'conversation';
export interface MemoryItem { id:string; scope:MemoryScope; scopeId?:string; key:string; content:string; importance:'low'|'medium'|'high'; isUserVerified:boolean; isActive:boolean; createdAt:string; updatedAt:string; }
export type TaskStatus='queued'|'running'|'paused'|'awaiting_approval'|'completed'|'failed'|'cancelled';
export type StepStatus='pending'|'running'|'awaiting_approval'|'completed'|'failed'|'skipped';
export interface TaskStep { id:string; stepNumber:number; title:string; actionType:'reason'|'tool_call'|'web_search'|'generate_artifact'|'model_synthesis'; status:StepStatus; assignedModelId?:string; requiresApproval:boolean; approvalGranted?:boolean; inputData?:Record<string,unknown>; outputData?:Record<string,unknown>; errorMessage?:string; executedAt?:string; }
export interface LongRunningTask { id:string; projectId?:string; title:string; description:string; status:TaskStatus; currentStepIndex:number; steps:TaskStep[]; artifactsProducedIds:string[]; createdAt:string; updatedAt:string; }
export type ToolAuthType='none'|'api_key'|'oauth'|'mcp'|'webhook'|'custom_adapter';
export type ToolPermissionPolicy='always_ask'|'session_approved'|'scoped_permanent_grant'|'blocked';
export interface ToolDefinition { id:string; name:string; description:string; category:'system'|'web'|'developer'|'productivity'|'custom_mcp'; authType:ToolAuthType; permissionPolicy:ToolPermissionPolicy; isConfigured:boolean; parametersSchema:Record<string,unknown>; }
export interface ToolExecutionApprovalRequest { id:string; toolId:string; toolName:string; actionDescription:string; parameters:Record<string,unknown>; riskLevel:'low'|'medium'|'high'|'critical'; requestedAt:string; }
export interface WebSearchQuery { id:string; query:string; userApproved:boolean; provider:'brave'|'google_custom'|'tavily'|'serpapi'; status:'pending_approval'|'searching'|'completed'|'rejected'; results?:Array<{title:string;url:string;snippet:string;publishedDate?:string}>; summaryBrief?:string; }
export type AuditSeverity='info'|'warning'|'security_event'|'critical';
export interface AuditLogEntry { id:string; timestamp:string; actor:'user'|'system'|'orchestrator'; action:string; severity:AuditSeverity; targetEntity:string; details:Record<string,unknown>; }
export interface AppNotification { id:string; title:string; message:string; type:'info'|'success'|'warning'|'error'|'approval_required'; read:boolean; createdAt:string; actionLink?:{section:NavigationSection;entityId?:string}; }
