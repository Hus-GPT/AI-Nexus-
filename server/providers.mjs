const PROVIDER_DEFAULTS = {
  google_gemini: { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  anthropic: { name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1' },
  xai: { name: 'xAI', baseUrl: 'https://api.x.ai/v1' },
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1' },
  openrouter: { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
  custom_openai_compatible: { name: 'OpenAI-compatible', baseUrl: null },
};

export function catalogModels() {
  return Object.entries(PROVIDER_DEFAULTS).map(([id, value]) => ({
    id: `${id}:dynamic`, providerId: id, name: `${value.name} — connected models`,
    description: 'Models are discovered from the connected account.', capabilities: ['chat'], dynamic: true,
  }));
}

async function parseJson(response, fallback) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || body?.error?.type || `${fallback} (HTTP ${response.status})`);
  return body;
}

function openAIRequest(baseUrl, apiKey, model, messages, options = {}) {
  return fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: options.temperature ?? 0.7, max_tokens: options.maxTokens }),
  });
}

async function parseOpenAIResponse(response) {
  const body = await parseJson(response, 'Provider request failed');
  return { content: body?.choices?.[0]?.message?.content || '', usage: body?.usage };
}

async function gemini(model, apiKey, messages, options = {}) {
  const contents = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const system = messages.find((m) => m.role === 'system');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents, ...(system ? { systemInstruction: { parts: [{ text: system.content }] } } : {}), generationConfig: { temperature: options.temperature ?? 0.7, maxOutputTokens: options.maxTokens ?? 4096 } }),
  });
  const body = await parseJson(response, 'Gemini request failed');
  return { content: body?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '', usage: body?.usageMetadata };
}

async function anthropic(model, apiKey, messages, options = {}) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: options.maxTokens ?? 4096, ...(system ? { system } : {}), messages: messages.filter((m) => m.role !== 'system') }),
  });
  const body = await parseJson(response, 'Anthropic request failed');
  return { content: body?.content?.map((p) => p.text || '').join('') || '', usage: body?.usage };
}

export async function listModels({ providerId, apiKey, baseUrl }) {
  if (providerId === 'google_gemini') {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', { headers: { 'x-goog-api-key': apiKey } });
    const body = await parseJson(response, 'Gemini model discovery failed');
    return (body.models || []).filter((m) => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')).map((m) => ({ id: String(m.name || '').replace(/^models\//, ''), name: m.displayName || m.name, providerId, description: m.description || '', inputTokenLimit: m.inputTokenLimit, outputTokenLimit: m.outputTokenLimit }));
  }
  const url = baseUrl || PROVIDER_DEFAULTS[providerId]?.baseUrl;
  if (!url) throw new Error('A provider base URL is required.');
  if (providerId === 'anthropic') {
    const response = await fetch(`${url.replace(/\/$/, '')}/models`, { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } });
    const body = await parseJson(response, 'Anthropic model discovery failed');
    return (body.data || []).map((m) => ({ id: m.id, name: m.display_name || m.id, providerId, inputTokenLimit: m.max_input_tokens, outputTokenLimit: m.max_tokens }));
  }
  const response = await fetch(`${url.replace(/\/$/, '')}/models`, { headers: { authorization: `Bearer ${apiKey}` } });
  const body = await parseJson(response, 'Model discovery failed');
  return (body.data || []).map((m) => ({ id: m.id, name: m.id, providerId, ownedBy: m.owned_by, capabilities: ['chat'] }));
}

export async function testConnection({ providerId, apiKey, baseUrl }) {
  const models = await listModels({ providerId, apiKey, baseUrl });
  return { ok: true, providerId, modelCount: models.length, models };
}

export async function complete({ providerId, model, apiKey, baseUrl, messages, options }) {
  const started = Date.now();
  let result;
  if (providerId === 'google_gemini') result = await gemini(model, apiKey, messages, options);
  else if (providerId === 'anthropic') result = await anthropic(model, apiKey, messages, options);
  else if (['openai', 'xai', 'deepseek', 'openrouter', 'custom_openai_compatible'].includes(providerId)) {
    const url = baseUrl || PROVIDER_DEFAULTS[providerId]?.baseUrl;
    if (!url) throw new Error('An OpenAI-compatible base URL is required.');
    result = await parseOpenAIResponse(await openAIRequest(url, apiKey, model, messages, options));
  } else throw new Error(`Unsupported provider: ${providerId}`);
  return { ...result, modelId: model, providerId, latencyMs: Date.now() - started };
}

export async function completeMany(requests) {
  const results = await Promise.allSettled(requests.map((request) => complete(request)));
  return results.map((result, index) => result.status === 'fulfilled'
    ? { ok: true, requestIndex: index, ...result.value }
    : { ok: false, requestIndex: index, error: result.reason?.message || 'Provider request failed.' });
}
